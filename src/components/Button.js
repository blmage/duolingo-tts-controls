import { h } from 'preact';
import { noop } from '../functions';
import { BASE, useStyles } from './index';
import { EXTENSION_PREFIX } from '../constants';

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

const Button = ({ type, disabled = false, onClick = noop }) => {
  const getElementClassNames = useStyles(CLASS_NAMES, [ type ]);

  return (
    <div className={getElementClassNames(WRAPPER)}>
      <button
        disabled={disabled}
        onClick={onClick}
        className={getElementClassNames(BUTTON)}>
        <span className={getElementClassNames(ICON)} />
      </button>
    </div>
  )
};

export default Button;

const WRAPPER = 'wrapper';
const BUTTON = 'button';
const ICON = 'icon';

const CLASS_NAMES = {
  [BASE]: {
    // Copied from the direct wrapper of each special letter button provided for some languages (such as French).
    [WRAPPER]: [ '_10S_q' ],
    // Copied from the special letter buttons.
    [BUTTON]: [
      '_2dfXt',
      '_3ZQ9H',
      '_3lE5Q',
      '_18se6',
      'vy3TL',
      '_3iIWE',
      '_1Mkpg',
      '_1Dtxl',
      '_1sVAI',
      'sweRn',
      '_1BWZU',
      '_1LIf4',
      'QVrnU',
      `${EXTENSION_PREFIX}control-button`
    ],
    [ICON]: [
      // Copied by searching for the same color as the "Use keyboard" / "Use word bank" button,
      // but without the hover and pointer styles.
      'D9gQ7',
      `${EXTENSION_PREFIX}control-button-icon`,
    ]
  },
};

TYPES.forEach(type => {
  CLASS_NAMES[type] = {
    [BUTTON]: [ `${EXTENSION_PREFIX}control-button-${type}` ],
  };
});
