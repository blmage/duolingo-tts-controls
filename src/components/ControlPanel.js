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
  TTS_TYPE_NORMAL,
  useTtsRate,
  useTtsVolume,
} from '../tts';

import { BASE, useStyles } from './index';
import ControlButton, * as buttons from './ControlButton';
import ControlSlider, * as sliders from './ControlSlider';

/**
 *
 * @type {number}
 */
const RATE_STEP = 0.1;

/**
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
    const [ isPlaying, setIsPlaying ] = useState(false);
    const [ isPaused, isPausedRef, setIsPaused ] = useStateRef(false);
    const startPosition = useRef(0.0);

    const isSeeking = useRef(false);
    const wasPlaying = useRef(false);
    const activeSeekActions = useRef(new Set());

    // See the onStop() callback for the rationale behind those refs.
    const userPosition = useRef(null);
    const hasUserStopped = useRef(false);

    const applyPlaybackSettings = useThrottledCallback(
      (howl, rate, volume) => howl && applyTtsSettingsToHowlSound(rate, volume, howl),
      50,
      howl
    );

    // Updates and reapplies the playback rate.
    const onRateChange = useCallback(rate => {
      setRate(rate);
      applyPlaybackSettings(rate, volumeRef.current);
    }, [ volumeRef, setRate, applyPlaybackSettings ]);

    // Updates and reapplies the playback volume.
    const onVolumeChange = useCallback(volume => {
      setVolume(volume);
      applyPlaybackSettings(rateRef.current, volume);
    }, [ rateRef, setVolume, applyPlaybackSettings ]);

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

    // Sets and applies the new sound position.
    const onSeek = useCallback(raw => {
      const position = getValidPosition(raw);

      if (null !== position) {
        // Only remember the user-defined position when the sound is paused.
        (isSeeking.current ? !wasPlaying.current : isPausedRef.current)
          ? setUserPosition(position)
          : setPlayPosition(position);

        howl && !isSeeking.current && howl.seek(position);
      }

      return position;
    }, [ howl, isPausedRef, isSeeking, wasPlaying, getValidPosition, setPlayPosition, setUserPosition ]);

    // Handles the start of a long-running seek action.
    const onLongSeekStart = useCallback((action, raw) => {
      activeSeekActions.current.add(action);
      isSeeking.current = true;
      onSeek(raw);

      if (1 === activeSeekActions.current.size) {
        if (howl && isPlaying) {
          wasPlaying.current = !isPaused;
          howl.pause();
        } else {
          wasPlaying.current = false;
        }
      }
    }, [ howl, isPlaying, isPaused, isSeeking, wasPlaying, activeSeekActions, onSeek ]);

    // Handles the end of a long-running seek action.
    const onLongSeekEnd = useCallback((action, raw) => {
      activeSeekActions.current.delete(action);
      const position = onSeek(raw);

      if (0 === activeSeekActions.current.size) {
        if (howl) {
          (null !== position) && howl.seek(position);
          wasPlaying.current && howl.play();
          wasPlaying.current = false;
        }

        isSeeking.current = false;
      }
    }, [ howl, isSeeking, wasPlaying, activeSeekActions, onSeek ]);

    const play = useCallback(() => howl && !isSeeking.current && howl.play(), [ howl, isSeeking ]);

    const pause = useCallback(() => howl && howl.pause(), [ howl ]);

    const stop = useCallback(() => {
      if (howl) {
        hasUserStopped.current = true;
        howl.stop()
      }
    }, [ howl ]);

    const pinStart = useCallback(() => {
      const start = getValidPosition(positionRef.current);
      (null !== start) && (startPosition.current = start);
    }, [ positionRef, startPosition, getValidPosition ]);

    const useKeys = (keys, callback, deps, eventName = 'keydown') => {
      useKeyCi(keys, (key, event) => {
        if (active) {
          discardEvent(event);
          callback(key, event);
        }
      }, { event: eventName }, [ active ].concat(deps));
    };

    useKeys(
      [ '<', '>' ],
      key => {
        if ('<' === key) {
          (rateRef.current > getTtsMinRate(ttsType)) && onRateChange(rateRef.current - RATE_STEP);
        } else {
          (rateRef.current < getTtsMaxRate(ttsType)) && onRateChange(rateRef.current + RATE_STEP);
        }
      },
      [ ttsType, rateRef, onRateChange ]
    )

    useKeys(
      [ 'arrowdown', 'arrowup' ],
      key => {
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
      key => onSeek(('end' === key) ? duration : 0),
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
        const position = ('arrowleft' === key)
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
      key => onLongSeekEnd(key, positionRef.current),
      [ positionRef, onLongSeekEnd ],
      'keyup'
    );

    useKeys(
      [ ' ', 'k' ],
      () => (!isPlaying || isPaused)
        ? play()
        : pause(),
      [ isPlaying, isPaused, play, pause ]
    );

    useKeys(
      'p',
      () => pinStart(),
      [ pinStart ]
    );

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

        const onPlay = () => {
          setIsPlaying(true);
          setIsPaused(false);
          userPosition.current = null;
        }

        const onPause = () => {
          setIsPaused(true);
          userPosition.current = getHowlPosition(howl);
        };

        howl.on('play', onPlay);
        howl.on('pause', onPause);

        return () => {
          if (howl) {
            howl.off('play', onPlay);
            howl.off('pause', onPause);
          }
        };
      }
    }, [ howl, setDuration, setPlayPosition, setIsPlaying, setIsPaused, userPosition ])

    const isResettingSound = useRef(false);

    // When it stops, resets the sound position to whichever is the most relevant.
    const onStop = useCallback(function () {
      if (isResettingSound.current) {
        // Do not interfere with the sound cleanup when we're unmounting.
        return;
      }

      // The user-defined position is used to provide a better behavior for the original playback buttons,
      // which always stop the sounds prior to (re)playing them:
      // when the last action was the user pausing the sound, or changing the position when the sound was paused,
      // start back from where we were rather than from the pinned position (or from zero).
      // This only holds if the user did not stop the sound himself or chose the last decisecond.
      const newPosition =
        hasUserStopped.current
        || (null === userPosition.current)
        || (userPosition.current >= duration)
          ? startPosition.current
          : userPosition.current;

      hasUserStopped.current = false;

      setIsPlaying(false);
      setPlayPosition(newPosition);

      this.seek(newPosition);
    }, [ duration, setIsPlaying, startPosition, userPosition, hasUserStopped, setPlayPosition, isResettingSound ]);

    // Register the dependent "Howl" listeners.
    useEffect(() => {
      if (howl) {
        howl.on('end', onStop);
        howl.on('stop', onStop);

        return () => {
          howl.off('end', onStop);
          howl.off('stop', onStop);
        };
      }
    }, [ howl, onStop ]);

    // When finished, reset the position of the sound in case it might be used again later
    // (if the user gave a wrong answer, eg, or if the TTS is used in other challenges).
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

        // Only change the position when relevant/appropriate.
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
          onChange={onRateChange}
          onChangeEnd={onRateChange} />

        <ControlSlider
          type={sliders.TYPE_VOLUME}
          value={volume}
          min={getTtsMinVolume()}
          max={getTtsMaxVolume()}
          step={VOLUME_STEP}
          hint={`${Math.round(volume * 100.0)}%`}
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
      // Copied by searching for the same color as the "Use keyboard" / "Use word bank" button,
      // but without the hover and pointer styles.
      'D9gQ7',
      `${EXTENSION_PREFIX}control-panel_active`,
    ],
    [BUTTONS_WRAPPER]: [
      // Copied from the global wrapper of the special letter buttons provided for some languages (such as French).
      // The class responsible for the null height is ignored here.
      '_2mM1T',
      `${EXTENSION_PREFIX}control-buttons`,
    ],
  },
};
