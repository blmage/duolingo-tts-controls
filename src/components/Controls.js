import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
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
} from '../sounds';

import Button, * as buttons from './Button';
import Slider, * as sliders from './Slider';

/**
 * A throttled function for applying rate and volume settings to a "Howl" object in almost real-time.
 *
 * @type {Function}
 */
const applyPlaybackSettings = throttle(applyTtsSettingsToHowlSound(_, _, _), 50);

const Controls = ({ ttsType = TTS_TYPE_NORMAL, howl = null, }) => {
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
      setWasPlaying(true);
      howl.pause();
    }
  }, [ howl, isPlaying, setWasPlaying, onPositionChange ]);

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

  // Register the listeners that depend on the pinned start position.
  useEffect(() => {
    if (howl) {
      const onStop = () => {
        setPosition(startPosition);
        setIsPlaying(false);
        howl.seek(startPosition);
      }

      howl.on('end', onStop);
      howl.on('stop', onStop);

      return () => {
        howl.off('end', onStop);
        howl.off('stop', onStop);
      };
    }
  }, [ howl, startPosition, setPosition, setIsPlaying ]);

  // Reset the position of the sound in case it might be used again later (if the user gave a wrong answer, eg).
  useUnmount(() => {
    if (howl) {
      howl.stop();
      howl.seek(0);
      // Double check in case the call above didn't have any effect (which may happen on rare cases).
      howl.once('play', () => howl.seek(0));
    }
  });

  // Regularly refresh the position when the sound is being played.
  useInterval(() => {
    if (howl) {
      // Double check to make sure we never set an invalid position.
      const position = getHowlPosition(howl);
      (null !== position) && setPosition(position);
    }
  }, isPlaying && !isPaused ? 75 : null);

  const hasSound = isObject(howl);

  const positionHint = !hasSound
    ? '? / ?'
    : `${position.toFixed(1)}s / ${duration.toFixed(1)}s`;

  return (
    <div>
      <Slider
        type={sliders.TYPE_RATE}
        value={rate}
        min={getTtsMinRate(ttsType)}
        max={getTtsMaxRate(ttsType)}
        step={0.1}
        hint={`${rate}x`}
        onChange={onRateChange}
        onChangeEnd={onRateChange}/>

      <Slider
        type={sliders.TYPE_VOLUME}
        value={volume}
        min={getTtsMinVolume()}
        max={getTtsMaxVolume()}
        step={0.1}
        hint={`${Math.round(volume * 100.0)}%`}
        onChange={onVolumeChange}
        onChangeEnd={onVolumeChange}/>

      <Slider
        type={sliders.TYPE_POSITION}
        value={position}
        min={0.0}
        max={duration}
        step={0.1}
        hint={positionHint}
        disabled={!hasSound}
        onChangeStart={onPositionChangeStart}
        onChange={onPositionChange}
        onChangeEnd={onPositionChangeEnd}/>

      <div className={getElementClassNames(BUTTONS_WRAPPER)}>
        {!isPlaying || isPaused
          ? (
            <Button
              type={buttons.TYPE_PLAY}
              disabled={!hasSound}
              onClick={play}/>
          ) : (
            <Button
              type={buttons.TYPE_PAUSE}
              disabled={!hasSound}
              onClick={pause}/>
          )}

        <Button
          type={buttons.TYPE_STOP}
          disabled={!hasSound || !isPlaying}
          onClick={stop}/>

        <Button
          type={buttons.TYPE_PIN}
          disabled={!hasSound}
          onClick={pinStart}/>
      </div>
    </div>
  );
};

export default Controls;

const BUTTONS_WRAPPER = 'button_wrapper';

const CLASS_NAMES = {
  [BASE]: {
    [BUTTONS_WRAPPER]: [
      // Copied from the global wrapper of the special letter buttons provided for some languages (such as French).
      // The class responsible for the null height is ignored here.
      '_2mM1T',
      `${EXTENSION_PREFIX}controls-buttons`,
    ],
  },
};
