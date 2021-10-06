import { h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { noop } from 'duo-toolbox/utils/functions';
import { EXTENSION_PREFIX } from '../constants';
import { BASE, useStyles } from './index';

export const TYPE_POSITION = 'position';
export const TYPE_RATE = 'rate';
export const TYPE_VOLUME = 'volume';

export const TYPE_ICONS = {
  [TYPE_POSITION]: [ 'far', 'clock' ],
  [TYPE_RATE]: [ 'far', 'tachometer-alt' ],
  [TYPE_VOLUME]: [ 'far', 'volume' ],
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

        {('' !== hint) && (
          <span className={getElementClassNames(HINT)}>
             <FontAwesomeIcon
               icon={TYPE_ICONS[type]}
               className={getElementClassNames([ HINT_ICON ])}
             />
            {hint}
          </span>
        )}
      </div>
    );
  };

export default ControlSlider;

const WRAPPER = 'wrapper';
const INPUT = 'input';
const HINT = 'hint';
const HINT_ICON = 'button';

const CLASS_NAMES = {
  [BASE]: {
    [WRAPPER]: [
      `${EXTENSION_PREFIX}slider`,
    ],
    [INPUT]: [
      // Copied from the session progress bar.
      '_2YmyD',
      '_2_zk1',
      // Copied from the most appropriate background of the session progress bar.
      '_2Z5hP',
      `${EXTENSION_PREFIX}slider-input`,
    ],
    [HINT]: [
      // Copied from the "Use keyboard" / "Use word bank" button. Only the color is used here.
      '_3cbXv',
      `${EXTENSION_PREFIX}slider-hint`,
    ],
    [HINT_ICON]: [
      `${EXTENSION_PREFIX}slider-hint-icon`
    ],
  },
};
