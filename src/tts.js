import { useCallback } from 'preact/hooks';
import { useStateRef } from 'preact-use';
import { _, it } from 'one-liner.macro';
import { EXTENSION_PREFIX } from './constants';

import {
  clampSoundSettingValue,
  getSoundPosition,
  PRIORITY_HIGH,
  setSoundSettingValue,
  SOUND_PLAYBACK_STRATEGY_HOWLER,
  SOUND_SETTING_RATE,
  SOUND_SETTING_VOLUME,
  SOUND_SPEED_SLOW,
} from 'duo-toolbox/duo/sounds';

/**
 * The amount by which to decrease / increase the playback rate on a single step.
 * @type {number}
 */
export const RATE_STEP = 0.1;

/**
 * The amount by which to decrease / increase the playback volume on a single step.
 * @type {number}
 */
export const VOLUME_STEP = 0.05;

/**
 * The amount by which to decrease / increase the playback position on a single step.
 * @type {number}
 */
export const POSITION_STEP = 0.1;

/**
 * @type {Function}
 * @param {string} ttsSpeed A TTS speed.
 * @returns {number} The minimum allowed playback rate for TTS sounds of the given speed.
 */
export const getTtsMinRate = ttsSpeed => ( // eslint-disable-line no-unused-vars
  clampSoundSettingValue(SOUND_SETTING_RATE, 0.5)
);

/**
 * @type {Function}
 * @param {string} ttsSpeed A TTS speed.
 * @returns {number} The maximum allowed playback rate for TTS sounds of the given speed.
 */
export const getTtsMaxRate = clampSoundSettingValue(
  SOUND_SETTING_RATE,
  SOUND_SPEED_SLOW === _ ? 2.5 : 2.0
);

/**
 * @returns {number} The minimum allowed playback volume for any TTS sound.
 */
export const getTtsMinVolume = () => clampSoundSettingValue(SOUND_SETTING_VOLUME, 0.05);

/**
 * @returns {number} The maximum allowed playback volume for any TTS sound.
 */
export const getTtsMaxVolume = () => clampSoundSettingValue(SOUND_SETTING_VOLUME, 1.0);

/**
 * @param {string} ttsSpeed A TTS speed.
 * @param {number} rate A playback rate.
 * @returns {number} A playback rate within the allowed range.
 */
export const clampTtsRate = (ttsSpeed, rate) => (
  Math.max(
    getTtsMinRate(ttsSpeed),
    Math.min(rate, getTtsMaxRate(ttsSpeed))
  )
);

/**
 * @param {number} volume A playback volume.
 * @returns {number} A playback volume within the allowed range.
 */
export const clampTtsVolume = volume => Math.max(getTtsMinVolume(), Math.min(volume, getTtsMaxVolume()));

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {string} The key under which is stored the playback rate for TTS sounds of the given speed.
 */
export const getLocalStorageTtsRateKey = ttsSpeed => `${EXTENSION_PREFIX}tts_rate_${ttsSpeed}`;

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {string} The key under which is stored the playback volume for TTS sounds of the given speed.
 */
export const getLocalStorageTtsVolumeKey = ttsSpeed => `${EXTENSION_PREFIX}tts_volume_${ttsSpeed}`;

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {number} The current playback rate for TTS sounds of the given speed.
 */
export const getTtsRate = ttsSpeed => (
  clampTtsRate(
    ttsSpeed,
    Number(localStorage.getItem(getLocalStorageTtsRateKey(ttsSpeed))) || 1.0
  )
);

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {number} The current playback volume for TTS sounds of the given speed.
 */
export const getTtsVolume = ttsSpeed => (
  clampTtsVolume(
    Number(localStorage.getItem(getLocalStorageTtsVolumeKey(ttsSpeed))) || 1.0
  )
);

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {[number, { current: number }, Function]}
 * An array holding:
 * - the value of,
 * - a ref to,
 * - a function to update
 * the current rate.
 */
export const useTtsRate = ttsSpeed => {
  const [ state, stateRef, setState ] = useStateRef(getTtsRate(ttsSpeed));

  const setRate = useCallback(raw => {
    const rate = Number(raw);
    const updated = clampTtsRate(ttsSpeed, isNaN(rate) ? 1.0 : rate);
    setState(updated);
    localStorage.setItem(getLocalStorageTtsRateKey(ttsSpeed), String(updated));
  }, [ ttsSpeed, setState ]);

  return [ state, stateRef, setRate ];
};

/**
 * @param {string} ttsSpeed A TTS speed.
 * @returns {[number, { current: number }, Function]}
 * An array holding:
 * - the value of,
 * - a ref to,
 * - a function to update
 * the current rate.
 */
export const useTtsVolume = ttsSpeed => {
  const [ state, stateRef, setState ] = useStateRef(getTtsVolume(ttsSpeed));

  const setVolume = useCallback(raw => {
    const volume = Number(raw);
    const updated = clampTtsVolume(isNaN(volume) ? 1.0 : volume);
    setState(updated);
    localStorage.setItem(getLocalStorageTtsVolumeKey(ttsSpeed), String(updated));
  }, [ ttsSpeed, setState ]);

  return [ state, stateRef, setVolume ];
};

/**
 * @type {Function}
 * @param {object} howl A "Howl" object from the "howler.js" library.
 * @returns {number} The current position of the given "Howl" object.
 */
export const getHowlPosition = getSoundPosition(_, SOUND_PLAYBACK_STRATEGY_HOWLER);

/**
 * @type {Function}
 * @param {object} howl A "Howl" object from the "howler.js" library.
 * @returns {boolean} Whether the given "Howl" object could exhibit weird behavior.
 */
export const isUnstableHowl = it._getSoundIds().length > 1;

/**
 * Applies the given rate and volume to a "Howl" object.
 * @param {number} rate A playback rate.
 * @param {number} volume A playback volume.
 * @param {object} howl A "Howl" object from the "howler.js" library.
 * @returns {void}
 */
export const applyTtsSettingsToHowlSound = (rate, volume, howl) => {
  setSoundSettingValue(
    SOUND_SETTING_RATE,
    rate,
    howl,
    SOUND_PLAYBACK_STRATEGY_HOWLER,
    false,
    PRIORITY_HIGH
  );

  setSoundSettingValue(
    SOUND_SETTING_VOLUME,
    volume,
    howl,
    SOUND_PLAYBACK_STRATEGY_HOWLER,
    false,
    PRIORITY_HIGH
  );
};

/**
 * Applies the current rate and volume settings of a given TTS speed to a "Howl" object.
 * @param {string} ttsSpeed A TTS speed.
 * @param {object} howl A "Howl" object from the "howler.js" library.
 * @returns {void}
 */
export const applyCurrentTtsSettingsToHowlSound = (ttsSpeed, howl) => (
  applyTtsSettingsToHowlSound(
    getTtsRate(ttsSpeed),
    getTtsVolume(ttsSpeed),
    howl
  )
);
