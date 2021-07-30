!function(){"use strict";const e=()=>{},t=e=>"string"==typeof e,n=Array.isArray,a=e=>"object"==typeof e&&!!e&&!n(e),o=e=>"function"==typeof e,l=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s=e=>{for(let t in e)if(l(e,t))return!1;return!0},r=e=>{let t=null;if("/"===e.charAt(0)&&("/"===e.charAt(1)?e="https://"+e:t=e),null===t)try{t=new URL(e).pathname}catch(n){t=e}return t},i=e=>"__duo-toolbox__-"+e,d=i("global_variables"),u=(e,t)=>(a(window[d])||(window[d]={}),l(window[d],e)?window[d][e]:t),c=(e,t)=>{a(window[d])||(window[d]={}),window[d][e]=t},p=(e,t,n)=>{const a=t(u(e,n));return c(e,a),a},v=i("original_function"),f=i("override_version"),g=(t,n,s,r=1)=>((e,t,n,a,o=1)=>{l(window,e)&&t(window[e])?n(window[e]):p("pending_global_listeners",(l={})=>{var s;if(!l[e]){l[e]={};let n=window[e];Object.defineProperty(window,e,{get:()=>n,set:a=>{t(a)?(Object.defineProperty(window,e,{value:a,configurable:!0,enumerable:!0,writable:!0}),Object.values(l[e]).forEach(e=>e.callback(a))):n=a},configurable:!0})}return o>(Number(null===(s=l[e][a])||void 0===s?void 0:s.version)||0)&&(l[e][a]={callback:n,version:o}),l})})(t,o,t=>((t,n,o,l=1)=>{var s;if(a(t)&&l>(Number(null===(s=t[n])||void 0===s?void 0:s[f])||0)){var r;const a=(null===(r=t[n])||void 0===r?void 0:r[v])||t[n]||e;t[n]=o(a),t[n][v]=a,t[n][f]=l}})(null==t?void 0:t.prototype,n,s,r),"instance_method:"+n,r),_=i("logging_iframe"),m=()=>(()=>{let e=document.getElementById(_);return e&&e.isConnected||(e=document.createElement("iframe"),e.id=_,e.style.display="none",document.body.appendChild(e)),e})().contentWindow.console,h=e=>{var t,n;return(null===(t=e.metadata)||void 0===t?void 0:t.source_language)||e.sourceLanguage||(null===(n=e.metadata)||void 0===n?void 0:n.learning_language)},w=e=>{var t;return(null===(t=e.metadata)||void 0===t?void 0:t.target_language)||e.targetLanguage||h(e)},b="tts_sentence",y="tts_word",k="normal",O="event_listeners",j=()=>{return`__listener::${e="last_event_listener_id",p(`__counter::${e}__`,e=>e+1,0)}__`;var e},T=e=>{var t;return(null===(t=u(O,{}))||void 0===t?void 0:t[e])||{}},L=(e,t)=>{p(O,n=>Object.assign(n||{},{[e]:t}))},C=!s(e=>T(e)),E=(e,t)=>{const n=T(e);return s(n)?null:t(Object.values(n))},x=(e,t,n=j())=>{const a=T(e);return a[n]=t,L(e,a),()=>A(e,n)},$=(e,t,a,o,l=x,s=j())=>{const r=`__${t}::${e}__`;var i;i=r,T(t)[i]||l(t,(...t)=>{const a=o(...t);n(a)&&M(e,...a)},r);const d=x(e,a,s);return()=>{d(),C(e)||A(t,r)}},A=(e,t)=>{const n=T(e);delete n[t],L(e,n)},M=(e,...t)=>E(e,e=>e.flatMap(e=>{try{return[e(...t)]}catch(e){return[]}})),P="practice_session_loaded",S="story_loaded",q="forum_discussion_loaded",H="dictionary_lexeme_loaded",N="sound_initialized",R={[H]:/\/api\/1\/dictionary_page/g,[q]:/\/comments\/([\d]+)/g,[P]:/\/[\d]{4}-[\d]{2}-[\d]{2}\/sessions/g,[S]:/\/api2\/stories/g,user_data_loaded:/\/[\d]{4}-[\d]{2}-[\d]{2}\/users\/[\d]+/g},z=(e,t,n=j())=>(g("XMLHttpRequest","open",e=>function(t,n,o,l,s){let r;for(const[e,t]of Object.entries(R))if(n.match(t)){r=e;break}return r&&E(r,e=>{this.addEventListener("load",()=>{try{const t=a(this.response)?this.response:JSON.parse(this.responseText);e.forEach(e=>e(t))}catch(e){((...e)=>{m().error(...e)})(e,`Could not handle the XHR result (event: ${r}): `)}})}),e.call(this,t,n,o,l,s)}),x(e,t,n)),I=(e,t)=>({url:e,type:b,speed:k,language:t}),X=(e,t)=>({url:e,type:y,speed:k,language:t}),B=Object.fromEntries(["/sounds/7abe057dc8446ad325229edd6d8fd250.mp3","/sounds/2aae0ea735c8e9ed884107d6f0a09e35.mp3","/sounds/421d48c53ad6d52618dba715722278e0.mp3","/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3","/sounds/0a27c1ee63dd220647e8410a0029aed2.mp3","/sounds/a28ff0a501ef5f33ca78c0afc45ee53e.mp3","/sounds/2e4669d8cf839272f0731f8afa488caf.mp3","/sounds/f0b6ab4396d5891241ef4ca73b4de13a.mp3"].map(e=>{return[e,(t=e,{url:t,type:"effect",speed:k,language:null})];var t})),D=/\/duolingo-data\/tts\/(?<language>[a-z-_]+)\/token\//i,J="sound_type_map",U=()=>u(J,B),W=e=>{const t=U()||{};for(const n of e)t[r(n.url)]=n;c(J,t)},F="sound_detection_unregistration_callbacks",G=(e,t,n)=>({url:e.url,type:t,speed:(null==e?void 0:e.speed.value)||k,language:n}),K=()=>{var e,o,l,s;u(F)||c(F,[(s=e=>(e=>{const a=e.learningLanguage;n(e.elements)&&W(e.elements.map(e=>{var t;return(null==e||null===(t=e.line)||void 0===t?void 0:t.content)||(null==e?void 0:e.learningLanguageTitleContent)}).flatMap(e=>[null==e?void 0:e.audio,null==e?void 0:e.audioPrefix,null==e?void 0:e.audioSuffix]).map(e=>null==e?void 0:e.url).filter(t).map(e=>I(e,a)))})(e),z(S,s)),(l=e=>{var n;t((n=e).tts_url)&&W([I(n.tts_url,n.sentence_language)])},z(q,l)),(o=e=>(e=>{const a=[],o=e.learning_language;t(e.tts)&&a.push(X(e.tts,o)),n(e.alternative_forms)&&a.push(e.alternative_forms.map(e=>null==e?void 0:e.tts).filter(t).map(e=>I(e,o))),W(a.flat())})(e),z(H,o)),(e=e=>(e=>{const o=[];for(const i of e){var l;const e=h(i),d=w(i);if(t(i.tts)&&o.push(I(i.tts,e)),t(i.slowTts)&&o.push({url:i.slowTts,type:b,speed:"slow",language:e}),t(i.solutionTts)&&o.push(I(i.solutionTts,d)),n(i.choices)&&o.push(i.choices.map(e=>null==e?void 0:e.tts).filter(t).map(e=>X(e,d))),n(i.tokens)&&o.push(i.tokens.map(e=>null==e?void 0:e.tts).filter(t).map(t=>X(t,e))),n(i.questionTokens)&&o.push(i.questionTokens.map(e=>null==e?void 0:e.tts).filter(t).map(e=>X(e,d))),n(null===(l=i.metadata)||void 0===l?void 0:l.speakers))for(const e of i.metadata.speakers){var s,r;a(null===(s=e.tts)||void 0===s?void 0:s.tokens)&&o.push(Object.values(e.tts.tokens).filter(e=>t(e.url)).map(e=>G(e,y,d))),n(null===(r=e.tts)||void 0===r?void 0:r.sentence)&&o.push(e.tts.sentence.filter(e=>t(e.url)).map(e=>G(e,b,d)))}n(i.pairs)&&o.push(i.pairs.map(e=>null==e?void 0:e.tts).filter(t).map(e=>X(e,d)))}W(o.flat())})(e.challenges),$("practice_challenges_loaded",P,e,e=>{let t;var o;a(e)&&(t=[{challenges:[e.challenges,e.adaptiveChallenges,null===(o=e.adaptiveInterleavedChallenges)||void 0===o?void 0:o.challenges].filter(n).flat(),sessionMetaData:e.metadata||{}}]);return t},z))])},Q=(e,t,n)=>{const o=(e=>{const t=U()[e];if(a(t))return t;const n=e.match(D);return n?X(e,n.language):null})(r(t));return{url:t,type:(null==o?void 0:o.type)||"unknown",speed:(null==o?void 0:o.speed)||k,language:null==o?void 0:o.language,playbackStrategy:n,sound:e}};(e=>{g("Howl","init",e=>function(t){var n;c("is_howler_used",!0);const a=e.call(this,t),o=String(this._src||(null===(n=this._parent)||void 0===n?void 0:n._src)||"").trim();return""!==o&&M(N,Q(this,o,"howler")),a}),K();const t=x(N,e)})(e)}();
