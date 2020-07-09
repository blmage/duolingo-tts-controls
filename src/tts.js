import { useCallback, useState } from 'preact/hooks';
import { EXTENSION_PREFIX } from './constants';

/**
 * The type of TTS with a normal speed.
 *
 * @type {string}
 */
export const TTS_TYPE_NORMAL = 'normal';

/**
 * The type of TTS with a slow speed.
 *
 * @type {string}
 */
export const TTS_TYPE_SLOW = 'slow';

/**
 * @param {string} ttsType A TTS type.
 * @returns {number} The minimum allowed playback rate for TTS sounds of the given type.
 */
export function getTtsMinRate(ttsType) {
  return TTS_TYPE_SLOW === ttsType ? 1.0 : 0.5;
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {number} The maximum allowed playback rate for TTS sounds of the given type.
 */
export function getTtsMaxRate(ttsType) {
  return TTS_TYPE_SLOW === ttsType ? 2.5 : 2.0;
}

/**
 * @returns {number} The minimum allowed playback volume for any TTS sound.
 */
export function getTtsMinVolume() {
  return 0.1;
}

/**
 * @returns {number} The maximum allowed playback volume for any TTS sound.
 */
export function getTtsMaxVolume() {
  // The Web Audio API doesn't work, despite being usable (see why in the Howl.prototype.init override in ui.js).
  // return isObject(Howler) && Howler.usingWebAudio ? 2.0 : 1.0;
  return 1.0;
}

/**
 * @param {string} ttsType A TTS type.
 * @param {number} rate A playback rate.
 * @returns {number} A playback rate within the allowed range.
 */
function clampTtsRate(ttsType, rate) {
  return Math.max(getTtsMinRate(ttsType), Math.min(rate, getTtsMaxRate(ttsType)));
}

/**
 * @param {string} ttsType A TTS type.
 * @param {number} volume A playback volume.
 * @returns {number} A playback volume within the allowed range.
 */
function clampTtsVolume(ttsType, volume) {
  return Math.max(getTtsMinVolume(), Math.min(volume, getTtsMaxVolume()));
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {string} The key under which is stored the playback rate for TTS sounds of the given type.
 */
function getLocalStorageTtsRateKey(ttsType) {
  return `${EXTENSION_PREFIX}tts_rate_${ttsType}`;
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {string} The key under which is stored the playback volume for TTS sounds of the given type.
 */
function getLocalStorageTtsVolumeKey(ttsType) {
  return `${EXTENSION_PREFIX}tts_volume_${ttsType}`;
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {number} The current playback rate for TTS sounds of the given type.
 */
function getTtsRate(ttsType) {
  return clampTtsRate(
    ttsType,
    Number(localStorage.getItem(getLocalStorageTtsRateKey(ttsType))) || 1.0
  );
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {number} The current playback volume for TTS sounds of the given type.
 */
function getTtsVolume(ttsType) {
  return clampTtsVolume(
    ttsType,
    Number(localStorage.getItem(getLocalStorageTtsVolumeKey(ttsType))) || 1.0
  );
}

/**
 * @param {string} ttsType A TTS type.
 * @returns {[*, Function]} An array holding the current rate and a function to update it.
 */
export const useTtsRate = ttsType => {
  const [ state, setState ] = useState(getTtsRate(ttsType));

  const setRate = useCallback(rate => {
    const updated = clampTtsRate(ttsType, Number(rate) || 1.0);
    setState(updated);
    localStorage.setItem(getLocalStorageTtsRateKey(ttsType), String(updated));
  }, [ ttsType, setState ]);

  return [ state, setRate ];
};

/**
 * @param {string} ttsType A TTS type.
 * @returns {[*, Function]} An array holding the current volume and a function to update it.
 */
export const useTtsVolume = ttsType => {
  const [ state, setState ] = useState(getTtsVolume(ttsType));

  const setVolume = useCallback(volume => {
    const updated = clampTtsVolume(ttsType, Number(volume) || 1.0);
    setState(updated);
    localStorage.setItem(getLocalStorageTtsVolumeKey(ttsType), String(updated));
  }, [ ttsType, setState ]);

  return [ state, setVolume ];
};

/**
 * @param {object} howl A "Howl" object from the "howler.js" library.
 * @returns {number} The current position of the given "Howl" object.
 */
export function getHowlPosition(howl) {
  if (howl.state() !== 'loaded') {
    return 0.0;
  }
  
  const wasLocked = !!howl._playLock;
  
  if (wasLocked) {
    // The "_playLock" flag is used by "howler.js" to prevent seeking a new position at the wrong moment.
    // The fact that it also serves as a short-circuit when we just want to read the current position seems wrong:
    // https://github.com/goldfire/howler.js/blob/9117525f0883ddb995f99ee843bba7f6d3442590/src/howler.core.js#L1607.
    // See also this issue: https://github.com/goldfire/howler.js/issues/1189.
    howl._playLock = false;
  }
  
  const position = Number(howl.seek());
  
  if (wasLocked) {
    howl._playLock = true;
  }
  
  return isNaN(position) ? 0.0 : position;
}

/**
 * Applies the current rate and volume settings of a given TTS type to a "Howl" object.
 *
 * @param {string} ttsType A TTS type.
 * @param {object} howl A "Howl" object from the "howler.js" library.
 */
export function applyCurrentTtsSettingsToHowlSound(ttsType, howl) {
  applyTtsSettingsToHowlSound(
    getTtsRate(ttsType),
    getTtsVolume(ttsType),
    howl
  );
}

/**
 * Applies the given rate and volume to a "Howl" object.
 *
 * @param {number} rate A playback rate.
 * @param {number} volume A playback volume.
 * @param {object} howl A "Howl" object from the "howler.js" library.
 */
export function applyTtsSettingsToHowlSound(rate, volume, howl) {
  /* eslint-disable no-undef */

  howl.rate(rate);
  howl.volume(volume > 1.0 ? 1.0 : volume);

  // The code below is currently never reached because we can't use the Web Audio API
  // (see why in the Howl.prototype.init override in ui.js).
  if (
    (volume > 1.0)
    && howl._webAudio
    && howl._getSoundIds
    && howl._soundById
    && Howler
    && Howler.ctx
  ) {
    // Based on Howl.prototype.volume:
    // https://github.com/goldfire/howler.js/blob/9117525f0883ddb995f99ee843bba7f6d3442590/src/howler.core.js#L1204.
    // We can only increase the volume beyond its initial level (= 1.0) if the sound uses the Web Audio API.
    const soundIds = howl._getSoundIds();

    for (let i = 0; i < soundIds.length; i++) {
      const sound = howl._soundById(soundIds[i]);

      if (sound && sound._node && !sound._muted) {
        sound._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
      }
    }
  }
}
