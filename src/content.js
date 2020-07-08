const uiScript = document.createElement('script');
uiScript.src = chrome.runtime.getURL('src/ui.js');
uiScript.type = 'text/javascript';
(document.head || document.documentElement).appendChild(uiScript);

const uiStyleSheet = document.createElement('link');
uiStyleSheet.href = chrome.runtime.getURL('assets/css/ui.css');
uiStyleSheet.rel = 'stylesheet';
(document.head || document.documentElement).appendChild(uiStyleSheet);
