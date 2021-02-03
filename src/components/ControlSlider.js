import { h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EXTENSION_PREFIX } from '../constants';
import { noop } from '../functions';
import { BASE, useStyles } from './index';

export const TYPE_POSITION = 'position';
export const TYPE_RATE = 'rate';
export const TYPE_VOLUME = 'volume';

const MIN = 'min';
const MAX = 'max';

export const TYPE_ICONS = {
  [TYPE_POSITION]: {
    [MIN]: [ 'fal', 'hourglass-start' ],
    [MAX]: [ 'fal', 'hourglass-end' ],
  },
  [TYPE_RATE]: {
    [MIN]: [ 'fal', 'turtle' ],
    [MAX]: [ 'fal', 'rabbit-fast' ],
  },
  [TYPE_VOLUME]: {
    [MIN]: [ 'fal', 'volume-down' ],
    [MAX]: [ 'fal', 'volume-up' ],
  },
};

const ControlSlider =
  ({
     type,
     value = 1.0,
     min = value,
     max = value,
     step = 0.1,
     hint = '',
     disabled = false,
     onChangeStart = noop,
     onChange = noop,
     onChangeEnd = noop,
   }) => {
    const isChanging = useRef(false);

    const onInput = useCallback(event => {
      const value = event.target.value;

      if (!isChanging.current) {
        isChanging.current = true;
        onChangeStart(value);
      } else {
        onChange(value);
      }
    }, [ onChangeStart, onChange, isChanging ]);

    const onLastInput = useCallback(event => {
      if (isChanging.current) {
        isChanging.current = false;
        onChangeEnd(event.target.value);
      }
    }, [ onChangeEnd, isChanging ]);

    const getElementClassNames = useStyles(CLASS_NAMES, [ type ]);

    return (
      <div className={getElementClassNames(WRAPPER)}>
        <FontAwesomeIcon
          icon={TYPE_ICONS[type][MIN]}
          transform="grow-8"
          onClick={() => onChangeEnd(min)}
          className={getElementClassNames([ BUTTON, MIN_BUTTON ])}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          // Prevent the original keyboard handling from interfering with our keyboard shortcuts.
          onKeyDown={event => event.preventDefault()}
          onKeyUp={event => event.preventDefault()}
          onInput={onInput}
          onChange={onLastInput}
          onMouseUp={onLastInput}
          className={getElementClassNames(INPUT)}
        />

        <FontAwesomeIcon
          icon={TYPE_ICONS[type][MAX]}
          transform="grow-8"
          onClick={() => onChangeEnd(max)}
          className={getElementClassNames([ BUTTON, MAX_BUTTON ])}
        />

        {('' !== hint) && (
          <span className={getElementClassNames(HINT)}>
            {hint}
          </span>
        )}
      </div>
    );
  };

export default ControlSlider;

const WRAPPER = 'wrapper';
const BUTTON = 'button';
const MIN_BUTTON = 'min_button';
const MAX_BUTTON = 'max_button';
const INPUT = 'input';
const HINT = 'hint';

const CLASS_NAMES = {
  [BASE]: {
    [WRAPPER]: [
      `${EXTENSION_PREFIX}slider`,
    ],
    [BUTTON]: [
      // Copied from the "Use keyboard" / "Use word bank" button.
      // The class responsible for the minimum dimensions is ignored here.
      '_3cbXv',
      '_2RTMn',
      '_3yAjN',
      // Copied from the text of the "Use keyboard" / "Use word bank" button
      // (applies a better color on Darklingo++).
      'yWRY8',
      `${EXTENSION_PREFIX}slider-button`
    ],
    [MIN_BUTTON]: [
      `${EXTENSION_PREFIX}slider-min-button`,
    ],
    [MAX_BUTTON]: [
      `${EXTENSION_PREFIX}slider-max-button`,
    ],
    [INPUT]: [
      // Copied from the session progress bar.
      '_2cmOB',
      '_14nh2',
      '_3C9O7',
      // Copied from the most appropriate background of the session progress bar.
      '_2Z5hP',
      `${EXTENSION_PREFIX}slider-input`,
    ],
    [HINT]: [
      // Copied from the "Use keyboard" / "Use word bank" button. Only the color is used here.
      '_3cbXv',
      // Copied by searching for a class targeted by Darklingo++ to apply a better color ("tertiary"),
      // while having no effect on the original UI.
      'kAVeU',
      `${EXTENSION_PREFIX}slider-hint`,
    ],
  },
};
