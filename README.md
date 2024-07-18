<h1>
  <img align="center" width="48" height="48" src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/master/dist/mv3/icons/icon_48.png" />
  Duolingo TTS Controls
</h1>

[![DeepScan grade](https://deepscan.io/api/teams/9459/projects/12777/branches/202379/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9459&pid=12777&bid=202379)
![ESLint](https://github.com/blmage/duolingo-tts-controls/workflows/ESLint/badge.svg)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fblmage%2Fduolingo-tts-controls.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fblmage%2Fduolingo-tts-controls?ref=badge_shield)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hfgbpmknceenkbljmjlogkmhbpnbiika)](https://chrome.google.com/webstore/detail/duolingo-tts-controls/hfgbpmknceenkbljmjlogkmhbpnbiika)
[![Mozilla Add-on](https://img.shields.io/amo/v/duolingo-tts-controls)](https://addons.mozilla.org/firefox/addon/duolingo-tts-controls/)

A small browser extension providing **playback controls** for the **listening** / **speaking** / **translation**
challenges on [Duolingo](https://www.duolingo.com).

### Table of contents

* [Download](#download)
* [Features](#features)
* [Keyboard shortcuts](#keyboard-shortcuts)
* [Limitations](#limitations)
* [Bug reports and feature requests](#bug-reports-and-feature-requests)
* [License](#license)

### Download

* [**Chrome** extension](https://chrome.google.com/webstore/detail/duolingo-tts-controls/hfgbpmknceenkbljmjlogkmhbpnbiika)
* [**Firefox** add-on](https://addons.mozilla.org/firefox/addon/duolingo-tts-controls/)

### Features

* Adds controls to each sound of the listening / speaking / translation challenges:

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/listening_challenge_controls.png" width="400" />

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/translation_challenge_controls.png" width="400" />

* Full controls are available by hovering over the buttons or using the [keyboard shortcuts](#keyboard-shortcuts), 
  and feature:
  
  * a rate (speed) slider,

  * a volume slider, 

  * a seek bar,

  * a play / pause button,

  * a stop button,

  * a "pin" button (to define the current position as the new starting position).

* Strives to blend seamlessly in [Duolingo](https://www.duolingo.com)'s UI, and to be compatible with custom themes
  such as [Darklingo++](https://userstyles.org/styles/169205/darklingo):

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/dark_listening_challenge_controls.png" width="400" />

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/dark_translation_challenge_controls.png" width="400" />

### Keyboard shortcuts

The selected control panel is identifiable by the keyboard icon that is added next to its buttons:

<p float="left">
  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/selected_controls_icon.png" width="150" />  

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/dark_selected_controls_icon.png" width="150" />
</p>

In order to use the keyboard shortcuts, the selected control panel must be focused by pressing `Ctrl`.

Once focused, the keyboard icon becomes highlighted.. :

<p float="left">
  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/focused_controls_icon.png" width="150" />

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets_v2/dark_focused_controls_icon.png" width="150" />
</p>
  
.. and you can use:

  * `Ctrl` to focus back the answer input,

  * `Tab` to select (and focus) the next control panel,

  * `<` / `>` (_or `Ctrl` + `←` / `→`_) to decrease / increase the playback rate (speed),

  * `↓` / `↑` to decrease / increase the playback volume,

  * `←` / `→` to move the position backward / forward,

  * `0` .. `9` to set the position at 0 .. 90% of the duration,

  * `Home` to set the position at the start,

  * `End` to set the position at the end (think of it more or less as a stop button),

  * `Space` / `k` (_or `Ctrl` + `↑`_) to play / pause the sound,

  * `p` (_or `Ctrl` + `↓`_) to "pin" the current position (the sound will now start from there each time it is played).

_Shortcuts behind parentheses are provided as alternatives for when the main ones are not available._

_This can happen for example when a "keyboard-aware" word bank is available for the current challenge._

### Limitations

* The extension is deeply tied to the inner workings of [Duolingo](https://www.duolingo.com), meaning that 
  significant changes on their side could (temporarily) break it. If that happens, you can either:
  
    * wait for me to fix it (you can
      [open an issue](https://github.com/blmage/duolingo-tts-controls/issues/new) if there is none yet about it),
      
    * if you're a developer, try to fix it yourself, then
      [open a related PR](https://github.com/blmage/duolingo-tts-controls/compare).

* Due to hard limitations with the underlying technology (sounds are not accessible via Ajax requests, preventing us
  from using the Web Audio API), the volume can not be raised over 100%. 

### Bug reports and feature requests

If you encounter a bug, or if you have a suggestion regarding a new feature, don't hesitate to
[open a related issue](https://github.com/blmage/duolingo-tts-controls/issues/new)!

### License

MIT, see [LICENSE](LICENSE)

**Duolingo is a registered trademark of Duolingo, Inc. This extension is not affiliated with or endorsed by Duolingo, Inc.**
