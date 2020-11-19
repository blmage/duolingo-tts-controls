import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useInterval, useKeyCi, useStateRef, useThrottledCallback, useUnmount } from 'preact-use';
import { _ } from 'param.macro';
import { discardEvent, isObject } from '../functions';
import { DIGIT_CHARS, EXTENSION_PREFIX, FORM_STYLE_BASIC } from '../constants';

import {
  applyTtsSettingsToHowlSound,
  getHowlPosition,
  getTtsMaxRate,
  getTtsMaxVolume,
  getTtsMinRate,
  getTtsMinVolume,
  isUnstableHowl,
  TTS_TYPE_NORMAL,
  useTtsRate,
  useTtsVolume,
} from '../tts';

import { BASE, useStyles } from './index';
import ControlButton, * as buttons from './ControlButton';
import ControlSlider, * as sliders from './ControlSlider';

/**
 * The amount by which to decrease/increase the playback rate on a single step.
 *
 * @type {number}
 */
const RATE_STEP = 0.1;

/**
 * The amount by which to decrease/increase the playback volume on a single step.
 *
 * @type {number}
 */
const VOLUME_STEP = 0.05;

/**
 *
 * @type {number}
 */
const POSITION_STEP = 0.1;

const ControlPanel =
  ({
     formStyle = FORM_STYLE_BASIC,
     ttsType = TTS_TYPE_NORMAL,
     active = false,
     howl = null,
   }) => {
    const [ rate, rateRef, setRate ] = useTtsRate(ttsType);
    const [ volume, volumeRef, setVolume ] = useTtsVolume(ttsType);
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
        // There is no other long-running seek action: pause the sound if it's playing, and remember its state.
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
          wasPlayingBeforeSeeking.current && howl.play();
        }

        wasPlayingBeforeSeeking.current = false;
      }
    }, [ howl, activeSeekActions, wasPlayingBeforeSeeking, onSeek ]);

    // ------ Sound actions ------

    // Plays the sound, if appropriate in the current context.
    const play = useCallback(() => howl && !isSeeking() && howl.play(), [ howl, isSeeking ]);

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

    const useKeys = (keys, callback, deps, eventName = 'keydown') => {
      useKeyCi(keys, (key, event) => {
        if (active) {
          discardEvent(event)
          callback(key, event);
        }
      }, { event: eventName }, [ active ].concat(deps));
    };

    useKeys(
      [ '<', '>', 'arrowleft', 'arrowright' ],
      (key, event) => {
        if (
          !event.ctrlKey && ('<' === key)
          || event.ctrlKey && ('arrowleft' === key)
        ) {
          (rateRef.current > getTtsMinRate(ttsType)) && onRateChange(rateRef.current - RATE_STEP);
        } else if (
          !event.ctrlKey && ('>' === key)
          || event.ctrlKey && ('arrowright' === key)
        ) {
          (rateRef.current < getTtsMaxRate(ttsType)) && onRateChange(rateRef.current + RATE_STEP);
        }
      },
      [ ttsType, rateRef, onRateChange ]
    )

    useKeys(
      [ 'arrowdown', 'arrowup' ],
      (key, event) => {
        if (event.ctrlKey) {
          return;
        }

        if ('arrowdown' === key) {
          (volumeRef.current > getTtsMinVolume()) && onVolumeChange(volumeRef.current - VOLUME_STEP)
        } else {
          (volumeRef.current < getTtsMaxVolume()) && onVolumeChange(volumeRef.current + VOLUME_STEP);
        }
      },
      [ volumeRef, onVolumeChange ]
    );

    useKeys(
      [ '0', 'home', 'end' ],
      key => onSeek('end' === key ? duration : 0),
      [ duration, onSeek ]
    );

    useKeys(
      DIGIT_CHARS.slice(1),
      key => onSeek(getValidPosition(duration * Number(key) / 10)),
      [ duration, getValidPosition, onSeek ]
    );

    useKeys(
      [ 'arrowleft', 'arrowright' ],
      (key, event) => {
        if (event.ctrlKey) {
          return;
        }

        const position = 'arrowleft' === key
          ? Math.max(0.0, positionRef.current - POSITION_STEP)
          : Math.min(duration, positionRef.current + POSITION_STEP);

        if (!event.repeat) {
          onLongSeekStart(key, position);
        } else if (position !== positionRef.current) {
          onSeek(position);
        }
      },
      [ duration, positionRef, onSeek, onLongSeekStart ],
    );

    useKeys(
      [ 'arrowleft', 'arrowright' ],
      (key, event) => !event.ctrlKey && onLongSeekEnd(key, positionRef.current),
      [ positionRef, onLongSeekEnd ],
      'keyup'
    );

    useKeys(
      [ ' ', 'arrowup', 'k' ],
      (key, event) => {
        if (!event.ctrlKey || ('arrowup' === key)) {
          !isPlaying || isPaused
            ? play()
            : pause()
        }
      },
      [ isPlaying, isPaused, play, pause ]
    );

    useKeys(
      [ 'arrowdown', 'p' ],
      (key, event) => (event.ctrlKey || ('arrowdown' !== key)) && pinStart(),
      [ pinStart ]
    );

    // ------ Sound state handling ------

    const hasSeekedUnstable = useRef(false);

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

        // When the sound is played, registers the new state,
        // and tries to work around some quirks from the underlying audio library.
        const onHowlPlay = function (soundId) {
          if (isUnstableHowl(this) && !hasSeekedUnstable.current) {
            // When the "Howl" object uses multiple sounds, we can't be sure that any seek() we applied in onHowlStop()
            // has taken effect on the sound that has just started.
            hasSeekedUnstable.current = true;
            this.seek(positionRef.current, soundId);
          } else {
            // seek() triggers both pause() and play(), so the "unstable" case will end up here too.
            setIsPlaying(true);
            setIsPaused(false);
            userPosition.current = null;
            hasSeekedUnstable.current = false;
          }
        };

        // When the sound is paused, registers the new state, and remembers the current position as user-defined.
        const onHowlPause = () => {
          setIsPaused(true);
          userPosition.current = getHowlPosition(howl);
        };

        // When the original playback buttons are used, the rate is reset to 1. If this happens, force our rate again.
        const onHowlRate = () => {
          if ((howl.rate() === 1) && (1 !== rateRef.current)) {
            howl.rate(rateRef.current);
          }
        };

        howl.on('play', onHowlPlay);
        howl.on('pause', onHowlPause);
        howl.on('rate', onHowlRate);

        return () => {
          if (howl) {
            howl.off('play', onHowlPlay);
            howl.off('pause', onHowlPause);
            howl.off('rate', onHowlRate);
          }
        };
      }
    }, [
      howl,
      positionRef,
      setDuration,
      setPlayPosition,
      setIsPlaying,
      setIsPaused,
      userPosition,
      hasSeekedUnstable,
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

    const getElementClassNames = useStyles(CLASS_NAMES, [ formStyle ]);

    const hasSound = isObject(howl);

    const rateHint = rate === 1
      ? '1x'
      : `${rate.toFixed(1)}x`;

    const positionHint = !hasSound
      ? '? / ?'
      : `${position.toFixed(1)}s / ${duration.toFixed(1)}s`;

    const wrapperState = active ? WRAPPER__ACTIVE : null;

    return (
      <div className={getElementClassNames([ WRAPPER, wrapperState ])}>
        <ControlSlider
          type={sliders.TYPE_RATE}
          value={rate}
          min={getTtsMinRate(ttsType)}
          max={getTtsMaxRate(ttsType)}
          step={RATE_STEP}
          hint={rateHint}
          onChangeStart={onRateChange}
          onChange={onRateChange}
          onChangeEnd={onRateChange} />

        <ControlSlider
          type={sliders.TYPE_VOLUME}
          value={volume}
          min={getTtsMinVolume()}
          max={getTtsMaxVolume()}
          step={VOLUME_STEP}
          hint={`${Math.round(volume * 100.0)}%`}
          onChangeStart={onVolumeChange}
          onChange={onVolumeChange}
          onChangeEnd={onVolumeChange} />

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
          onChangeEnd={onLongSeekEnd('slider', _)} />

        <div className={getElementClassNames(BUTTONS_WRAPPER)}>
          {!isPlaying || isPaused
            ? (
              <ControlButton
                type={buttons.TYPE_PLAY}
                disabled={!hasSound}
                onClick={play} />
            ) : (
              <ControlButton
                type={buttons.TYPE_PAUSE}
                disabled={!hasSound}
                onClick={pause} />
            )}

          <ControlButton
            type={buttons.TYPE_STOP}
            disabled={!hasSound || !isPlaying}
            onClick={stop} />

          <ControlButton
            type={buttons.TYPE_PIN}
            disabled={!hasSound}
            onClick={pinStart} />
        </div>
      </div>
    );
  };

export default ControlPanel;

const WRAPPER = 'wrapper';
const WRAPPER__ACTIVE = 'wrapper__active';
const BUTTONS_WRAPPER = 'button_wrapper';

const CLASS_NAMES = {
  [BASE]: {
    [WRAPPER]: [
      `${EXTENSION_PREFIX}control-panel`,
    ],
    [WRAPPER__ACTIVE]: [
      // Copied from the "Use keyboard" / "Use word bank" button. Only the color is used here.
      '_3cbXv',
      // Copied by searching for a class targeted by Darklingo++ to apply a better color ("tertiary"),
      // while having no effect on the original UI.
      'kAVeU',
      `${EXTENSION_PREFIX}control-panel_active`,
    ],
    [BUTTONS_WRAPPER]: [
      // Copied from the global wrapper of the special letter buttons provided for some languages (such as French).
      // The class responsible for the null height is ignored here.
      'gcfYU',
      `${EXTENSION_PREFIX}control-buttons`,
    ],
  },
};
