import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { noop } from '../functions';
import { EXTENSION_PREFIX } from '../constants';
import { BASE, useStyles } from './index';

export const TYPE_PAUSE = 'pause';
export const TYPE_PIN = 'pin';
export const TYPE_PLAY = 'play';
export const TYPE_STOP = 'stop';

export const TYPE_ICONS = {
  [TYPE_PAUSE]: 'pause',
  [TYPE_PIN]: 'thumbtack',
  [TYPE_PLAY]: 'play',
  [TYPE_STOP]: 'stop',
};

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
        className={getElementClassNames(BUTTON)}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[type]}
          size="xs"
          fixedWidth
          className={getElementClassNames(ICON)}
        />
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
      // Copied from the "Use keyboard" / "Use word bank" button. Only the color is used here.
      '_3cbXv',
      // Copied by searching for a class targeted by Darklingo++ to apply a better color ("tertiary"),
      // while having no effect on the original UI.
      'kAVeU',
      `${EXTENSION_PREFIX}control-button-icon`,
    ]
  },
};
