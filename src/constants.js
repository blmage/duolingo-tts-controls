/**
 * The code of the extension.
 *
 * @type {string}
 */
export const EXTENSION_CODE = 'duolingo-tts-controls';

/**
 * A prefix based on the extension code.
 *
 * @type {string}
 */
export const EXTENSION_PREFIX = '_duo-ttsc_';

/**
 * The internal types identifying listening challenges.
 *
 * @type {string[]}
 */
export const LISTENING_CHALLENGE_TYPES = [
  'listen',
  'listenTap',
];

/**
 * A RegExp for the URL that is used by Duolingo to start a new practice session.
 *
 * @type {RegExp}
 */
export const NEW_SESSION_URL_REGEXP = /\/[\d]{4}-[\d]{2}-[\d]{2}\/sessions/g;
