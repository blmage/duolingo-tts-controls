import { h, render } from 'preact';
import { _, it, lift } from 'one-liner.macro';
import { config as faConfig, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faCog, faKeyboard, faPause, faPlay, faStop, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { faClock, faTachometerAlt, faVolume } from '@fortawesome/pro-regular-svg-icons';
import { faTurtle, faVolume as fasVolume } from '@fortawesome/pro-solid-svg-icons';
import { isObject, isString, noop } from 'duo-toolbox/utils/functions';
import { discardEvent, getFocusedInput } from 'duo-toolbox/utils/ui';
import { onPracticeChallengesLoaded, onSoundInitialized, onSoundPlaybackRequested } from 'duo-toolbox/duo/events';
import { SOUND_PLAYBACK_STRATEGY_HOWLER, SOUND_SPEED_NORMAL, SOUND_SPEED_SLOW } from 'duo-toolbox/duo/sounds';
import { MUTEX_HOTKEYS, PRIORITY_AVERAGE, requestMutex } from 'duo-toolbox/extension/ui';
import { EXTENSION_PREFIX, FORM_STYLE_BASIC, FORM_STYLE_CARTOON, FORM_STYLES } from './constants';
import { applyCurrentTtsSettingsToHowlSound } from './tts';
import ControlButton, { TYPE_SPEED_NORMAL, TYPE_SPEED_SLOW } from './components/ControlButton';
import ControlPanel from './components/ControlPanel.js';
import './css/ui.css';

// When using the default behavior, FA styles are not always added to the pages, resulting in huge icons.
faConfig.autoAddCss = false;

// Register the FontAwesome icons.
library.add(
  faClock,
  faCog,
  faKeyboard,
  faPause,
  faPlay,
  faStop,
  faTachometerAlt,
  faThumbtack,
  faTurtle,
  faVolume,
  fasVolume,
);

/**
 * A control form for a TTS sound.
 * @typedef {object} ControlForm
 * @property {string} formStyle The style of the parent challenge form.
 * @property {string} ttsType The type of the TTS sound controlled by the form.
 * @property {boolean} isSelected Whether the control form is currently selected.
 * @property {boolean} isFocused Whether the control form is currently focused (/ can handle keyboard shortcuts).
 * @property {Element} panelWrapper The wrapper of the control panel.
 * @property {Element} playbackButton The original button that can be used to play the sound.
 * @property {object} soundData Data about the controlled sound, including the sound to be played.
 */

/**
 * The available control forms for the current challenge, arranged by TTS type.
 * @type {{[key: string]: ControlForm}}
 */
let currentControlForms = {};

/**
 * The wrapper for the switch button usable to cycle through the control forms of the current challenge, if any.
 * @type {Element|null}
 */
let currentSwitchButtonWrapper = null;

/**
 * The last seen wrapper for the original playback buttons of a challenge.
 * @type {Element|null}
 */
let lastPlaybackButtonsWrapper = null;

/**
 * A promise for if and when the hotkeys mutex will have been acquired, when a request is pending.
 * @type {Promise|null}
 */
let hotkeysMutexPromise = null;

/**
 * A callback usable to release the hotkeys mutex, once it has been acquired.
 * @type {Function|null}
 */
let hotkeysMutexReleaseCallback = null;

/**
 * Finds the form elements of a given type in a given parent element (or in the document body),
 * and marks them using a set of extension-specific class names.
 * @param {string} elementType An element type.
 * @param {string} formStyle A form style.
 * @param {?Element} parentElement The parent element in which to restrict the search.
 * @param {Function} predicate A predicate to filter the found elements.
 * @returns {Element[]} The searched form elements.
 */
const findAndMarkFormElements = (elementType, formStyle, parentElement = document.body, predicate = () => true) => {
  const elements = Array
    .from(parentElement.querySelectorAll(ELEMENT_SELECTORS[elementType][formStyle]))
    .filter(predicate);

  elements.forEach(element => {
    element.classList.add(
      `${EXTENSION_PREFIX}${elementType}`,
      `${EXTENSION_PREFIX}${elementType}_${formStyle}`,
    );
  });

  return elements;
};

/**
 * @returns {string[]} The available TTS types for the current challenge.
 */
const getAvailableTtsTypes = () => Object.keys(currentControlForms);

/**
 * @returns {ControlForm|undefined} The currently selected control form, if any.
 */
const getSelectedControlForm = () => Object.values(currentControlForms).find(it.isSelected);

/**
 * @returns {ControlForm|undefined} The currently focused control form, if any.
 */
const getFocusedControlForm = () => Object.values(currentControlForms).find(it.isSelected && it.isFocused);

/**
 * Refreshes the form controlling the TTS sound of a given type.
 * @param {string} ttsType A TTS type.
 * @returns {void}
 */
const refreshControlForm = ttsType => {
  if (!currentControlForms[ttsType] || !currentControlForms[ttsType].panelWrapper.isConnected) {
    return;
  }

  const {
    formStyle,
    isSelected,
    isFocused,
    panelWrapper,
    soundData,
  } = currentControlForms[ttsType];

  render(
    <ControlPanel
      formStyle={formStyle}
      ttsSpeed={ttsType}
      selected={isSelected}
      focused={isSelected && isFocused}
      howl={soundData.sound}
    />,
    panelWrapper
  );

  if (isSelected && currentSwitchButtonWrapper) {
    render(
      <ControlButton
        onClick={selectNextControlForm}
        type={(ttsType === SOUND_SPEED_SLOW) ? TYPE_SPEED_SLOW : TYPE_SPEED_NORMAL}
      />,
      currentSwitchButtonWrapper
    );
  }
};

/**
 * Selects the control form controlling the TTS sound of a given type.
 *
 * If the previously selected form (if any) was focused, the newly selected form will be focused too.
 * @param {string} ttsType A TTS type.
 * @returns {void}
 */
const selectControlForm = ttsType => {
  if (!currentControlForms[ttsType] || !currentControlForms[ttsType].panelWrapper.isConnected) {
    return;
  }

  const selectedControlForm = getSelectedControlForm();
  const isFormFocused = !!selectedControlForm?.isFocused;

  if (selectedControlForm) {
    selectedControlForm.isSelected = false;
    selectedControlForm.isFocused = false;
    refreshControlForm(selectedControlForm.ttsType);
  }

  if (selectedControlForm?.ttsType !== ttsType) {
    const form = currentControlForms[ttsType];
    form.isSelected = true;
    form.isFocused = isFormFocused;
    refreshControlForm(ttsType);
  }
}

/**
 * Selects the next available control form, or the first if none was already selected.
 * @returns {void}
 */
const selectNextControlForm = () => {
  const controlForm = getSelectedControlForm() || Object.values(currentControlForms)[0];

  if (controlForm) {
    const ttsTypes = getAvailableTtsTypes();
    const nextIndex = (ttsTypes.indexOf(controlForm.ttsType) + 1) % ttsTypes.length;
    selectControlForm(ttsTypes[nextIndex]);
  }
}

/**
 * Attempts to acquire the hotkeys mutex in a short delay.
 *
 * The mutex will be released if it is requested with a high priority by another extension.
 * @returns {Promise<void>} A promise for if and when the hotkeys mutex has been acquired.
 */
const acquireHotkeysMutex = () => {
  if (hotkeysMutexReleaseCallback) {
    return Promise.resolve()
  }

  if (hotkeysMutexPromise) {
    return hotkeysMutexPromise;
  }

  hotkeysMutexPromise = requestMutex(
    MUTEX_HOTKEYS,
    {
      timeoutDelay: 20,
      priority: PRIORITY_AVERAGE,
      onSupersessionRequest: blurSelectedControlForm,
    }
  )
    .then(callback => {
      hotkeysMutexReleaseCallback = callback;
    })
    .finally(() => {
      hotkeysMutexPromise = null;
    });

  return hotkeysMutexPromise;
}

/**
 * Releases the hotkeys mutex, if it had been previously acquired.
 * @returns {void}
 */
const releaseHotkeysMutex = () => {
  if (hotkeysMutexReleaseCallback) {
    hotkeysMutexReleaseCallback();
    hotkeysMutexReleaseCallback = null;
  }
};

/**
 * Attempts to focus the currently selected control form by acquiring the hotkeys mutex.
 * @returns {Promise<void>} A promise for if and when the control form has been focused.
 */
const focusSelectedControlForm = () => {
  const controlForm = getSelectedControlForm();

  if (!controlForm) {
    return Promise.reject();
  }

  return acquireHotkeysMutex()
    .then(() => {
      controlForm.isFocused = true;
      refreshControlForm(controlForm.ttsType);
    })
}

/**
 * Blurs the currently focused control form, and releases the hotkeys mutex.
 * @returns {void}
 */
const blurSelectedControlForm = () => {
  const controlForm = getSelectedControlForm();

  if (controlForm?.isFocused) {
    controlForm.isFocused = false;
    refreshControlForm(controlForm.ttsType);
  }

  releaseHotkeysMutex();
}

/**
 * Cleans up all the current control forms by unmounting the underlying panels.
 *
 * This allows to make sure that all the corresponding lifecycle events have been called.
 * @param {boolean} force Whether to force the cleanup, even if the forms are still present in the DOM.
 * @returns {void}
 */
const cleanUpControlForms = (force = false) => {
  Object.entries(currentControlForms)
    .forEach(([ type, form ]) => {
      if (force || !form.panelWrapper.isConnected) {
        render('', form.panelWrapper);
        delete currentControlForms[type];
        form.isFocused && releaseHotkeysMutex();
      }
    });
};

// Regularly clean up the obsolete control forms.
setInterval(() => cleanUpControlForms(), 100);

/**
 * Prepares the control forms for a given set of TTS sounds.
 * @param {{[key: string]: object}} sounds The new TTS sounds that should be controlled.
 * @returns {void}
 */
const prepareControlForms = sounds => {
  let playbackButtonsWrapper = null;

  const formStyle = FORM_STYLES.find(style => {
    [ playbackButtonsWrapper ] = findAndMarkFormElements(
      PLAYBACK_BUTTONS_WRAPPER,
      style,
      document.body,
      lift(!it.matches(PREVIOUS_CHALLENGE_ELEMENT_SELECTOR))
    );

    return !!playbackButtonsWrapper;
  });

  if (playbackButtonsWrapper === lastPlaybackButtonsWrapper) {
    return;
  }

  // Always force unmounting the previous control panels when a change occurred,
  // to ensure that all the necessary cleanup has been done (such as stopping and resetting the TTS sounds).
  cleanUpControlForms(true);

  lastPlaybackButtonsWrapper = playbackButtonsWrapper;

  if (!playbackButtonsWrapper) {
    return;
  }

  // Find and mark all the required original UI elements.

  const playbackButtonWrappers = findAndMarkFormElements(
    PLAYBACK_BUTTON_WRAPPER,
    formStyle,
    playbackButtonsWrapper
  );

  const playbackButtons = playbackButtonWrappers.flatMap(
    findAndMarkFormElements(PLAYBACK_BUTTON, formStyle, _)
  );

  if (0 === playbackButtons.length) {
    return;
  }

  // Create a button allowing to cycle through the control forms when only one is displayed at a time.
  if (playbackButtons.length > 1) {
    currentSwitchButtonWrapper = document.createElement('div');
    currentSwitchButtonWrapper.classList.add(`${EXTENSION_PREFIX}switch-button`);
    playbackButtonsWrapper.append(currentSwitchButtonWrapper);
  } else {
    currentSwitchButtonWrapper = null;
  }

  // Create a control form for each TTS playback button.
  // Apply the current rate and volume settings to each sound.
  playbackButtons.forEach((playbackButton, index) => {
    const ttsSpeed = playbackButton.matches(ELEMENT_SELECTORS[SLOW_PLAYBACK_BUTTON][formStyle])
      ? SOUND_SPEED_SLOW
      : SOUND_SPEED_NORMAL;

    const soundData = sounds[ttsSpeed];

    if (!soundData) {
      return;
    }

    applyCurrentTtsSettingsToHowlSound(
      soundData.speed,
      soundData.sound
    );

    const panelWrapper = document.createElement('div');
    panelWrapper.classList.add(...CONTROL_FORM_BASE_CLASS_NAMES);
    playbackButtonsWrapper.insertBefore(panelWrapper, currentSwitchButtonWrapper);

    currentControlForms[ttsSpeed] = {
      formStyle,
      ttsType: ttsSpeed,
      isSelected: (0 === index),
      isFocused: false,
      panelWrapper,
      playbackButton,
      soundData,
    };

    refreshControlForm(ttsSpeed);
  });
};

/**
 * @type {Set<string>}
 */
const challengeTtsUrls = new Set();

/**
 * @type {{[key: string]: string[]}}
 */
const relatedTtsUrls = {};

/**
 * @type {{[key: string]: object}}
 */
const initializedTtsData = {};

// Extract the URLs of the TTS sounds when challenges are loaded.
onPracticeChallengesLoaded(({ challenges }) => (
  challenges.forEach(challenge => {
    const normalTtsUrl = isString(challenge.tts) && challenge.tts.trim();
    const slowTtsUrl = isString(challenge.slowTts) && challenge.slowTts.trim();

    if (normalTtsUrl) {
      challengeTtsUrls.add(normalTtsUrl);
    }

    if (slowTtsUrl) {
      challengeTtsUrls.add(slowTtsUrl);

      if (normalTtsUrl) {
        relatedTtsUrls[slowTtsUrl] = [ normalTtsUrl ];
        relatedTtsUrls[normalTtsUrl] = [ slowTtsUrl ];
      }
    }
  })
));

// Detect the initialization of TTS sounds and remember their data.
onSoundInitialized(sound => {
  if (challengeTtsUrls.has(sound.url)) {
    initializedTtsData[sound.url] = sound;
  }
});

// Detect when TTS sounds are played, and prepare the corresponding control forms if needed.
onSoundPlaybackRequested(sound => {
  if (
    (SOUND_PLAYBACK_STRATEGY_HOWLER === sound.playbackStrategy)
    && challengeTtsUrls.has(sound.url)
  ) {
    initializedTtsData[sound.url] = sound;

    const challengeSounds = Object.fromEntries(
      ([
        sound.url,
        ...(relatedTtsUrls[sound.url] || [])
      ]).map(initializedTtsData[it])
        .filter(isObject)
        .map([ it.speed, it ])
    );

    setTimeout(() => prepareControlForms(challengeSounds));
  }

  return true;
});

/**
 * Whether we are currently resetting the tabbing position,
 * triggering meaningless "focusin" / "focusout" events in the process.
 * @type {boolean}
 */
let isResettingTabbingPosition = false;

/**
 * @returns {Element|undefined} The currently focused input, if any, and if it belongs to the original UI.
 */
const getOriginalFocusedInput = () => {
  const input = getFocusedInput();

  return input && !Object.values(currentControlForms).some(it.isSelected && it.panelWrapper.contains(input))
    ? input
    : undefined;
};

document.addEventListener(
  'focusin',
  () => !isResettingTabbingPosition && getOriginalFocusedInput() && blurSelectedControlForm()
);

/**
 * The global keyboard shortcuts, arranged by key.
 * @type {object}
 */
const keyboardShortcuts = {
  // Switches focus back and forth between the selected control form and the answer input.
  control: () => {
    const controlForm = getSelectedControlForm();

    if (controlForm) {
      if (!controlForm.isFocused) {
        focusSelectedControlForm()
          .then(() => getOriginalFocusedInput()?.blur())
          .catch(noop);
      } else {
        blurSelectedControlForm();
        document.querySelector(ANSWER_INPUT_SELECTOR)?.focus();
      }
    }
  },

  // Cycles between the available control forms, when there is more than one and any is already selected.
  tab: () => {
    const ttsTypes = getAvailableTtsTypes();

    if (ttsTypes.length > 1) {
      const controlForm = getFocusedControlForm();

      if (controlForm) {
        selectNextControlForm();

        // Reset the current tabbing position to prevent eventually reaching the address bar.
        isResettingTabbingPosition = true;
        controlForm.playbackButton.focus();
        isResettingTabbingPosition = false;
      }
    }
  },
};

/**
 * The set of all the keys that are currently pressed.
 * @type {Set<string>}
 */
const pressedKeys = new Set();

/**
 * The code of the key that has been currently pressed while none other was.
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
 * A wrapper for a set of playback buttons.
 * @type {string}
 */
const PLAYBACK_BUTTONS_WRAPPER = 'playback-buttons-wrapper';

/**
 * A wrapper for a single playback button.
 * @type {string}
 */
const PLAYBACK_BUTTON_WRAPPER = 'playback-button-wrapper';

/**
 * A playback button for TTS of any speed.
 * @type {string}
 */
const PLAYBACK_BUTTON = 'playback-button';

/**
 * A playback button for slow TTS.
 * @type {string}
 */
const SLOW_PLAYBACK_BUTTON = 'slow-playback-button';

/**
 * The CSS selectors for the different UI elements we need to find, mark, and possibly adapt.
 * Sorted by element type and form style.
 * @type {object}
 */
const ELEMENT_SELECTORS = {
  [PLAYBACK_BUTTONS_WRAPPER]: {
    [FORM_STYLE_BASIC]: '._3C4MQ ._3qAs-',
    [FORM_STYLE_CARTOON]: '._31yjb .rPXvv, ._31yjb ._1tbN5',
  },
  // The wrapper of the <button> elements which trigger playing the TTS sounds.
  [PLAYBACK_BUTTON_WRAPPER]: {
    [FORM_STYLE_BASIC]: '._1fdKO',
    [FORM_STYLE_CARTOON]: '._1fdKO',
  },
  // The <button> elements which trigger playing the TTS sounds (both normal and slow).
  [PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '._23274',
    [FORM_STYLE_CARTOON]: '._1GJVt',
  },
  // The <button> elements which trigger playing the slow TTS sounds.
  [SLOW_PLAYBACK_BUTTON]: {
    [FORM_STYLE_BASIC]: '.rnwSx',
    // todo when both speeds are available, the cartoon version does not seem to be used anymore?
    [FORM_STYLE_CARTOON]: 'todo',
  },
}

/**
 * A CSS selector for matching any element that belongs to the previous challenge
 * (the previous challenge elements may still be present on the page, and hidden using opacity).
 * @type {string}
 */
const PREVIOUS_CHALLENGE_ELEMENT_SELECTOR = '._1cTBC ._1V33c *';

/**
 * The class names to apply to the control forms.
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
 * A CSS selector for the free answer input of a challenge.
 * @type {string}
 */
const ANSWER_INPUT_SELECTOR = [
  'input[data-test="challenge-text-input"]',
  'textarea[data-test="challenge-translate-input"]',
].join(', ');
