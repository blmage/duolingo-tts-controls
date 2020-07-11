import { useCallback } from 'preact/hooks';
import { isArray } from '../functions';

/**
 * The key under which to store the class names of an element that are always applicable,
 * no matter what the current state of the component is.
 *
 * @type {symbol}
 */
export const BASE = Symbol('base');

/**
 * A hook for getting all the class names of an element based on the current state/context of its parent component.
 *
 * @param {object} classNames Some nested maps from state and element keys to class names.
 * @param {(string|symbol)[]} stateKeys A list of keys describing the current state of the component.
 * @returns {Function}
 * A function which, given one or more element keys, returns a list of the registered class names that are
 * currently applicable.
 */
export const useStyles = (classNames, stateKeys = []) => {
  return useCallback(elementKeys => {
    const keys = isArray(elementKeys) ? elementKeys : [ elementKeys ];

    return keys.flatMap(elementKey => {
      const allClassNames = [];

      if (classNames[BASE] && classNames[BASE][elementKey]) {
        allClassNames.push(...classNames[BASE][elementKey]);
      }

      stateKeys.forEach(stateKey => {
        if (stateKey && classNames[stateKey] && classNames[stateKey][elementKey]) {
          allClassNames.push(...classNames[stateKey][elementKey]);
        }
      });

      return allClassNames;
    }).join(' ')
  }, stateKeys.concat([ classNames ])); // eslint-disable-line react-hooks/exhaustive-deps
};
