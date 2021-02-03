import { h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import { useKeyCi, useStateRef, useThrottledCallback } from 'preact-use';
import { _ } from 'param.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { discardEvent, isObject, noop } from '../functions';

import {
  DIGIT_CHARS,
  EXTENSION_PREFIX,
  FORM_STYLE_BASIC,
  PLAYBACK_STATE_PLAYING,
  PLAYBACK_STATE_STOPPED,
  POSITION_STEP,
  RATE_STEP,
  VOLUME_STEP,
} from '../constants';

import {
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

const AudioControlPanel =
  ({
     formStyle = FORM_STYLE_BASIC,
     ttsType = TTS_TYPE_NORMAL,
     active = false,
     audio = null,
     onSettingsChange = noop,
     onPlayRequest = noop,
     onPauseRequest = noop,
     onStopRequest = noop,
     onSeekRequest = noop,
     onPinnedStart = noop,
   }) => {
    const audioDuration = audio?.duration || 0;
    const audioPosition = audio?.position || 0;

    const [ rate, rateRef, setRate ] = useTtsRate(ttsType);
    const [ volume, volumeRef, setVolume ] = useTtsVolume(ttsType);

    // ------ Audio settings ------

    // Applies some playback settings to a "Howl" object.
    const applyPlaybackSettings = useThrottledCallback(onSettingsChange, { delay: 50, defer: true });

    // Sets and applies a new playback rate.
    const onRateChange = useCallback(rate => {
      setRate(rate);
      applyPlaybackSettings();
    }, [ setRate, applyPlaybackSettings ]);

    // Sets and applies a new playback volume.
    const onVolumeChange = useCallback(volume => {
      setVolume(volume);
      applyPlaybackSettings();
    }, [ setVolume, applyPlaybackSettings ]);

    // ------ Position seeking ------

    // Returns a valid position in the current audio, rounded to one decimal place.
    const getValidPosition = useCallback(raw => {
      if (audioDuration) {
        const position = Math.round(Number(raw) * 10) / 10;
        return isNaN(position) ? null : Math.max(0.0, Math.min(position, audioDuration));
      }

      return null;
    }, [ audioDuration ]);

    const [ seekedPosition, seekedPositionRef, setSeekedPosition ] = useStateRef(null);

    const activeSeekActions = useRef(new Set());
    const wasPlayingBeforeSeeking = useRef(false);

    // Returns whether at least one seek action is going on at the moment.
    const isSeeking = useCallback(
      () => (activeSeekActions.current.size > 0),
      [ activeSeekActions ]
    );

    // Sets and applies a new audio position.
    const onSeek = useCallback(raw => {
      const position = getValidPosition(raw);

      if (null !== position) {
        if (isSeeking()) {
          setSeekedPosition(position);
        } else {
          onSeekRequest(position);
          setSeekedPosition(null);
        }
      }
    }, [ onSeekRequest, getValidPosition, setSeekedPosition, isSeeking ]);

    // Handles the start of a long-running seek action.
    const onLongSeekStart = useCallback((action, raw) => {
      activeSeekActions.current.add(action);
      onSeek(raw);

      if (1 === activeSeekActions.current.size) {
        // We just started a long-running seek: pause the audio if it's playing, and remember its state.
        if (audio && (PLAYBACK_STATE_PLAYING === audio.playbackState)) {
          wasPlayingBeforeSeeking.current = true;
          onPauseRequest();
        } else {
          wasPlayingBeforeSeeking.current = false;
        }
      }
    }, [ audio, onPauseRequest, activeSeekActions, wasPlayingBeforeSeeking, onSeek ]);

    // Handles the end of a long-running seek action.
    const onLongSeekEnd = useCallback((action, raw) => {
      activeSeekActions.current.delete(action);
      onSeek(raw);

      if (
        wasPlayingBeforeSeeking.current
        && (0 === activeSeekActions.current.size)
      ) {
        onPlayRequest();
        wasPlayingBeforeSeeking.current = false;
      }
    }, [ onPlayRequest, activeSeekActions, wasPlayingBeforeSeeking, onSeek ]);

    // ------ Audio actions ------

    // Plays the audio, if appropriate in the current context.
    const play = useCallback(() => !isSeeking() && onPlayRequest(), [ onPlayRequest, isSeeking ]);

    // Pauses the audio.
    const pause = onPauseRequest;

    // Stops the audio.
    const stop = onStopRequest;

    // Remembers the current playback position as the new starting position.
    const pinStart = useCallback(() => {
      if (audio) {
        const start = getValidPosition(audioPosition);
        (null !== start) && onPinnedStart(start);
      }
    }, [ audio, audioPosition, onPinnedStart, getValidPosition ]);

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
      key => audioDuration && onSeek('end' === key ? audioDuration : 0),
      [ audioDuration, onSeek ]
    );

    useKeys(
      DIGIT_CHARS.slice(1),
      key => audioDuration && onSeek(getValidPosition(audioDuration * Number(key) / 10)),
      [ audioDuration, getValidPosition, onSeek ]
    );

    useKeys(
      [ 'arrowleft', 'arrowright' ],
      (key, event) => {
        if (event.ctrlKey) {
          return;
        }

        const fromPosition = (null === seekedPositionRef.current)
          ? audioPosition
          : seekedPositionRef.current;

        const position = 'arrowleft' === key
          ? Math.max(0.0, fromPosition - POSITION_STEP)
          : Math.min(audioDuration, fromPosition + POSITION_STEP);

        if (!event.repeat) {
          onLongSeekStart(key, position);
        } else if (position !== fromPosition) {
          onSeek(position);
        }
      },
      [ audioDuration, audioPosition, seekedPositionRef, onSeek, onLongSeekStart ],
      'keydown'
    );

    useKeys(
      [ 'arrowleft', 'arrowright' ],
      (key, event) => (
        !event.ctrlKey
        && (null !== seekedPositionRef.current)
        && onLongSeekEnd(key, seekedPositionRef.current)
      ),
      [ seekedPositionRef, onLongSeekEnd ],
      'keyup'
    );

    useKeys(
      [ ' ', 'arrowup', 'k' ],
      (key, event) => {
        if (
          (!event.ctrlKey && ('arrowup' !== key))
          || (event.ctrlKey && ('arrowup' === key))
        ) {
          (PLAYBACK_STATE_PLAYING !== audio?.playbackState)
            ? play()
            : pause()
        }
      },
      [ audio, play, pause ]
    );

    useKeys(
      [ 'arrowdown', 'p' ],
      (key, event) => (event.ctrlKey || ('arrowdown' !== key)) && pinStart(),
      [ pinStart ]
    );

    const getElementClassNames = useStyles(CLASS_NAMES, [ formStyle ]);

    const hasAudio = isObject(audio) && (audioDuration > 0);

    const rateHint = 1 === rate
      ? '1x'
      : `${rate.toFixed(1)}x`;

    const sliderPosition = (null !== seekedPosition) ? seekedPosition : audioPosition;

    const positionHint = !hasAudio
      ? '? / ?'
      : `${sliderPosition.toFixed(1)}s / ${audioDuration.toFixed(1)}s`;

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

        <ControlSlider
          type={sliders.TYPE_POSITION}
          disabled={!hasAudio}
          value={sliderPosition}
          min={0.0}
          max={audioDuration}
          step={POSITION_STEP}
          hint={positionHint}
          onChangeStart={onLongSeekStart('slider', _)}
          onChange={onSeek}
          onChangeEnd={onLongSeekEnd('slider', _)}
        />

        <div className={getElementClassNames(BUTTONS_WRAPPER)}>
          {!hasAudio || (PLAYBACK_STATE_PLAYING !== audio.playbackState)
            ? (
              <ControlButton
                type={buttons.TYPE_PLAY}
                onClick={play}
              />
            ) : (
              <ControlButton
                type={buttons.TYPE_PAUSE}
                disabled={!hasAudio}
                onClick={pause}
              />
            )}

          <ControlButton
            type={buttons.TYPE_STOP}
            disabled={!hasAudio || (PLAYBACK_STATE_STOPPED === audio.playbackState)}
            onClick={stop}
          />

          <ControlButton
            type={buttons.TYPE_PIN}
            disabled={!hasAudio}
            onClick={pinStart}
          />

          {active && (
            <FontAwesomeIcon
              icon="keyboard"
              transform="grow-3"
              className={getElementClassNames(KEYBOARD_HINT)}
            />
          )}
        </div>
      </div>
    );
  };

export default AudioControlPanel;

const WRAPPER = 'wrapper';
const WRAPPER__ACTIVE = 'wrapper__active';
const BUTTONS_WRAPPER = 'button_wrapper';
const KEYBOARD_HINT = 'keyboard_hint';

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
    [KEYBOARD_HINT]: [
      `${EXTENSION_PREFIX}control-keyboard-hint`,
    ],
  },
};
