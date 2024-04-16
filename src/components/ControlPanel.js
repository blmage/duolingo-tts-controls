import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useInterval, useMedia, useStateRef, useThrottledCallback, useTimeoutFn, useUnmount } from 'preact-use';
import { useHotkeys as useBaseHotkeys } from 'react-hotkeys-hook';
import { _, lift } from 'one-liner.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isFunction, isObject, noop } from 'duo-toolbox/utils/functions';
import { discardEvent } from 'duo-toolbox/utils/ui';
import { SOUND_SPEED_NORMAL } from 'duo-toolbox/duo/sounds';
import { DIGIT_CHARS, EXTENSION_PREFIX, FORM_STYLE_BASIC } from '../constants';

import {
  applyTtsSettingsToHowlSound,
  getHowlPosition,
  getTtsMaxRate,
  getTtsMaxVolume,
  getTtsMinRate,
  getTtsMinVolume,
  isUnstableHowl,
  POSITION_STEP,
  RATE_STEP,
  useTtsRate,
  useTtsVolume,
  VOLUME_STEP,
} from '../tts';

import { BASE, useStyles } from './index';
import ControlButton, * as buttons from './ControlButton';
import ControlSlider, * as sliders from './ControlSlider';

const ControlPanel =
  ({
     formStyle = FORM_STYLE_BASIC,
     ttsSpeed = SOUND_SPEED_NORMAL,
     selected = false,
     focused = false,
     howl = null,
   }) => {
    const [ rate, rateRef, setRate ] = useTtsRate(ttsSpeed);
    const [ volume, volumeRef, setVolume ] = useTtsVolume(ttsSpeed);
    const [ duration, setDuration ] = useState(0.0);
    const [ position, positionRef, setPosition ] = useStateRef(0.0);
    const [ isPlaying, isPlayingRef, setIsPlaying ] = useStateRef(false);
    const [ isPaused, isPausedRef, setIsPaused ] = useStateRef(false);
    const startPosition = useRef(0.0);

    // Returns whether the sound is currently on hold, because it is stopped or paused.
    const isOnHold = useCallback(
      () => !isPlayingRef.current || isPausedRef.current,
      [ isPlayingRef, isPausedRef ]
    );

    const [ isHovered, setIsHovered ] = useState(false);
    const [ isToggled, setIsToggled ] = useState(false);
    const [ isExpanded, setIsExpanded ] = useState(false);

    const [ , cancelPanelHover, hoverPanel ] = useTimeoutFn(() => setIsHovered(true), 200, false);

    const unHoverPanel = useCallback(() => {
      setIsHovered(false);
      cancelPanelHover();
    }, [ setIsHovered, cancelPanelHover ]);

    const [ , cancelPanelCollapse, collapsePanel ] = useTimeoutFn(() => setIsExpanded(false), 750, false);

    const expandPanel = useCallback(() => {
      setIsExpanded(true);
      cancelPanelCollapse();
    }, [ setIsExpanded, cancelPanelCollapse ]);

    // ------ Rate / volume settings ------

    // Applies some playback settings to a "Howl" object.
    const applyPlaybackSettings = useThrottledCallback(
      (howl, rate, volume) => howl && applyTtsSettingsToHowlSound(rate, volume, howl),
      { delay: 50, defer: true },
      howl
    );

    // Sets and applies a new playback rate.
    const onRateChange = useCallback(rate => {
      setRate(rate);
      applyPlaybackSettings(rate, volumeRef.current);
    }, [ volumeRef, setRate, applyPlaybackSettings ]);

    // Sets and applies a new playback volume.
    const onVolumeChange = useCallback(volume => {
      setVolume(volume);
      applyPlaybackSettings(rateRef.current, volume);
    }, [ rateRef, setVolume, applyPlaybackSettings ]);

    // ------ Position seeking ------

    const userPosition = useRef(null);
    const hasUserStopped = useRef(false);

    // Returns a valid position in the current sound, rounded to one decimal place.
    const getValidPosition = useCallback(raw => {
      const position = Math.round(Number(raw) * 10) / 10;
      return isNaN(position) ? null : Math.max(0.0, Math.min(position, duration));
    }, [ duration ]);

    // Sets the new sound position as if it originates from the sound playback.
    const setPlayPosition = useCallback(position => {
      setPosition(position);
      userPosition.current = null;
    }, [ setPosition, userPosition ]);

    // Sets the new sound position as if it originates from a user action.
    const setUserPosition = useCallback(position => {
      setPosition(position);
      userPosition.current = position;
    }, [ setPosition, userPosition ]);

    const activeSeekActions = useRef(new Set());
    const wasPlayingBeforeSeeking = useRef(false);

    // Returns whether at least one seeking action is going on at the moment.
    const isSeeking = useCallback(
      () => (activeSeekActions.current.size > 0),
      [ activeSeekActions ]
    );

    // Sets and applies a new sound position.
    const onSeek = useCallback(raw => {
      const position = getValidPosition(raw);

      if (null !== position) {
        let isNextStartPosition;

        if (isSeeking()) {
          isNextStartPosition = !wasPlayingBeforeSeeking.current;
        } else {
          howl && howl.seek(position);
          isNextStartPosition = isOnHold();
        }

        isNextStartPosition ? setUserPosition(position) : setPlayPosition(position);
      }

      return position;
    }, [
      howl,
      getValidPosition,
      setPlayPosition,
      setUserPosition,
      isOnHold,
      isSeeking,
      wasPlayingBeforeSeeking,
    ]);

    // Handles the start of a long-running seek action.
    const onLongSeekStart = useCallback((action, raw) => {
      activeSeekActions.current.add(action);
      onSeek(raw);

      if (1 === activeSeekActions.current.size) {
        // We just started a long-running seek: pause the sound if it's playing, and remember its state.
        if (howl && isPlaying) {
          wasPlayingBeforeSeeking.current = !isPaused;
          howl.pause();
        } else {
          wasPlayingBeforeSeeking.current = false;
        }
      }
    }, [ howl, isPlaying, isPaused, activeSeekActions, wasPlayingBeforeSeeking, onSeek ]);

    // Handles the end of a long-running seek action.
    const onLongSeekEnd = useCallback((action, raw) => {
      activeSeekActions.current.delete(action);
      const position = onSeek(raw);

      if (0 === activeSeekActions.current.size) {
        // This was the last long-running seek action: restore the initial sound state.
        if (howl) {
          (null !== position) && howl.seek(position);

          if (wasPlayingBeforeSeeking.current) {
            hasStartedPlayback.current = true;
            howl.play();
          }
        }

        wasPlayingBeforeSeeking.current = false;
      }
    }, [ howl, activeSeekActions, wasPlayingBeforeSeeking, onSeek ]);

    // ------ Sound actions ------

    // Plays the sound, if appropriate in the current context.
    const hasStartedPlayback = useRef(false);

    const play = useCallback(() => {
      if (howl && !isSeeking()) {
        hasStartedPlayback.current = true;
        howl.play();
      }
    }, [ howl, isSeeking ]);

    // Pauses the sound.
    const pause = useCallback(() => {
      if (howl) {
        howl.pause();

        // On Firefox, the readyState of the <audio> node gets stuck on "2" when paused near the end.
        // Seeking to the current position allows working around this.
        const position = getHowlPosition(howl);

        if (position >= duration - 0.2) {
          howl.seek(position);
        }
      }
    }, [ howl, duration ]);

    // Stops the sound.
    const stop = useCallback(() => {
      if (howl) {
        hasUserStopped.current = true;
        howl.stop()
      }
    }, [ howl ]);

    // Remembers the current playback position as the new starting position.
    const pinStart = useCallback(() => {
      const start = getValidPosition(positionRef.current);
      (null !== start) && (startPosition.current = start);
    }, [ positionRef, startPosition, getValidPosition ]);

    // ------ Keyboard shortcuts ------

    const useHotkeys = ({ keys, onKeyDown = null, onKeyUp = null, deps = [] }) => useBaseHotkeys(
      keys,
      (keyboardEvent, hotkeysEvent) => {
        discardEvent(keyboardEvent);
        keyboardEvent.stopImmediatePropagation();

        if (keyboardEvent.type === 'keyup') {
          onKeyUp(hotkeysEvent.shortcut, keyboardEvent);
        } else {
          onKeyDown(hotkeysEvent.shortcut, keyboardEvent);
        }
      },
      {
        enabled: focused,
        enableOnTags: [ 'INPUT' ],
        keyup: isFunction(onKeyUp),
        keydown: isFunction(onKeyDown),
      },
      deps
    );

    const useExpandingHotkeys = ({ keys, onKeyDown = noop, onKeyUp = noop, deps = [] }) => useHotkeys({
      keys,
      onKeyDown: (shortcut, event) => {
        expandPanel();
        onKeyDown(shortcut, event);
      },
      onKeyUp: (shortcut, event) => {
        collapsePanel();
        onKeyUp(shortcut, event);
      },
      deps: deps.concat(expandPanel, collapsePanel),
    });

    useExpandingHotkeys({
      keys: '<, ctrl+left, >, ctrl+right',
      onKeyDown: shortcut => [ '<', 'ctrl+left' ].includes(shortcut)
        ? (rateRef.current > getTtsMinRate(ttsSpeed)) && onRateChange(rateRef.current - RATE_STEP)
        : (rateRef.current < getTtsMaxRate(ttsSpeed)) && onRateChange(rateRef.current + RATE_STEP),
      deps: [ ttsSpeed, rateRef, onRateChange ],
    });

    useExpandingHotkeys({
      keys: 'down, up',
      onKeyDown: key => ('down' === key)
        ? (volumeRef.current > getTtsMinVolume()) && onVolumeChange(volumeRef.current - VOLUME_STEP)
        : (volumeRef.current < getTtsMaxVolume()) && onVolumeChange(volumeRef.current + VOLUME_STEP),
      deps: [ volumeRef, onVolumeChange ],
    });

    useExpandingHotkeys({
      keys: '0, home, end',
      onKeyDown: key => onSeek('end' === key ? duration : 0),
      deps: [ duration, onSeek ],
    });

    useExpandingHotkeys({
      keys: DIGIT_CHARS.map(lift(`num_${_}`)).join(','),
      onKeyDown: key => {
        const digit = key.match(/num_(\d+)/)?.[1] || 0;
        onSeek(getValidPosition(duration * Number(digit) / 10));
      },
      deps: [ duration, getValidPosition, onSeek ],
    });

    useExpandingHotkeys({
      keys: 'left, right',
      onKeyDown: (key, event) => {
        const position = 'left' === key
          ? Math.max(0.0, positionRef.current - POSITION_STEP)
          : Math.min(duration, positionRef.current + POSITION_STEP);

        if (!event.repeat) {
          onLongSeekStart(key, position);
        } else if (position !== positionRef.current) {
          onSeek(position);
        }
      },
      onKeyUp: key => {
        (null !== positionRef.current) && onLongSeekEnd(key, positionRef.current);
      },
      deps: [ duration, positionRef, onSeek, onLongSeekStart, onLongSeekEnd ],
    });

    useHotkeys({
      keys: 'k, space, ctrl+up',
      onKeyDown: () => (!isPlaying || isPaused) ? play() : pause(),
      deps: [ isPlaying, isPaused, play, pause ],
    });

    useHotkeys({
      keys: 'p, ctrl+down',
      onKeyDown: () => pinStart(),
      deps: [ pinStart ],
    });

    // ------ Sound state handling ------

    const hasSeekedSound = useRef(false);

    // Re-initialize the sound data when the "Howl" object becomes available (or changes).
    // Register the dependency-less "Howl" listeners.
    useEffect(() => {
      if (howl) {
        const isPlaying = howl.playing();
        const position = getHowlPosition(howl);

        setDuration(howl.duration());
        setPlayPosition(position || 0.0);
        setIsPlaying(isPlaying);
        setIsPaused(!isPlaying && (position > 0.0));

        const onHowlLoaded = function () {
          setDuration(this.duration());
        };

        // When the sound is played, registers the new state,
        // and tries to work around some quirks from the underlying audio library.
        const onHowlPlay = function (soundId) {
          if (
            !hasSeekedSound.current
            // Make sure to start at the right position when:
            // - playback is started using the original button,
            // - the "Howl" object uses multiple sounds, because we can't be sure that any seek()
            //   we applied in onHowlStop() has taken effect on the sound that has just started.
            && (!hasStartedPlayback.current || isUnstableHowl(this))
          ) {
            hasSeekedSound.current = true;
            this.seek(positionRef.current, soundId);
          } else {
            // seek() triggers both pause() and play(), so the "unstable" case will end up here too.
            setIsPlaying(true);
            setIsPaused(false);
            userPosition.current = null;
            hasSeekedSound.current = false;
            hasStartedPlayback.current = false;
          }
        };

        // When the sound is paused, registers the new state, and remembers the current position as user-defined.
        const onHowlPause = () => {
          setIsPaused(true);
          userPosition.current = getHowlPosition(howl);
        };

        howl.once('load', onHowlLoaded);
        howl.on('play', onHowlPlay);
        howl.on('pause', onHowlPause);

        return () => {
          if (howl) {
            howl.off('load', onHowlLoaded);
            howl.off('play', onHowlPlay);
            howl.off('pause', onHowlPause);
          }
        };
      }
    }, [
      howl,
      rateRef,
      positionRef,
      setDuration,
      setPlayPosition,
      setIsPlaying,
      setIsPaused,
      userPosition,
      hasSeekedSound,
    ]);

    const isResettingSound = useRef(false);

    // When the sound is stopped, registers the new state, and resets the position to whichever is the most relevant.
    const onHowlStop = useCallback(function () {
      if (isResettingSound.current) {
        // Do not interfere with the sound cleanup when we're unmounting.
        return;
      }

      // The user-defined position is used to provide a better behavior for the original playback buttons,
      // which always stop the sounds prior to (re)playing them:
      // when the last action was the user pausing the sound, or changing the position when not playing,
      // start back from where we were rather than from the pinned position (or from zero).
      // This only holds if the user did not stop the sound himself or chose the last decisecond.
      const newPosition =
        hasUserStopped.current
        || (null === userPosition.current)
        || (userPosition.current >= duration)
          ? startPosition.current
          : userPosition.current;

      if (hasUserStopped.current) {
        userPosition.current = null;
        hasUserStopped.current = false;
      }

      setIsPlaying(false);
      setPosition(newPosition);

      this.seek(newPosition);
    }, [ duration, setIsPlaying, startPosition, userPosition, hasUserStopped, setPosition, isResettingSound ]);

    // Register the dependent "Howl" listeners.
    useEffect(() => {
      if (howl) {
        howl.on('end', onHowlStop);
        howl.on('stop', onHowlStop);

        return () => {
          howl.off('end', onHowlStop);
          howl.off('stop', onHowlStop);
        };
      }
    }, [ howl, onHowlStop ]);

    // When unmounting, reset the position of the sound in case it might be used again later
    // (if the user gave a wrong answer, eg, or if the TTS is used by some other challenges).
    useUnmount(() => {
      if (howl) {
        isResettingSound.current = true;
        howl.stop();
        howl.seek(0);
      }
    });

    // Regularly refresh the position when the sound is being played.
    useInterval(() => {
      if (howl && howl.playing()) {
        const playPosition = getHowlPosition(howl);

        // Only change the position when relevant / appropriate.
        if (
          !isPaused
          && (playPosition !== position)
          && (playPosition !== userPosition.current)
        ) {
          setPlayPosition(playPosition);
        }
      }
    }, isPlaying && !isPaused ? 75 : null);

    const hasSound = isObject(howl);

    const rateHint = 1 === rate
      ? '1x'
      : `${rate.toFixed(1)}x`;

    const positionHint = !hasSound
      ? '? / ?'
      : `${position.toFixed(1)}s / ${duration.toFixed(1)}s`;

    const isTouchDevice = useMedia('(hover: none), (pointer: none), (pointer: coarse)');

    const wrapperStates = [
      focused && WRAPPER__FOCUSED,
      selected && WRAPPER__SELECTED,
      (isExpanded || isToggled || (isHovered && !isTouchDevice)) && WRAPPER__OPENED,
    ];

    const getElementClassNames = useStyles(CLASS_NAMES, [ formStyle ]);

    return (
      <div
        onMouseEnter={hoverPanel}
        onMouseLeave={unHoverPanel}
        className={getElementClassNames([ WRAPPER, ...wrapperStates ])}
      >
        <div className={getElementClassNames(BUTTONS_WRAPPER)}>
          {!isPlaying || isPaused
            ? (
              <ControlButton
                type={buttons.TYPE_PLAY}
                disabled={!hasSound}
                onClick={play}
              />
            ) : (
              <ControlButton
                type={buttons.TYPE_PAUSE}
                disabled={!hasSound}
                onClick={pause}
              />
            )}

          <ControlButton
            type={buttons.TYPE_STOP}
            disabled={!hasSound || !isPlaying}
            onClick={stop}
          />

          <ControlButton
            type={buttons.TYPE_PIN}
            disabled={!hasSound}
            onClick={pinStart}
          />

          <ControlButton
            type={buttons.TYPE_TOGGLE}
            active={isToggled}
            onClick={() => setIsToggled(!isToggled)}
          />

          {(selected || focused) && (
            <FontAwesomeIcon icon="keyboard" className={getElementClassNames(KEYBOARD_HINT)} />
          )}
        </div>

        <ControlSlider
          type={sliders.TYPE_POSITION}
          value={position}
          min={0.0}
          max={duration}
          step={POSITION_STEP}
          hint={positionHint}
          disabled={!hasSound}
          onChangeStart={onLongSeekStart('slider', _)}
          onChange={onSeek}
          onChangeEnd={onLongSeekEnd('slider', _)}
        />

        <ControlSlider
          type={sliders.TYPE_RATE}
          value={rate}
          min={getTtsMinRate(ttsSpeed)}
          max={getTtsMaxRate(ttsSpeed)}
          step={RATE_STEP}
          hint={rateHint}
          onChangeStart={onRateChange}
          onChange={onRateChange}
          onChangeEnd={onRateChange}
        />

        <ControlSlider
          type={sliders.TYPE_VOLUME}
          value={volume}
          min={getTtsMinVolume()}
          max={getTtsMaxVolume()}
          step={VOLUME_STEP}
          hint={`${Math.round(volume * 100.0)}%`}
          onChangeStart={onVolumeChange}
          onChange={onVolumeChange}
          onChangeEnd={onVolumeChange}
        />
      </div>
    );
  };

export default ControlPanel;

const WRAPPER = 'wrapper';
const WRAPPER__SELECTED = 'wrapper__selected';
const WRAPPER__FOCUSED = 'wrapper__focused';
const WRAPPER__OPENED = 'wrapper__opened';
const BUTTONS_WRAPPER = 'button_wrapper';
const KEYBOARD_HINT = 'keyboard_hint';

const CLASS_NAMES = {
  [BASE]: Object.assign(
    {
      [WRAPPER]: [
        `${EXTENSION_PREFIX}control-panel`,
      ],
      [WRAPPER__SELECTED]: [
        `${EXTENSION_PREFIX}selected`,
      ],
      [WRAPPER__FOCUSED]: [
        `${EXTENSION_PREFIX}focused`,
      ],
      [WRAPPER__OPENED]: [
        // Copied from the text answer field. Only the class responsible for the background and border is used here.
        '_3zGeZ',
        `${EXTENSION_PREFIX}opened`,
      ],
      [BUTTONS_WRAPPER]: [
        // Copied from the global wrapper of the special letter buttons provided for some languages (such as French).
        // The class responsible for the null height is ignored here.
        '_1rTak',
        `${EXTENSION_PREFIX}control-buttons`,
      ],
      [KEYBOARD_HINT]: [
        `${EXTENSION_PREFIX}control-keyboard-hint`,
      ],
    }
  )
};
