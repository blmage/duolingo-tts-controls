import { h, render } from 'preact';
import { _, it } from 'param.macro';
import { library } from '@fortawesome/fontawesome-svg-core';

import {
  faChevronUp,
  faKeyboard,
  faPause,
  faPlay,
  faSlidersH,
  faStop,
  faThumbtack,
} from '@fortawesome/free-solid-svg-icons';

import {
  faHourglassEnd,
  faHourglassStart,
  faRabbitFast,
  faTurtle,
  faVolumeDown,
  faVolumeUp
} from '@fortawesome/pro-light-svg-icons';

import { faCheck } from '@fortawesome/pro-regular-svg-icons';

import {
  discardEvent,
  getFocusedInput,
  isArray,
  isBlob,
  isObject,
  logError,
  toggleElement,
} from './functions';

import {
  applyCurrentTtsSettingsToAudioElement, applyCurrentTtsSettingsToHowlSound,
  TTS_TYPE_NORMAL,
  TTS_TYPE_SLOW,
  TTS_TYPES,
} from './tts';

import {
  EXTENSION_PREFIX,
  FORM_STYLE_BASIC,
  FORM_STYLE_CARTOON,
  FORM_STYLES,
  LISTENING_CHALLENGE_TYPES,
  NEW_SESSION_URL_REGEXP,
  PLAYBACK_STATE_PAUSED,
  PLAYBACK_STATE_PLAYING,
  PLAYBACK_STATE_STOPPED,
} from './constants';

import ToggleButton from './components/ToggleButton';
import AudioControlPanel from './components/AudioControlPanel';
import HowlControlPanel from './components/HowlControlPanel.js';

// Register the FontAwesome icons.
library.add(
  faCheck,
  faChevronUp,
  faHourglassEnd,
  faHourglassStart,
  faKeyboard,
  faPause,
  faPlay,
  faRabbitFast,
  faSlidersH,
  faStop,
  faThumbtack,
  faTurtle,
  faVolumeDown,
  faVolumeUp,
);

/**
 * A TTS sound from a practice challenge.
 *
 * @typedef {object} ChallengeTtsSound
 * @property {string} ttsType The TTS type of the sound.
 * @property {string} soundUrl The URL of the sound.
 * @property {number} challengeIndex The index of the challenge that uses the sound.
 */

/**
 * A TTS sound played directly via <audio> elements.
 *
 * @typedef {object} TtsAudio
 * @property {string} blobUrl The URL of the blob holding the sound.
 * @property {number} duration The duration of the sound.
 * @property {string} playbackState The current state of the sound.
 * @property {number} defaultStartPosition At what position the sound should start each time it is played.
 * @property {number} nextStartPosition At what position the sound should start the next time it is played.
 * @property {number} position The current playback position in the sound.
 * @property {HTMLAudioElement} currentElement? The <audio> element that was last used to play the sound.
 */

/**
 * A set of callbacks for TTS sounds played directly via <audio> elements.
 *
 * @typedef {object} AudioCallbackSet
 * @property {Function} onSettingsChange A callback usable to signify that the rate or volume setting changed.
 * @property {Function} onPlayRequest A callback usable to play the sound.
 * @property {Function} onPauseRequest A callback usable to pause the sound.
 * @property {Function} onStopRequest A callback usable to stop the sound.
 * @property {Function} onSeekRequest A callback usable to seek a new position in the sound.
 * @property {Function} onPinnedStart A callback usable to define the new default starting position.
 */

/**
 * A control form for a TTS sound.
 *
 * @typedef {object} ControlForm
 * @property {string} formStyle The style of the parent challenge form.
 * @property {string} ttsType The type of the TTS sound controlled by the form.
 * @property {boolean} isActive Whether the control form is currently displayed.
 * @property {boolean} isFocused Whether the control form is currently focused (/ can handle keyboard shortcuts).
 * @property {Element} panelWrapper The wrapper of the control panel.
 * @property {Element} playbackButton The button usable to play the TTS sound.
 * @property {Element} toggleButton The button usable to toggle the control form.
 * @property {?object} howl The "Howl" object used to play the TTS sound, if any.
 * @property {?TtsAudio} audio The state of the TTS sound, used when it is played directly via <audio> elements.
 * @property {?AudioCallbackSet} audioCallbacks A set of callbacks usable to manage the TTS sound (see above).
 */

/**
 * The TTS sounds used by the challenges of the current practice session.
 *
 * @type {ChallengeTtsSound[]}
 */
let challengeTtsSounds = [];

/**
 * Whether a new practice session is currently being loaded.
 *
 * @type {boolean}
 */
let isPracticeSessionLoading = false

/**
 * A list of callbacks usable to handle the sound playbacks that occurred when a practice session was loading.
 *
 * @type {Function[]}
 */
let pendingSoundPlaybackCallbacks = [];

/**
 * @type {Function}
 */
const originalXhrOpen = XMLHttpRequest.prototype.open;

// Catch the requests to load new practice sessions, remember the TTS sounds their challenges use.
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  if (url.match(NEW_SESSION_URL_REGEXP)) {
    isPracticeSessionLoading = true;

    this.addEventListener('load', () => {
      try {
        isPracticeSessionLoading = false; // eslint-disable-line no-unused-vars

        const data = isObject(this.response)
          ? this.response
          : JSON.parse(this.responseText);

        if (isObject(data) && isArray(data.challenges)) {
          challengeTtsSounds = [];

          data.challenges.forEach((challenge, challengeIndex) => {
            if (LISTENING_CHALLENGE_TYPES.indexOf(challenge.type) >= 0) {
              if (challenge.tts) {
                challengeTtsSounds.push({
                  ttsType: TTS_TYPE_NORMAL,
                  soundUrl: String(challenge.tts).trim(),
                  challengeIndex,
                });
              }

              if (challenge.slowTts) {
                challengeTtsSounds.push({
                  ttsType: TTS_TYPE_SLOW,
                  soundUrl: String(challenge.slowTts).trim(),
                  challengeIndex,
                });
              }
            }
          });

          pendingSoundPlaybackCallbacks.forEach(it());
          pendingSoundPlaybackCallbacks = [];
        }
      } catch (error) {
        logError('Could not handle the new session data: ');
      }
    });
  }

  return originalXhrOpen.call(this, method, url, async, user, password);
};

/**
 * The available control forms for the current challenge, sorted by TTS type.
 *
 * @type {object.<string, ControlForm>}
 */
let currentControlForms = {};

/**
 * The last seen challenge form.
 *
 * @type {Element|null}
 */
let lastChallengeForm = null;

/**
 * The last seen wrapper of all the original playback buttons of a challenge.
 *
 * @type {Element|null}
 */
let lastPlaybackButtonsWrapper = null;


/**
 * Finds the form elements of a given type in a given parent element (or document body),
 * and marks them using a set of unique class names.
 *
 * @param {string} elementType An element type.
 * @param {string} formStyle A form style.
 * @param {Element|null} parentElement The parent element in which to restrict the search, if any.
 * @returns {Element[]} The searched form elements.
 */
function findAndMarkFormElements(elementType, formStyle, parentElement = document.body) {
  const elements = Array.from(parentElement.querySelectorAll(ELEMENT_SELECTORS[elementType][formStyle]));

  elements.forEach(element => {
    element.classList.add(
      `${EXTENSION_PREFIX}${elementType}`,
      `${EXTENSION_PREFIX}${elementType}_${formStyle}`,
    );
  });

  return elements;
}

/**
 * @returns {string[]} The available TTS types for the current challenge.
 */
function getAvailableTtsTypes() {
  return Object.keys(currentControlForms);
}

/**
 * @param {HTMLAudioElement} element An <audio> element.
 * @returns {Object} A set of data about the corresponding sound.
 */
const getAudioElementData = element => ({
  blobUrl: element.src,
  duration: element.duration || 0,
  defaultStartPosition: 0,
  nextStartPosition: 0,
  position: element.currentTime || 0,
});

/**
 * @param {string} ttsType A TTS type.
 * @returns {HTMLAudioElement|null} The <audio> element currently used to play the given TTS sound, if any.
 */
const getCurrentControlFormAudioElement = ttsType => (
  currentControlForms[ttsType]?.audio?.currentElement
  && (currentControlForms[ttsType].audio.currentElement.src === currentControlForms[ttsType].audio.blobUrl)
  && currentControlForms[ttsType].audio.currentElement
  || null
);

/**
 * @returns {ControlForm|undefined} The active control form, if any.
 */
function getActiveControlForm() {
  return Object.values(currentControlForms).find(it.isActive);
}

/**
 * @returns {ControlForm|undefined} The focused control form, if any.
 */
function getFocusedControlForm() {
  return Object.values(currentControlForms).find(it.isActive && it.isFocused);
}

/**
 * Refreshes the control form controlling the TTS sound of a given type.
 *
 * @param {string} ttsType A TTS type.
 */
function refreshControlForm(ttsType) {
  if (!currentControlForms[ttsType] || !currentControlForms[ttsType].panelWrapper.isConnected) {
    return;
  }

  const {
    formStyle,
    isActive,
    isFocused,
    panelWrapper,
    toggleButton,
    howl,
    audio,
    audioCallbacks,
  } = currentControlForms[ttsType];

  render(
    <ToggleButton
      formStyle={formStyle}
      active={isActive}
      onClick={() => toggleControlForm(ttsType)}
    />,
    toggleButton.parentElement,
    toggleButton
  );

  render(
    howl
      ? (
        <HowlControlPanel
          formStyle={formStyle}
          ttsType={ttsType}
          active={isActive && isFocused}
          howl={howl}
        />
      ) : (
        <AudioControlPanel
          formStyle={formStyle}
          ttsType={ttsType}
          active={isActive && isFocused}
          audio={audio}
          {...audioCallbacks}
        />
      ),
    panelWrapper
  );
}

/**
 * Replaces the active control form with the one controlling the TTS sound of another given type,
 * or hides it if it is the same.
 *
 * @param {string} ttsType A TTS type.
 */
function toggleControlForm(ttsType) {
  if (!currentControlForms[ttsType] || !currentControlForms[ttsType].panelWrapper.isConnected) {
    return;
  }

  let hasActiveControls = false;
  const activeControlForm = getActiveControlForm();

  if (activeControlForm) {
    activeControlForm.isActive = false;
    activeControlForm.isFocused = false;
    refreshControlForm(activeControlForm.ttsType);
    toggleElement(activeControlForm.panelWrapper, false);
  }

  if (activeControlForm?.ttsType !== ttsType) {
    const form = currentControlForms[ttsType];
    form.isActive = true;
    form.isFocused = true;
    refreshControlForm(form.ttsType);
    toggleElement(form.panelWrapper, true);
    hasActiveControls = true;
  }

  if (null !== lastChallengeForm) {
    // Mark the challenge form so that we can adapt it to not lose any usability.
    lastChallengeForm.classList.toggle(HAS_ACTIVE_CONTROLS_CLASS_NAME, hasActiveControls);
  }
}

/**
 * Enables the handling of keyboard shortcuts by the active control form.
 */
function focusActiveControlForm() {
  const controlForm = getActiveControlForm();

  if (controlForm && !controlForm.isFocused) {
    controlForm.isFocused = true;
    refreshControlForm(controlForm.ttsType);
  }
}

/**
 * Disables the handling of keyboard shortcuts by the active control form.
 */
function blurActiveControlForm() {
  const controlForm = getActiveControlForm();

  if (controlForm?.isFocused) {
    controlForm.isFocused = false;
    refreshControlForm(controlForm.ttsType);
  }
}

/**
 * Cleans up all the current control forms by unmounting the underlying panels.
 * This allows to make sure that all the corresponding lifecycle events have been called.
 *
 * @param {boolean} force Whether to force the cleanup, even if the forms are still present in the DOM.
 */
function cleanUpControlForms(force = false) {
  Object.entries(currentControlForms)
    .forEach(([ type, form ]) => {
      if (force || !form.panelWrapper.isConnected) {
        render('', form.panelWrapper);
        delete currentControlForms[type];
      }
    });
}

// Regularly clean up the obsolete control forms.
setInterval(() => cleanUpControlForms(), 50);

/**
 * Prepares the control forms for the new current challenge, if it has changed since the previous call.
 *
 * @param {number} challengeIndex The index of the new current challenge.
 */
function prepareControlForms(challengeIndex) {
  let playbackButtonsWrapper;

  const formStyle = FORM_STYLES.find(style => {
    [ playbackButtonsWrapper ] = findAndMarkFormElements(PLAYBACK_BUTTONS_WRAPPER, style);
    return !!playbackButtonsWrapper;
  });

  if (playbackButtonsWrapper !== lastPlaybackButtonsWrapper) {
    // Always force unmounting the previous control panels when a change occurred,
    // to ensure that all the necessary cleanup has been done (such as stopping and resetting the TTS sounds).
    cleanUpControlForms(true);

    lastPlaybackButtonsWrapper = playbackButtonsWrapper;

    if (!playbackButtonsWrapper) {
      return;
    }

    // Find and mark all the required original UI elements.
    [ lastChallengeForm ] = findAndMarkFormElements(CHALLENGE_FORM, formStyle);

    // Check for translation hints to prevent false positives, because listening and translation challenges
    // can share TTS sounds, and their DOM structures look alike (especially in the case of "cartoon" forms).
    if (!lastChallengeForm || lastChallengeForm.querySelector(TRANSLATION_CHALLENGE_HINT_SELECTOR)) {
      return;
    }

    const [ playbackForm ] = findAndMarkFormElements(PLAYBACK_FORM, formStyle, lastChallengeForm);

    const playbackButtonWrappers = findAndMarkFormElements(
      PLAYBACK_BUTTON_WRAPPER,
      formStyle,
      playbackButtonsWrapper
    );

    const playbackButtons = playbackButtonWrappers.flatMap(findAndMarkFormElements(PLAYBACK_BUTTON, formStyle, _));

    if (!playbackForm || (0 === playbackButtons.length)) {
      return;
    }

    // Create a control form and a toggle button for each available TTS playback button.
    playbackButtons.forEach(playbackButton => {
      const ttsType = playbackButton.matches(ELEMENT_SELECTORS[SLOW_PLAYBACK_BUTTON][formStyle])
        ? TTS_TYPE_SLOW
        : TTS_TYPE_NORMAL;

      const panelWrapper = document.createElement('div');
      panelWrapper.classList.add(...CONTROL_FORM_BASE_CLASS_NAMES);
      panelWrapper.style.display = 'none';
      playbackForm.append(panelWrapper);

      const container = playbackButton.parentElement;

      // Prepend an invisible button to the wrapper, which is currently a <label>, to make it the controlled element
      // instead of the playback button.
      // This prevents the :hover and :active effects of the playback button from being triggered when not relevant.
      const labelStateCatcher = document.createElement('button');
      labelStateCatcher.style.display = 'none';
      labelStateCatcher.addEventListener('click', () => playbackButton.click());
      container.prepend(labelStateCatcher);

      // Append a placeholder which will be replaced by the toggle button.
      const placeholder = document.createElement('div');
      container.appendChild(placeholder);

      render(
        <ToggleButton
          formStyle={formStyle}
          active={false}
          onClick={() => toggleControlForm(ttsType)}
        />,
        container,
        placeholder
      );

      placeholder.isConnected && container.removeChild(placeholder);

      let audioCallbacks = null;

      if (!isHowlerUsed) {
        const withAudio = callback => (
          currentControlForms[ttsType]?.audio
          && (panelWrapper === currentControlForms[ttsType].panelWrapper)
          && callback(currentControlForms[ttsType].audio, getCurrentControlFormAudioElement(ttsType))
        );

        const onSettingsChange = () => withAudio((_, element) => (
          element && applyCurrentTtsSettingsToAudioElement(ttsType, element)
        ));

        const onPlayRequest = () => {
          playbackButton.click();
          getOriginalFocusedInput()?.blur();
        };

        const onPauseRequest = () => withAudio((audio, element) => {
          audio.playbackState = PLAYBACK_STATE_PAUSED;

          if (element) {
            audio.nextStartPosition = element.currentTime;
            element.pause();
          }

          refreshControlForm(ttsType);
        });

        const onStopRequest = () => withAudio((audio, element) => {
          audio.playbackState = PLAYBACK_STATE_STOPPED;
          audio.nextStartPosition = audio.defaultStartPosition;
          audio.position = audio.defaultStartPosition;
          element?.pause();
          refreshControlForm(ttsType);
        });

        const onSeekRequest = position => withAudio((audio, element) => {
          audio.position = position;

          if (PLAYBACK_STATE_PLAYING !== audio.playbackState) {
            audio.nextStartPosition = position;
          } else if (element) {
            element.currentTime = position;
          }

          refreshControlForm(ttsType);
        });

        const onPinnedStart = position => withAudio(audio => {
          audio.defaultStartPosition = position;
          audio.nextStartPosition = position;
        });

        audioCallbacks = {
          onSettingsChange,
          onPlayRequest,
          onPauseRequest,
          onStopRequest,
          onSeekRequest,
          onPinnedStart,
        };
      }

      currentControlForms[ttsType] = {
        formStyle,
        ttsType,
        isActive: false,
        isFocused: false,
        panelWrapper,
        playbackButton,
        toggleButton: container.lastElementChild,
        howl: null,
        audio: null,
        audioCallbacks,
      };
    });

    // Register the new current "Howl" objects once they are loaded, and apply the current playback settings on them.
    const challengeHowls = challengeTtsSounds
      .filter(it.challengeIndex === challengeIndex)
      .map(sound => [ sound.ttsType, initializedHowls[sound.soundUrl] ])
      .filter(isObject(_[1]))

    challengeHowls.forEach(([ ttsType, howl ]) => {
      const onHowlLoaded = () => {
        if (
          currentControlForms[ttsType]
          && (playbackButtonsWrapper === lastPlaybackButtonsWrapper)
        ) {
          applyCurrentTtsSettingsToHowlSound(ttsType, howl);
          currentControlForms[ttsType].howl = howl;
          refreshControlForm(ttsType);
        }
      };

      if (howl.state() === 'loaded') {
        onHowlLoaded();
      } else {
        howl.once('load', onHowlLoaded);
      }
    });
  }
}

/**
 * Whether the "howler.js" library is used to play the TTS sounds.
 *
 * @type {boolean}
 */
let isHowlerUsed = false;

/**
 * The active "Howl" objects that were initialized by Duolingo, sorted by source.
 *
 * @type {object.<string, object>}
 */
let initializedHowls = {};

/**
 * The last seen prototype for the "Howl" type from the "howler.js" library.
 *
 * @type {object|null}
 */
let lastHowlPrototype = null;

// Poll for the "Howl" prototype and override it once it is available.
setInterval(() => {
  /* eslint-disable no-undef */

  if (window.Howl && (lastHowlPrototype !== Howl.prototype)) {
    lastHowlPrototype = Howl.prototype;

    const originalHowlInit = Howl.prototype.init;
    const originalHowlPlay = Howl.prototype.play;

    Howl.prototype.init = function (options) {
      try {
        // Remember each "Howl" object by their source.
        // This will be useful later to find all the active "Howl" objects for the current challenge.
        [ options.src ].flat().forEach((initializedHowls[it] = this));
      } catch (error) {
        logError(error, 'Could not handle the initialized "Howl" sound: ');
      }

      return originalHowlInit.call(this, options);
    }

    Howl.prototype.play = function (id) {
      try {
        if (!id) {
          const src = String(this._src || this._parent && this._parent._src || '').trim();

          const playbackCallback = () => {
            const challengeSound = challengeTtsSounds.find(src === it.soundUrl);

            if (isObject(challengeSound)) {
              isHowlerUsed = true;
              prepareControlForms(challengeSound.challengeIndex);
            }
          };

          !isPracticeSessionLoading
            ? playbackCallback()
            : pendingSoundPlaybackCallbacks.push(playbackCallback);
        }
      } catch (error) {
        logError(error, 'Could not handle the played "Howl" sound: ');
      }

      return originalHowlPlay.call(this, id);
    };
  }
}, 50);

// Regularly clean up the obsolete "Howl" objects.
setInterval(() => {
  initializedHowls = Object.fromEntries(
    Object.entries(initializedHowls).filter(it[1].state() !== 'unloaded')
  );
}, 60 * 1000);

/**
 * @type {Function}
 */
const originalFetch = window.fetch;

/**
 * @type {Function}
 */
const originalCreateObjectUrl = URL.createObjectURL;

/**
 * A map from blobs holding TTS sounds to the corresponding URLs.
 *
 * @type {WeakMap.<Blob, string>}
 */
let ttsBlobToBlobUrl = new WeakMap();

/**
 * A map from URLs of blobs holding TTS sounds to the original URLs of the sounds.
 *
 * @type {Object.<string, string>}
 */
let ttsBlobUrlToSoundUrl = {};

// Enforce stable URLs for TTS sound blobs, to be able to later identify them.

// Returns a stable URL for blobs holding TTS sounds.
URL.createObjectURL = function (object) {
  return isBlob(object) && ttsBlobToBlobUrl.has(object)
    ? ttsBlobToBlobUrl.get(object)
    : originalCreateObjectUrl.call(this, object);
}

// Make responses for TTS sounds return a stable Blob.
window.fetch = function (resource, init) {
  return originalFetch.call(this, resource, init)
    .then(response => {
      const originalResponse = response.clone();

      return response.blob()
        .then(blob => {
          if (
            (blob.type.indexOf('audio') === 0)
            && challengeTtsSounds.some(response.url === it.soundUrl)
          ) {
            const blobUrl = URL.createObjectURL(blob);
            ttsBlobToBlobUrl.set(blob, blobUrl);
            ttsBlobUrlToSoundUrl[blobUrl] = response.url;
            // By default, blob() returns a new Blob each time.
            originalResponse.blob = async () => blob;
          }

          return originalResponse;
        })
        .catch(() => originalResponse)
    })
}

/**
 * @type {Function}
 */
const originalAudioPlay = Audio.prototype.play;

Audio.prototype.play = function () {
  if (isHowlerUsed) {
    return originalAudioPlay.call(this);
  }

  const playbackCallback = () => {
    try {
      const challengeSound = challengeTtsSounds.find(
        (this.src === it.soundUrl)
        || (ttsBlobUrlToSoundUrl[this.src] === it.soundUrl)
      );

      if (isObject(challengeSound)) {
        const ttsType = challengeSound.ttsType;

        prepareControlForms(challengeSound.challengeIndex);

        if (currentControlForms[ttsType]) {
          applyCurrentTtsSettingsToAudioElement(ttsType, this);

          const controlForm = currentControlForms[ttsType];

          if (!controlForm.audio) {
            controlForm.audio = getAudioElementData(this);

            // Preload the slow TTS audio data, so that the control form is fully usable from the start.
            if ((TTS_TYPE_NORMAL === ttsType) && currentControlForms[TTS_TYPE_SLOW]) {
              const slowControlForm = currentControlForms[TTS_TYPE_SLOW];

              const slowTtsSound = challengeTtsSounds.find(
                (TTS_TYPE_SLOW === it.ttsType)
                && (challengeSound.challengeIndex === it.challengeIndex)
              );

              const slowSoundUrl = slowTtsSound
                && Object.entries(ttsBlobUrlToSoundUrl)
                  .filter(slowTtsSound.soundUrl === it[1])
                  .map(it[0])[0]
                || slowTtsSound.soundUrl;

              if (slowSoundUrl) {
                setTimeout(() => {
                  const slowAudio = new Audio(slowSoundUrl);

                  slowAudio.addEventListener('loadedmetadata', () => {
                    slowControlForm.audio = slowControlForm.audio || getAudioElementData(slowAudio);
                  });

                  slowAudio.load();
                });
              }
            }
          }

          if (controlForm.audio.nextStartPosition > 0) {
            this.currentTime = controlForm.audio.nextStartPosition;
            controlForm.audio.nextStartPosition = controlForm.audio.defaultStartPosition;
          }

          controlForm.audio.blobUrl = this.src;
          controlForm.audio.playbackState = PLAYBACK_STATE_PLAYING;
          controlForm.audio.currentElement = this;

          refreshControlForm(challengeSound.ttsType);
        }
      }
    } catch (error) {
      logError(error, 'Could not handle the played audio: ');
    }
  };

  !isPracticeSessionLoading
    ? playbackCallback()
    : pendingSoundPlaybackCallbacks.push(playbackCallback);

  return originalAudioPlay.call(this);
};

// Regularly check whether a sound is being played or has just ended, and refresh the corresponding control form.
setInterval(() => TTS_TYPES.forEach(ttsType => {
  const audio = currentControlForms[ttsType]?.audio;

  if (audio && (PLAYBACK_STATE_PLAYING === audio.playbackState)) {
    const audioElement = getCurrentControlFormAudioElement(ttsType);

    if (audioElement) {
      audio.duration = audio.duration || audioElement.duration || 0;
    }

    if (audioElement && !audioElement.ended && !audioElement.paused) {
      audio.position = audioElement.currentTime;
    } else {
      audio.playbackState = PLAYBACK_STATE_STOPPED;
      audio.position = audio.nextStartPosition;
    }

    refreshControlForm(ttsType);
  }
}), 75);

// Allow control forms to handle keyboard shortcuts only when no input from the original UI is focused.

/**
 * Whether we are currently resetting the tabbing position, triggering meaningless "focusin" and "focusout" events.
 *
 * @type {boolean}
 */
let isResettingTabbingPosition = false;

/**
 * @returns {Element|undefined} The currently focused input, if any, and if it belongs to the original UI.
 */
function getOriginalFocusedInput() {
  const input = getFocusedInput();

  return input && !Object.values(currentControlForms).some(it.isActive && it.panelWrapper.contains(input))
    ? input
    : undefined;
}

document.addEventListener(
  'focusin',
  () => !isResettingTabbingPosition && getOriginalFocusedInput() && blurActiveControlForm()
);

document.addEventListener(
  'focusout',
  () => !isResettingTabbingPosition && !getOriginalFocusedInput() && focusActiveControlForm()
);

/**
 * The global keyboard shortcuts, sorted by key.
 *
 * @type {object}
 */
const keyboardShortcuts = {
  // Switches focus back and forth between the active control form and the answer input.
  // Opens the first available control form when none is opened yet.
  control: () => {
    const controlForm = getActiveControlForm();
    const focusedInput = getOriginalFocusedInput();

    if (controlForm) {
      if (focusedInput) {
        focusedInput.blur();
        focusActiveControlForm();
      } else {
        const answerInput = document.querySelector(ANSWER_INPUT_SELECTOR);

        if (answerInput && !answerInput.disabled) {
          blurActiveControlForm();
          answerInput.focus();
        }
      }
    } else {
      const ttsTypes = getAvailableTtsTypes();

      if (ttsTypes.length > 0) {
        focusedInput && focusedInput.blur();
        toggleControlForm(ttsTypes[0]);
      }
    }
  },

  // Closes the active control form, if any, then focuses the answer input.
  escape: () => {
    const controlForm = getActiveControlForm();

    if (controlForm) {
      const answerInput = document.querySelector(ANSWER_INPUT_SELECTOR);
      toggleControlForm(controlForm.ttsType);
      answerInput && answerInput.focus();
    }
  },

  // Cycles between the available control forms, when there is more than one and any is active.
  tab: () => {
    const ttsTypes = getAvailableTtsTypes();

    if (ttsTypes.length > 1) {
      const controlForm = getFocusedControlForm();

      if (controlForm) {
        const nextIndex = (ttsTypes.indexOf(controlForm.ttsType) + 1) % ttsTypes.length;
        toggleControlForm(ttsTypes[nextIndex]);

        // Reset the current tabbing position to prevent eventually reaching the address bar.
        isResettingTabbingPosition = true;
        controlForm.toggleButton.focus();
        controlForm.toggleButton.blur();
        isResettingTabbingPosition = false;
      }
    }
  },
};

/**
 * The set of all the keys that are currently pressed.
 *
 * @type {Set<string>}
 */
const pressedKeys = new Set();

/**
 * The code of the key that has been currently pressed while none other was.
 *
 * @type {string|null}
 */
let singlePressedKey = null;

document.addEventListener('keydown', event => {
  if ((13 === event.keyCode) && ('' === event.key)) {
    // Compatibility with the "Duolingo Unicode Normalizer" extension,
    // which (currently) does not dispatch "keyup" events.
    return;
  }

  if (0 === pressedKeys.size) {
    singlePressedKey = event.code;
  } else {
    singlePressedKey = null;
  }

  pressedKeys.add(event.code)
});

document.addEventListener('keyup', event => {
  if (event.code === singlePressedKey) {
    const key = event.key.toLowerCase();

    if (keyboardShortcuts[key]) {
      discardEvent(event);
      keyboardShortcuts[key](event);
    }
  }

  pressedKeys.delete(event.code);
  singlePressedKey = null;
});

window.addEventListener('blur', () => {
  pressedKeys.clear();
  singlePressedKey = null;
});

/**
 * A challenge form, including playback elements and answer inputs.
 *
 * @type {string}
 */
const CHALLENGE_FORM = 'challenge-form';

/**
 * A wrapper for a set of playback-related elements.
 *
 * @type {string}
 */
const PLAYBACK_FORM = 'playback-form';

/**
 * A wrapper for a set of playback buttons.
 *
 * @type {string}
 */
const PLAYBACK_BUTTONS_WRAPPER = 'playback-buttons-wrapper';

/**
 * A wrapper for a single playback button.
 *
 * @type {string}
 */
const PLAYBACK_BUTTON_WRAPPER = 'playback-button-wrapper';

/**
 * A playback button for TTS of any speed.
 *
 * @type {string}
 */
const PLAYBACK_BUTTON = 'playback-button';

/**
 * A playback button for slow TTS.
 *
 * @type {string}
 */
const SLOW_PLAYBACK_BUTTON = 'slow-playback-button';

/**
 * The class name that can be added to an element to indicate that playback controls are active.
 *
 * @type {string}
 */
const HAS_ACTIVE_CONTROLS_CLASS_NAME = `${EXTENSION_PREFIX}with-active-controls`;

/**
 * The CSS selectors for the different UI elements we need to find, mark, and possibly adapt.
 * Sorted by element type and form style.
 *
 * @type {object}
 */
const ELEMENT_SELECTORS = {
  // The child of the actual challenge form is currently preferred here,
  // because it applies dimensions that we need to override.
  [CHALLENGE_FORM]: {
    [FORM_STYLE_BASIC]: LISTENING_CHALLENGE_TYPES.map(`[data-test*="challenge-${it}"] > *:first-child`),
    [FORM_STYLE_CARTOON]: LISTENING_CHALLENGE_TYPES.map(`[data-test*="challenge-${it}"] > *:first-child`),
  },
  // The control forms will be appended to those elements.
  [PLAYBACK_FORM]: {
    [FORM_STYLE_BASIC]: '._1cnOk',
    [FORM_STYLE_CARTOON]: '._3mO3g',
  },
  // Two forms can be present on the page at a given time, the inactive one being hidden under the other using
  // a negative z-index on a wrapper (inside a "[ancestor_class]:nth-child(2)" rule).
  // Use [ancestor_class]:first-child here to make sure we target the right form.
  [PLAYBACK_BUTTONS_WRAPPER]: {
    [FORM_STYLE_BASIC]: '._863KE:first-child ._3L7Fu',
    [FORM_STYLE_CARTOON]: '._863KE:first-child ._13VDF',
  },
  // The wrapper of the <button> elements which trigger playing the TTS sounds.
  [PLAYBACK_BUTTON_WRAPPER]: {
    [FORM_STYLE_BASIC]: '.sgs9X',
    [FORM_STYLE_CARTOON]: '.sgs9X',
  },
  // The <button> elements which trigger playing the TTS sounds.
  [PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '._1x6bc',
    [FORM_STYLE_CARTOON]: '._2kfEr',
  },
  // The <button> elements which trigger playing the slow TTS sounds.
  [SLOW_PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '._1Uoqa',
    [FORM_STYLE_CARTOON]: '._1Vrvu',
  },
}

/**
 * The class names to apply to the control forms.
 *
 * @type {string[]}
 */
const CONTROL_FORM_BASE_CLASS_NAMES = [
  `${EXTENSION_PREFIX}control-form`,
  // Copied by searching for a gray border color applied to the "::after" pseudo-element.
  // This choice requires extra care for Darklingo++
  // (it is preferable to have the same border color as the answer <textarea>).
  '_1wJYQ',
];

/**
 * A CSS selector for the hints displayed under words in the translation challenges.
 *
 * @type {string}
 */
const TRANSLATION_CHALLENGE_HINT_SELECTOR = '[data-test="hint-sentence"]';

/**
 * A CSS selector for the free answer input of a challenge.
 *
 * @type {string}
 */
const ANSWER_INPUT_SELECTOR = [
  'input[data-test="challenge-text-input"]',
  'textarea[data-test="challenge-translate-input"]',
].join(', ');
