<h1>
  <img align="center" width="48" height="48" src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/master/dist/icons/icon_48.png" />
  Duolingo TTS Controls
</h1>

[![DeepScan grade](https://deepscan.io/api/teams/9459/projects/12777/branches/202379/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9459&pid=12777&bid=202379)
![ESLint](https://github.com/blmage/duolingo-tts-controls/workflows/ESLint/badge.svg)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hfgbpmknceenkbljmjlogkmhbpnbiika)](https://chrome.google.com/webstore/detail/duolingo-tts-controls/hfgbpmknceenkbljmjlogkmhbpnbiika)
[![Mozilla Add-on](https://img.shields.io/amo/v/duolingo-tts-controls)](https://addons.mozilla.org/firefox/addon/duolingo-tts-controls/)

A small browser extension providing **playback controls** for the **listening challenges** on
[Duolingo](https://www.duolingo.com).

### Table of contents

* [Download](#download)
* [Features](#features)
* [Keyboard shortcuts](#keyboard-shortcuts)
* [Limitations](#limitations)
* [Bug reports and feature requests](#bug-reports-and-feature-requests)

### Download

* [**Chrome** extension](https://chrome.google.com/webstore/detail/duolingo-tts-controls/hfgbpmknceenkbljmjlogkmhbpnbiika)
* [**Firefox** add-on](https://addons.mozilla.org/firefox/addon/duolingo-tts-controls/)

### Features

* Appends a control button to each of the playback buttons in the listening challenges:

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/base_toggle_buttons.png" width="500" />

  ------

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/base_toggle_buttons_cartoon.png" width="500" />

* Clicking on a control button opens the corresponding control panel:

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/base_normal_controls_panel.png" width="300" />

  ------

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/base_slow_controls_panel_cartoon.png" width="500" />

* The available controls include:
  
  * a rate (speed) slider,
  * a volume slider, 
  * a seek bar,
  * a play/pause button,
  * a stop button,
  * a "start pinning" button, to define the current position as the new start position.

* Strives to blend seamlessly in [Duolingo](https://www.duolingo.com)'s UI, and to be compatible with custom themes
  such as [Darklingo++](https://userstyles.org/styles/169205/darklingo):

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/dark_controls_panel.png" width="500" />

  ------

  <img src="https://raw.githubusercontent.com/blmage/duolingo-tts-controls/assets/dark_controls_panel_cartoon.png" width="500" />

### Keyboard shortcuts

No keyboard shortcuts are available at the moment, but this is the number one priority in the roadmap.

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
