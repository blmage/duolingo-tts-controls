import { h, render } from 'preact';
import { _, it } from 'param.macro';
import { discardEvent, isArray, isObject, logError, toggleElement } from './functions';
import { applyCurrentTtsSettingsToHowlSound, TTS_TYPE_NORMAL, TTS_TYPE_SLOW } from './tts';

import {
  EXTENSION_PREFIX,
  FORM_STYLE_BASIC,
  FORM_STYLE_CARTOON, FORM_STYLES,
  LISTENING_CHALLENGE_TYPES,
  NEW_SESSION_URL_REGEXP
} from './constants';

import ControlPanel from './components/ControlPanel';

/**
 * A TTS sound from a practice challenge.
 *
 * @typedef {object} ChallengeTtsSound
 * @property {string} ttsType The TTS type of the sound.
 * @property {string} soundUrl The URL of the sound.
 * @property {number} challengeIndex The index of the challenge that uses the sound.
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
        }
      } catch (error) {
        logError('Could not handle the new session data: ');
      }
    });
  }

  return originalXhrOpen.call(this, method, url, async, user, password);
};

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

        // The "howler.js" library uses XHR requests to load sounds when using the Web Audio API,
        // but they fail because of the CORS policy. Unfortunately, there is nothing we can do about this.
        /*
        // Disable the "html5" option for TTS sounds, because it prevents us from increasing the volume over 1.0.
        // As per the docs, this option is mostly preferable for large files, so this shouldn't be troublesome.
        let isTtsSound;
        
        if (isPracticeSessionLoading) {
          // Assume that the sound comes from a practice session which has just been loaded.
          // It's hard to see any reason why a large file would be loaded at this point.
          isTtsSound = true;
        } else {
          isTtsSound = [ options.src ].flat().some(src => challengeTtsSounds.some(src === it.soundUrl));
        }
  
        if (isTtsSound) {
          options.html5 = false;
        }
        */
      } catch (error) {
        logError(error, 'Could not handle the initialized "Howl" sound: ');
      }

      return originalHowlInit.call(this, options);
    }

    Howl.prototype.play = function (id) {
      try {
        if (!id) {
          const src = String(this._src || this._parent && this._parent._src || '').trim();
          const challengeSound = challengeTtsSounds.find(src === it.soundUrl);

          if (isObject(challengeSound)) {
            setCurrentChallenge(challengeSound.challengeIndex);
          }
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
 * The last seen wrapper of all the playback buttons of a challenge.
 *
 * @type {Element|null}
 */
let lastPlaybackButtonsWrapper = null;

/**
 * The loaded "Howl" objects for the current challenge, sorted by TTS type.
 *
 * @type {object.<string, object>}
 */
let currentChallengeHowls = {};

/**
 * The controls forms for the current challenge, sorted by TTS type.
 *
 * @type {object.<string, Element>}
 */
let currentControlsForms = {};

/**
 * Finds the form elements of a given type in the given parent element (or document body),
 * and marks them using a set of unique class names.
 *
 * @param {string} elementType An element type.
 * @param {string} formStyle A form style.
 * @param {Element|null} parent The parent element in which to restrict the search, if any.
 * @returns {Element[]} The searched form elements.
 */
function findAndMarkFormElements(elementType, formStyle, parent = document.body) {
  const elements = Array.from(parent.querySelectorAll(ELEMENT_SELECTORS[elementType][formStyle]));

  elements.forEach(element => {
    element.classList.add(
      `${EXTENSION_PREFIX}${elementType}`,
      `${EXTENSION_PREFIX}${elementType}_${formStyle}`,
    );
  });

  return elements;
}

/**
 * (Re-)renders the control panel in the current form corresponding to the given TTS type.
 *
 * @param {string} ttsType A TTS type.
 */
function renderFormControlPanel(ttsType) {
  if (currentControlsForms[ttsType] && currentControlsForms[ttsType].isConnected) {
    render(
      <ControlPanel
        key={`control-panel-${ttsType}`}
        ttsType={ttsType}
        howl={currentChallengeHowls[ttsType]} />,
      currentControlsForms[ttsType]
    );
  }
}

/**
 * Cleans up the controls form by unmounting the underlying panels.
 * This allows to make sure that all the corresponding lifecycle events have been called.
 *
 * @param {boolean} force Whether to force the cleanup, even if the forms are still present in the DOM.
 */
function cleanUpControlsForms(force = false) {
  Object.entries(currentControlsForms)
    .forEach(([ type, form ]) => {
      if (force || !form.isConnected) {
        render('', form);
        delete currentControlsForms[type];
      }
    });
}

// Regularly clean up the obsolete controls forms.
setInterval(() => cleanUpControlsForms(), 50);

/**
 * Sets the new current challenge, prepares the UI and new current TTS data if an actual change took place.
 *
 * @param {number} challengeIndex The index of the new current challenge.
 */
function setCurrentChallenge(challengeIndex) {
  let playbackButtonsWrapper;

  const formStyle = FORM_STYLES.find(style => {
    [ playbackButtonsWrapper ] = findAndMarkFormElements(PLAYBACK_BUTTONS_WRAPPER, style);
    return !!playbackButtonsWrapper;
  });

  if (playbackButtonsWrapper !== lastPlaybackButtonsWrapper) {
    // Always force unmounting the previous control panels when a change occurred,
    // to ensure that all the necessary cleanup has been done (such as resetting the TTS sounds).
    cleanUpControlsForms(true);

    lastPlaybackButtonsWrapper = playbackButtonsWrapper;

    if (!playbackButtonsWrapper) {
      return;
    }

    // Find and mark all the required original UI elements.
    const [ challengeForm ] = findAndMarkFormElements(CHALLENGE_FORM, formStyle);
    const [ playbackForm ] = findAndMarkFormElements(PLAYBACK_FORM, formStyle, challengeForm);

    const playbackButtonWrappers = findAndMarkFormElements(
      PLAYBACK_BUTTON_WRAPPER,
      formStyle,
      playbackButtonsWrapper
    );

    const playbackButtons = playbackButtonWrappers.flatMap(
      findAndMarkFormElements(PLAYBACK_BUTTON, formStyle, _)
    );

    if (!challengeForm || !playbackForm || (0 === playbackButtons.length)) {
      return;
    }

    const toggleButtons = {};

    // Create a controls form and a toggle button for each available TTS playback button.
    playbackButtons.forEach(playbackButton => {
      const ttsType = playbackButton.matches(ELEMENT_SELECTORS[SLOW_PLAYBACK_BUTTON][formStyle])
        ? TTS_TYPE_SLOW
        : TTS_TYPE_NORMAL;

      const controlsForm = document.createElement('div');
      controlsForm.classList.add(CONTROLS_FORM_BASE_CLASS_NAME);
      controlsForm.style.display = 'none';
      playbackForm.append(controlsForm);

      currentControlsForms[ttsType] = controlsForm;

      const toggleButton = document.createElement('button');
      toggleButton.classList.add(CONTROLS_FORM_TOGGLE_BUTTON_BASE_CLASS_NAME);
      toggleButton.classList.add(...CONTROLS_FORM_TOGGLE_BUTTON_CLASS_NAMES[formStyle]);
      playbackButton.after(toggleButton);

      toggleButtons[ttsType] = toggleButton;
    });

    // Register the new current "Howl" objects once they are loaded, and apply the current playback settings on them.
    currentChallengeHowls = {};

    const challengeHowls = challengeTtsSounds
      .filter(it.challengeIndex === challengeIndex)
      .map(sound => [ sound.ttsType, initializedHowls[sound.soundUrl] ])
      .filter(isObject(_[1]))

    challengeHowls.forEach(([ ttsType, challengeHowl ]) => {
      const onHowlLoaded = () => {
        if (playbackButtonsWrapper === lastPlaybackButtonsWrapper) {
          applyCurrentTtsSettingsToHowlSound(ttsType, challengeHowl);
          currentChallengeHowls[ttsType] = challengeHowl;
          renderFormControlPanel(ttsType);
        }
      };

      if (challengeHowl.state() === 'loaded') {
        onHowlLoaded();
      } else {
        challengeHowl.once('load', onHowlLoaded);
      }
    });

    // Wire the form toggling effects for each button.
    const toggleButtonEntries = Object.entries(toggleButtons);

    toggleButtonEntries.forEach(([ ttsType, toggleButton ]) => {
      toggleButton.addEventListener('click', event => {
        discardEvent(event);

        if (!currentControlsForms[ttsType] || !currentControlsForms[ttsType].isConnected) {
          return;
        }

        let hasActiveControls = false;

        // Adapt the state of each toggle button and controls form as necessary.
        toggleButtonEntries.forEach(([ otherType, otherButton ]) => {
          const isActive = otherButton.classList.contains(HAS_ACTIVE_CONTROLS_CLASS_NAME);

          if (isActive) {
            if (currentControlsForms[otherType]) {
              toggleElement(currentControlsForms[otherType], false);
              otherButton.classList.remove(...CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAMES[formStyle]);
            }
          } else if (toggleButton === otherButton) {
            renderFormControlPanel(ttsType);
            toggleElement(currentControlsForms[ttsType], true);
            otherButton.classList.add(...CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAMES[formStyle]);
            hasActiveControls = true;
          }
        });

        // Mark the challenge form so that we can adapt it to not lose any usability.
        challengeForm.classList.toggle(HAS_ACTIVE_CONTROLS_CLASS_NAME, hasActiveControls);
      });
    });
  }
}

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
  // because it applies dimensions we need to override.
  [CHALLENGE_FORM]: {
    [FORM_STYLE_BASIC]: '[data-test*="challenge"] > *:first-child',
    [FORM_STYLE_CARTOON]: '[data-test*="challenge"] > *:first-child',
  },
  // The controls forms will be appended to those elements.
  [PLAYBACK_FORM]: {
    [FORM_STYLE_BASIC]: '._3msZN',
    [FORM_STYLE_CARTOON]: '.esH1e',
  },
  [PLAYBACK_BUTTONS_WRAPPER]: {
    // Chosen over the other candidates because we need to apply centering here.
    [FORM_STYLE_BASIC]: '._3hbUp',
    // The choice was not important here.
    [FORM_STYLE_CARTOON]: '._3D7BY',
  },
  // The <button> elements which trigger playing the TTS sounds.
  [PLAYBACK_BUTTON_WRAPPER]: {
    [FORM_STYLE_BASIC]: '._3hUV6',
    [FORM_STYLE_CARTOON]: '._3hUV6',
  },
  // The <button> elements which trigger playing the TTS sounds.
  [PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '._2dIjg',
    [FORM_STYLE_CARTOON]: '._1kiAo',
  },
  // The <button> elements which trigger playing the slow TTS sounds.
  [SLOW_PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '.gJtFB',
    [FORM_STYLE_CARTOON]: '._1ySpy',
  },
}

/**
 * The base class name applied to the controls forms.
 *
 * @type {string}
 */
const CONTROLS_FORM_BASE_CLASS_NAME = `${EXTENSION_PREFIX}controls-form`;

/**
 * The base class name applied to the toggle buttons for the controls forms.
 *
 * @type {string}
 */
const CONTROLS_FORM_TOGGLE_BUTTON_BASE_CLASS_NAME = `${EXTENSION_PREFIX}controls-form-toggle-button`;

/**
 * The sets of class names used by the toggle buttons for the controls forms, sorted by form style.
 * Copied from the original playback buttons, ignoring the class names that set dimensions.
 *
 * @type {object.<string, string[]>}
 */
const CONTROLS_FORM_TOGGLE_BUTTON_CLASS_NAMES = {
  [FORM_STYLE_BASIC]: [
    '_2dIjg',
    'XepLJ',
    '_1bJB-',
    'vy3TL',
    '_3iIWE',
    '_1Mkpg',
    '_1Dtxl',
    '_1sVAI',
    'sweRn',
    '_1BWZU',
    '_2bW5I',
    '_3ZpUo',
    '_2odwU',
  ],
  [FORM_STYLE_CARTOON]: [
    '_1kiAo',
    '_3iIWE',
    '_1Mkpg',
    '_2bW5I',
    '_1Dtxl',
    // Copied by searching for the same color as the "Use keyboard" button, but without the hover and pointer styles.
    'D9gQ7',
  ],
};

/**
 * The sets of class names added to the active toggle buttons, sorted by form style.
 *
 * @type {object.<string, string[]>}
 */
const CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAMES = {
  [FORM_STYLE_BASIC]: [
    HAS_ACTIVE_CONTROLS_CLASS_NAME,
  ],
  [FORM_STYLE_CARTOON]: [
    HAS_ACTIVE_CONTROLS_CLASS_NAME,
    // Copied by searching for the main link color without side effects.
    '_1RcSv',
  ],
};
