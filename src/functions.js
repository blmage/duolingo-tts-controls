import { EXTENSION_CODE } from './constants';

/**
 * A function which does nothing.
 */
export function noop() {
}

/**
 * @param {*} value The tested value.
 * @returns {boolean} Whether the given value is an object. This excludes Arrays, but not Dates or RegExps.
 */
export function isObject(value) {
  return ('object' === typeof value) && !!value && !Array.isArray(value);
}

/**
 * @param {*} value The tested value.
 * @returns {boolean} Whether the given value is an array.
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * @param {Element} element The element to toggle.
 * @param {boolean|null} displayed The state of the element, if it should be forced.
 */
export function toggleElement(element, displayed = null) {
  if (element instanceof Element) {
    if (element.style.display === 'none') {
      if (false !== displayed) {
        element.style.display = '';
      }
    } else if (true !== displayed) {
      element.style.display = 'none';
    }
  }
}

/**
 * @param {Event} event The UI event to completely discard.
 */
export function discardEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * The iframe element used to access working logging functions.
 *
 * @type {HTMLIFrameElement|null}
 */
let loggingIframe = null;

/**
 * @private
 * @returns {Console} A working console object.
 */
function getLoggingConsole() {
  if (!loggingIframe || !loggingIframe.isConnected) {
    loggingIframe = document.createElement('iframe');
    loggingIframe.style.display = 'none';
    document.body.appendChild(loggingIframe);
  }

  return loggingIframe.contentWindow.console;
}

/**
 * @param {*} message The extension-related message/value to log to the console.
 * @param {?string} prefix A prefix to prepend to the message.
 */
export function logDebug(message, prefix = '') {
  if ('development' === process.env.NODE_ENV) {
    getLoggingConsole().log(`[${EXTENSION_CODE}] ${prefix}`, message);
  }
}

/**
 * @param {*} error The extension-related error to log to the console.
 * @param {?string} prefix A prefix to prepend to the error.
 */
export function logError(error, prefix = '') {
  if ('development' === process.env.NODE_ENV) {
    getLoggingConsole().error(`[${EXTENSION_CODE}] ${prefix}`, error);
  }
}
