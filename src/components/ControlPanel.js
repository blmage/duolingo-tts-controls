import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useInterval, useUnmount } from 'preact-use';
import { _ } from 'param.macro';
import throttle from 'lodash.throttle';
import { isObject } from '../functions';
import { EXTENSION_PREFIX } from '../constants';
import { BASE, useStyles } from './index';

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

import ControlButton, * as buttons from './ControlButton';
import ControlSlider, * as sliders from './ControlSlider';

/**
 * A throttled function for applying rate and volume settings to a "Howl" object in almost real-time.
 *
 * @type {Function}
 */
const applyPlaybackSettings = throttle(applyTtsSettingsToHowlSound(_, _, _), 50);

const ControlPanel = ({ ttsType = TTS_TYPE_NORMAL, howl = null, }) => {
  const [ rate, setRate ] = useTtsRate(ttsType);
  const [ volume, setVolume ] = useTtsVolume(ttsType);
  const [ duration, setDuration ] = useState(0.0);
  const [ position, setPosition ] = useState(0.0);
  const [ startPosition, setStartPosition ] = useState(0.0);
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ isPaused, setIsPaused ] = useState(false);
  const [ wasPlaying, setWasPlaying ] = useState(false);

  const getElementClassNames = useStyles(CLASS_NAMES);

  const getValidPosition = useCallback(raw => {
    const position = Math.round(Number(raw) * 10) / 10;
    return !isNaN(position) && (position >= 0.0) && (position <= duration) ? position : null;
  }, [ duration ]);

  const onRateChange = useCallback(rate => {
    setRate(rate);
    howl && applyPlaybackSettings(rate, volume, howl);
  }, [ howl, volume, setRate ]);

  const onVolumeChange = useCallback(volume => {
    setVolume(volume);
    howl && applyPlaybackSettings(rate, volume, howl);
  }, [ howl, rate, setVolume ]);

  const onPositionChange = useCallback(raw => {
    const position = getValidPosition(raw);
    (null !== position) && setPosition(position);
    return position;
  }, [ getValidPosition, setPosition ]);

  const onPositionChangeStart = useCallback(raw => {
    onPositionChange(raw);

    if (howl && isPlaying) {
      setWasPlaying(!isPaused);
      howl.pause();
    }
  }, [ howl, isPlaying, isPaused, setWasPlaying, onPositionChange ]);

  const onPositionChangeEnd = useCallback(raw => {
    const position = onPositionChange(raw);

    if (howl) {
      (null !== position) && howl.seek(position);
      wasPlaying && howl.play();
      setWasPlaying(false);
    }
  }, [ howl, wasPlaying, setWasPlaying, onPositionChange ]);

  const play = useCallback(() => {
    howl && howl.play();
  }, [ howl ]);

  const pause = useCallback(() => {
    howl && howl.pause();
  }, [ howl ]);

  const stop = useCallback(() => {
    howl && howl.stop();
  }, [ howl ]);

  const pinStart = useCallback(() => {
    const start = getValidPosition(position);
    (null !== start) && setStartPosition(start);
  }, [ position, getValidPosition, setStartPosition ]);

  // Re-initialize the sound data when the "Howl" object becomes available or changes.
  // Register dependency-less listeners.
  useEffect(() => {
    if (howl) {
      const isPlaying = howl.playing();
      const position = getHowlPosition(howl);

      setDuration(howl.duration());
      setPosition(position || 0.0);
      setIsPlaying(isPlaying);
      setIsPaused(!isPlaying && (position > 0.0));

      const onPlay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      }

      const onPause = () => setIsPaused(true);

      howl.on('play', onPlay);
      howl.on('pause', onPause);

      return () => {
        if (howl) {
          howl.off('play', onPlay);
          howl.off('pause', onPause);
        }
      };
    }
  }, [ howl, setDuration, setPosition, setIsPlaying, setIsPaused ])

  const isResettingSound = useRef(false);

  const onStop = useCallback(function () {
    if (!isResettingSound.current) {
      setPosition(startPosition);
      setIsPlaying(false);
      this.seek(startPosition);
    }
  }, [ startPosition, setPosition, setIsPlaying, isResettingSound ]);

  // Register the listeners that depend on the pinned start position.
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

  // Reset the position of the sound in case it might be used again later (if the user gave a wrong answer, eg).
  useUnmount(() => {
    if (howl) {
      isResettingSound.current = true;
      howl.stop();
      howl.seek(0);
    }
  });

  // Regularly refresh the position when the sound is being played.
  useInterval(() => {
    howl && setPosition(getHowlPosition(howl));
  }, isPlaying && !isPaused ? 75 : null);

  const hasSound = isObject(howl);

  const positionHint = !hasSound
    ? '? / ?'
    : `${position.toFixed(1)}s / ${duration.toFixed(1)}s`;

  return (
    <div className={getElementClassNames(WRAPPER)}>
      <ControlSlider
        type={sliders.TYPE_RATE}
        value={rate}
        min={getTtsMinRate(ttsType)}
        max={getTtsMaxRate(ttsType)}
        step={0.1}
        hint={`${rate}x`}
        onChange={onRateChange}
        onChangeEnd={onRateChange} />

      <ControlSlider
        type={sliders.TYPE_VOLUME}
        value={volume}
        min={getTtsMinVolume()}
        max={getTtsMaxVolume()}
        step={0.1}
        hint={`${Math.round(volume * 100.0)}%`}
        onChange={onVolumeChange}
        onChangeEnd={onVolumeChange} />

      <ControlSlider
        type={sliders.TYPE_POSITION}
        value={position}
        min={0.0}
        max={duration}
        step={0.1}
        hint={positionHint}
        disabled={!hasSound}
        onChangeStart={onPositionChangeStart}
        onChange={onPositionChange}
        onChangeEnd={onPositionChangeEnd} />

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
const BUTTONS_WRAPPER = 'button_wrapper';

const CLASS_NAMES = {
  [BASE]: {
    [WRAPPER]: [ `${EXTENSION_PREFIX}controls-panel` ],
    [BUTTONS_WRAPPER]: [
      // Copied from the global wrapper of the special letter buttons provided for some languages (such as French).
      // The class responsible for the null height is ignored here.
      '_2mM1T',
      `${EXTENSION_PREFIX}controls-buttons`,
    ],
  },
};
