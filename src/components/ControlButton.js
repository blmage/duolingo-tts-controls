import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { noop } from '../functions';
import { EXTENSION_PREFIX } from '../constants';
import { BASE, useStyles } from './index';

export const TYPE_PAUSE = 'pause';
export const TYPE_PIN = 'pin';
export const TYPE_PLAY = 'play';
export const TYPE_STOP = 'stop';

const TYPES = [
  TYPE_PAUSE,
  TYPE_PIN,
  TYPE_PLAY,
  TYPE_STOP,
];

const ControlButton = ({ type, disabled = false, onClick = noop }) => {
  const button = useRef(null);
  const getElementClassNames = useStyles(CLASS_NAMES, [ type ]);

  // Blur the button if it is both focused and disabled.
  // This prevents the button from completely swallowing the keyboard events on Firefox.
  useEffect(() => {
    if (
      disabled
      && button.current
      && (document.activeElement === button.current)
    ) {
      button.current.blur();
    }
  })
  
  return (
    <div className={getElementClassNames(WRAPPER)}>
      <button
        ref={button}
        disabled={disabled}
        onClick={onClick}
        onKeyUp={event => event.preventDefault()}
        className={getElementClassNames(BUTTON)}>
        <span className={getElementClassNames(ICON)} />
      </button>
    </div>
  )
};

export default ControlButton;

const WRAPPER = 'wrapper';
const BUTTON = 'button';
const ICON = 'icon';

const CLASS_NAMES = {
  [BASE]: {
    // Copied from the direct wrapper of each special letter button provided for some languages (such as French).
    [WRAPPER]: [ 
      '_1OCDB',
    ],
    // Copied from the special letter buttons.
    [BUTTON]: [
      '_3f9XI',
      '_3iVqs',
      '_2A7uO',
      '_2gwtT',
      '_1nlVc',
      '_2fOC9',
      't5wFJ',
      '_3dtSu',
      '_25Cnc',
      '_3yAjN',
      '_3Ev3S',
      '_1figt',
      `${EXTENSION_PREFIX}control-button`,
    ],
    [ICON]: [
      // Copied by searching for the same color as the "Use keyboard" / "Use word bank" button,
      // but without the hover and pointer styles.
      '_3dDzT',
      `${EXTENSION_PREFIX}control-button-icon`,
    ]
  },
};

TYPES.forEach(type => {
  CLASS_NAMES[type] = {
    [BUTTON]: [ `${EXTENSION_PREFIX}control-button-${type}` ],
  };
});
