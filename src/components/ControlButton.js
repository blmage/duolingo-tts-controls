import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { it } from 'one-liner.macro';
import { noop } from 'duo-toolbox/utils/functions';
import { EXTENSION_PREFIX } from '../constants';
import { BASE, useStyles } from './index';

export const TYPE_PAUSE = 'pause';
export const TYPE_PIN = 'pin';
export const TYPE_PLAY = 'play';
export const TYPE_SPEED_NORMAL = 'speed_normal';
export const TYPE_SPEED_SLOW = 'speed_slow';
export const TYPE_STOP = 'stop';
export const TYPE_TOGGLE = 'toggle';

const TYPES = [
  TYPE_PAUSE,
  TYPE_PIN,
  TYPE_PLAY,
  TYPE_SPEED_NORMAL,
  TYPE_SPEED_SLOW,
  TYPE_STOP,
  TYPE_TOGGLE,
];

const TYPE_ICONS = {
  [TYPE_PAUSE]: 'pause',
  [TYPE_PIN]: 'thumbtack',
  [TYPE_PLAY]: 'play',
  [TYPE_SPEED_NORMAL]: [ 'fas', 'volume' ],
  [TYPE_SPEED_SLOW]: [ 'fas', 'turtle' ],
  [TYPE_STOP]: 'stop',
  [TYPE_TOGGLE]: 'cog',
};

const TYPE_ICON_SIZES = {
  [TYPE_PIN]: 's',
  [TYPE_SPEED_NORMAL]: 's',
  [TYPE_SPEED_SLOW]: 's',
  [TYPE_TOGGLE]: 's',
};

const ControlButton = ({ type, disabled = false, active = false, onClick = noop }) => {
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
  });

  const buttonKeys = [
    BUTTON,
    `BUTTON__${type}`,
    active && BUTTON__ACTIVE,
    disabled && BUTTON__DISABLED,
  ];

  return (
    <div className={getElementClassNames(WRAPPER)}>
      <button
        ref={button}
        disabled={disabled}
        onClick={onClick}
        onKeyUp={event => event.preventDefault()}
        className={getElementClassNames(buttonKeys)}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[type]}
          size={TYPE_ICON_SIZES[type] || 'xs'}
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
const BUTTON__ACTIVE = 'button__active';
const BUTTON__DISABLED = 'button__disabled';
const ICON = 'icon';

const CLASS_NAMES = {
  [BASE]: Object.assign(
    {
      // Copied from the direct wrapper of each special letter button provided for some languages (such as French).
      [WRAPPER]: [
        '_1OCDB',
      ],
      // Copied from the special letter buttons.
      [BUTTON]: [
        '_1N-oo',
        '_36Vd3',
        '_16r-S',
        '_3f9XI',
        `${EXTENSION_PREFIX}control-button`,
      ],
      [BUTTON__ACTIVE]: [
        'k6MEx',
      ],
      [BUTTON__DISABLED]: [
        '_33Jbm',
        // Copied by searching for a class that resets the bottom border, alongside the other button classes.
        '_1_xfn',
      ],
      [ICON]: [
        // Copied from the "Use keyboard" / "Use word bank" button. Only the color is used here.
        '_3cbXv',
        `${EXTENSION_PREFIX}control-button-icon`,
      ]
    },
    Object.fromEntries(
      TYPES.map([
        `BUTTON__${it}`,
        [ `${EXTENSION_PREFIX}control-button_${it}` ],
      ])
    )
  ),
};
