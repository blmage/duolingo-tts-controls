import { h, render } from 'preact';
import { _, it } from 'param.macro';
import { discardEvent, isArray, isObject, logError, toggleElement } from './functions';
import { EXTENSION_PREFIX, LISTENING_CHALLENGE_TYPES, NEW_SESSION_URL_REGEXP } from './constants';
import { applyCurrentTtsSettingsToHowlSound, TTS_TYPE_NORMAL, TTS_TYPE_SLOW } from './tts';
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
 * Sets the new current challenge, and prepares the current TTS data and UI accordingly.
 * This won't do anything if the current challenge has not actually changed.
 *
 * @param {number} challengeIndex The index of the new current challenge.
 */
function setCurrentChallenge(challengeIndex) {
  const playbackButtonsWrapper = document.querySelector(PLAYBACK_BUTTONS_WRAPPER_SELECTOR);

  if (playbackButtonsWrapper !== lastPlaybackButtonsWrapper) {
    lastPlaybackButtonsWrapper = playbackButtonsWrapper;

    // Force unmounting the previous control panels to ensure that all the necessary cleanup has been done.
    Object.values(currentControlsForms).forEach(render('', _));

    currentControlsForms = {};

    if (null === playbackButtonsWrapper) {
      return;
    }

    const playbackButtons = playbackButtonsWrapper.querySelectorAll(PLAYBACK_BUTTON_SELECTOR);

    if (0 === playbackButtons.length) {
      return;
    }

    const toggleButtons = {};

    // Create a controls form and a toggle button for each available TTS sound.
    playbackButtons.forEach(playbackButton => {
      const ttsType = playbackButton.matches(SLOW_PLAYBACK_BUTTON_SELECTOR)
        ? TTS_TYPE_SLOW
        : TTS_TYPE_NORMAL;

      const controlsForm = document.createElement('div');
      controlsForm.classList.add(...CONTROLS_FORM_CLASS_NAMES);
      controlsForm.style.display = 'none';
      playbackButtonsWrapper.append(controlsForm);

      const toggleButton = document.createElement('button');
      toggleButton.classList.add(...CONTROLS_FORM_TOGGLE_BUTTON_CLASS_NAMES);
      playbackButton.parentNode.classList.add(PLAYBACK_BUTTON_WRAPPER_WITH_CONTROLS_CLASS_NAME);
      playbackButton.after(toggleButton);

      currentControlsForms[ttsType] = controlsForm;
      toggleButtons[ttsType] = toggleButton;
    });

    // Register and adapt the new current "Howl" objects, once they are loaded.
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

        // Adapt the state of each button as necessary.
        toggleButtonEntries.forEach(([ otherType, otherButton ]) => {
          const isActive = otherButton.classList.contains(CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAME);

          if (isActive) {
            if (currentControlsForms[otherType]) {
              toggleElement(currentControlsForms[otherType], false);
              otherButton.classList.remove(CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAME);
            }
          } else if (toggleButton === otherButton) {
            renderFormControlPanel(ttsType);
            toggleElement(currentControlsForms[ttsType], true);
            toggleButton.classList.add(CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAME);
            hasActiveControls = true;
          }
        });

        // Adapt the challenge form wrapper so that the increase in height does not hinder the UI usability.
        const challengeFormWrapper = document.querySelector(CHALLENGE_FORM_WRAPPER);

        if (challengeFormWrapper) {
          if (hasActiveControls) {
            challengeFormWrapper.classList.add(CHALLENGE_FORM_WRAPPER_WITH_CONTROLS);
          } else {
            challengeFormWrapper.classList.remove(CHALLENGE_FORM_WRAPPER_WITH_CONTROLS);
          }
        }
      });
    });
  }
}

/**
 * A CSS selector for the wrappers of challenge forms.
 *
 * @type {string}
 */
const CHALLENGE_FORM_WRAPPER = '._3Mkmw';

/**
 * The class name added to the wrappers of challenge forms when a TTS controls form is displayed.
 */
const CHALLENGE_FORM_WRAPPER_WITH_CONTROLS = `${EXTENSION_PREFIX}challenge-form-wrapper-with-controls`;

/**
 * A CSS selector for the wrappers of all the playback buttons of a challenge.
 *
 * @type {string}
 */
const PLAYBACK_BUTTONS_WRAPPER_SELECTOR = '._3msZN';

/**
 * The class name added to the wrappers of playback buttons when the latter have been assigned a controls form.
 *
 * @type {string}
 */
const PLAYBACK_BUTTON_WRAPPER_WITH_CONTROLS_CLASS_NAME = `${EXTENSION_PREFIX}playback-button-wrapper-with-controls`;

/**
 * A CSS selector for any playback button.
 *
 * @type {string}
 */
const PLAYBACK_BUTTON_SELECTOR = '._2dIjg';

/**
 * A CSS selector for slow playback buttons.
 *
 * @type {string}
 */
const SLOW_PLAYBACK_BUTTON_SELECTOR = '.gJtFB';

/**
 * The class names used by the controls forms.
 *
 * @type {string[]}
 */
const CONTROLS_FORM_CLASS_NAMES = [ `${EXTENSION_PREFIX}controls-form` ];

/**
 * The class names used by the toggle buttons for the controls forms.
 * Copied from the original playback buttons, ignoring the class names that set dimensions.
 *
 * @type {string[]}
 */
const CONTROLS_FORM_TOGGLE_BUTTON_CLASS_NAMES = [
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
  `${EXTENSION_PREFIX}controls-form-toggle-button`,
];

/**
 * The class name added to the toggle buttons when they are active.
 *
 * @type {string}
 */
const CONTROLS_FORM_TOGGLE_BUTTON_ACTIVE_CLASS_NAME = `${EXTENSION_PREFIX}active`;
