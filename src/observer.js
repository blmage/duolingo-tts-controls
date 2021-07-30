import { noop } from 'duo-toolbox/utils/functions';
import { onSoundInitialized } from 'duo-toolbox/duo/events';

// Setup the detection of initialized sounds as soon as possible (challenges are loaded very early).
onSoundInitialized(noop);
