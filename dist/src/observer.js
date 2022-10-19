!function(){"use strict";const e=()=>{},t=e=>"number"==typeof e&&Number.isFinite(e),n=e=>"string"==typeof e,a=Array.isArray,l=e=>"object"==typeof e&&!!e&&!a(e),o=e=>"function"==typeof e,s=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r=e=>{for(let t in e)if(s(e,t))return!1;return!0},i=e=>{let t=null;if("/"===e.charAt(0)&&("/"===e.charAt(1)?e=`https://${e}`:t=e),null===t)try{t=new URL(e).pathname}catch(n){t=e}return t},u=e=>`__duo-toolbox__-${e}`,d=u("global_variables"),c=(e,t)=>(l(window[d])||(window[d]={}),s(window[d],e)?window[d][e]:t),p=(e,t)=>{l(window[d])||(window[d]={}),window[d][e]=t},f=(e,t,n)=>{const a=t(c(e,n));return p(e,a),a},v=u("original_function"),g=u("override_version"),_=(t,n,a,r=1)=>((e,t,n,a,l=1)=>{s(window,e)&&t(window[e])?n(window[e]):f("pending_global_listeners",((o={})=>{var s;if(!o[e]){o[e]={};let n=window[e];Object.defineProperty(window,e,{get:()=>n,set:a=>{t(a)?(Object.defineProperty(window,e,{value:a,configurable:!0,enumerable:!0,writable:!0}),Object.values(o[e]).forEach((e=>e.callback(a)))):n=a},configurable:!0})}return l>(Number(null===(s=o[e][a])||void 0===s?void 0:s.version)||0)&&(o[e][a]={callback:n,version:l}),o}))})(t,o,(t=>((t,n,a,o=1)=>{var s;if(l(t)&&o>(Number(null===(s=t[n])||void 0===s?void 0:s[g])||0)){var r;const l=(null===(r=t[n])||void 0===r?void 0:r[v])||t[n]||e;t[n]=a(l),t[n][v]=l,t[n][g]=o}})(null==t?void 0:t.prototype,n,a,r)),`instance_method:${n}`,r),h=u("logging_iframe"),m=()=>(()=>{let e=document.getElementById(h);return e&&e.isConnected||(e=document.createElement("iframe"),e.id=h,e.style.display="none",document.body.appendChild(e)),e})().contentWindow.console,y=(...e)=>m().error(...e),b=["characterIntro","characterMatch","characterPuzzle","characterSelect","characterTrace","selectPronunciation","selectTranscription"],w=e=>{var t,n;return(null===(t=e.metadata)||void 0===t?void 0:t.source_language)||e.sourceLanguage||(null===(n=e.metadata)||void 0===n?void 0:n.learning_language)},O=e=>{var t;return(null===(t=e.metadata)||void 0===t?void 0:t.target_language)||e.targetLanguage||w(e)},k="effect",x="tts_sentence",K="tts_word",$="tts_morpheme",j="unknown",V="normal",L="slow",M="howler",T="rate",q="volume",E=u("forced_setting"),S=e=>l(e)&&!!e[E],N=e=>e.value,I=e=>({[E]:!0,value:e}),P=(e,n)=>T===e&&t(n)||q===e&&n>=0&&n<=1,R=(e,n)=>((e,t,n,a=1)=>{if(!l(e))return;const o=u(`${t}_override_version`);a>(Number(e[o])||0)&&Object.defineProperty(e,t,n(Object.getOwnPropertyDescriptor(e,t)))})(HTMLMediaElement,n,(n=>({...n,set:function(a){const l=D[e];t(a)?(this[l.originalValueKey]=a,s(this,l.valueKey)&&(a=this[l.isRelativeKey]?H(e,a*this[l.valueKey]):this[l.valueKey])):S(a)&&(a=N(a)),t(a)&&(this[l.listenerValueKey]=a),n.set.call(this,a)}}))),C=(e,t)=>_("Howl",t,(n=>function(){const a=this,l=arguments,o=D[e];let r=!1;const i=a._queue.length;(1===l.length||2===l.length&&void 0===l[1])&&-1===a._getSoundIds().indexOf(l[0])&&(S(l[0])?(r=!0,l[0]=N(l[0])):P(e,l[0])&&(a[o.originalValueKey]=l[0],s(a,o.valueKey)&&(r=!0,a[o.isRelativeKey]?l[0]=H(e,l[0]*a[o.valueKey]):l[0]=a[o.valueKey])),r&&(a[o.listenerValueKey]=l[0]));const u=n.apply(a,arguments);return r&&i<a._queue.length&&(a._queue[a._queue.length-1].action=function(){l[0]=I(l[0]),a[t](...l)}),u})),A=(e,t,n,a)=>({...a,functions:{audio:{applyOverride:()=>R(e,n),getter:e=>e[t],setter:(e,n)=>e[t]=n,hasQueuedUpdate:()=>!1},[M]:{applyOverride:()=>C(e,n),getter:e=>e[n](),setter:(e,t)=>e[n](t),hasQueuedUpdate:e=>e._queue.find((e=>e.event===n))}},priorityKey:u(`${e}_priority`),isRelativeKey:u(`${e}_is_relative`),valueKey:u(`forced_${e}_value`),originalValueKey:u(`original_${e}_value`),listenerValueKey:u(`${e}_value`)}),D={[T]:A(T,"playbackRate","rate",{minValue:.5,maxValue:4,defaultValue:1}),[q]:A(q,"volume","volume",{minValue:0,maxValue:1,defaultValue:1})},H=(e,t)=>D[e]?Math.max(D[e].minValue,Math.min(t,D[e].maxValue)):t,z="event_listeners",B=()=>{return`__listener::${e="last_event_listener_id",f(`__counter::${e}__`,(e=>e+1),0)}__`;var e},U=e=>{var t;return(null===(t=c(z,{}))||void 0===t?void 0:t[e])||{}},Q=(e,t)=>{f(z,(n=>Object.assign(n||{},{[e]:t})))},X=e=>!r(U(e)),F=(e,t)=>{const n=U(e);return r(n)?null:t(Object.values(n))},J=(e,t,n=B())=>{const a=U(e);return a[n]=t,Q(e,a),()=>G(e,n)},W=(e,t,n,l,o=J,s=B())=>{const r=`__${t}::${e}__`;var i;i=r,U(t)[i]||o(t,((...t)=>{const n=l(...t);a(n)&&Y(e,...n)}),r);const u=J(e,n,s);return()=>{u(),X(e)||G(t,r)}},G=(e,t)=>{const n=U(e);delete n[t],Q(e,n)},Y=(e,...t)=>F(e,(e=>e.flatMap((e=>{try{return[e(...t)]}catch(e){return[]}})))),Z="practice_session_loaded",ee="practice_challenges_loaded",te="pre_fetched_session_loaded",ne="story_loaded",ae="alphabets_loaded",le="forum_discussion_loaded",oe="dictionary_lexeme_loaded",se="sound_initialized",re={[ae]:/\/[\d]{4}-[\d]{2}-[\d]{2}\/alphabets\/courses\/(?<toLanguage>[^/]+)\/(?<fromLanguage>[^/?]+)\/?/g,[oe]:/\/api\/1\/dictionary_page/g,[le]:/\/comments\/([\d]+)/g,[Z]:/\/[\d]{4}-[\d]{2}-[\d]{2}\/sessions/g,[ne]:/\/api2\/stories/g,user_data_loaded:/\/[\d]{4}-[\d]{2}-[\d]{2}\/users\/[\d]+/g},ie=(e,t,n=B())=>(_("XMLHttpRequest","open",(e=>function(t,n,a,o,s){let r,i;for(const[e,t]of Object.entries(re))if(i=Array.from(n.matchAll(t))[0],i){r=e;break}return r&&F(r,(e=>{this.addEventListener("load",(()=>{try{const t=l(this.response)?this.response:JSON.parse(this.responseText);e.forEach((e=>e(t,i.groups||{})))}catch(e){y(e,`Could not handle the XHR result (event: ${r}): `)}}))})),e.call(this,t,n,a,o,s)}),2),J(e,t,n)),ue=(e,t=B())=>{const a=te,l=e=>F(a,(t=>{e.addEventListener("success",(()=>{try{t.forEach((t=>t(e.result)))}catch(e){y(e,`Could not handle the IDBRequest result (event: ${a}): `)}}))}));return _("IDBIndex","get",(e=>function(t){const a=e.call(this,t);return n(t)&&t&&"prefetchedSessions"===this.objectStore.name&&l(a),a})),_("IDBObjectStore","get",(e=>function(t){const n=e.call(this,t);return"prefetchedSessions"===this.name&&l(n),n})),J(a,e,t)},de=e=>{const t=e=>{let t;if(l(e)){var n;t=[{challenges:[e.challenges,e.adaptiveChallenges,null===(n=e.adaptiveInterleavedChallenges)||void 0===n?void 0:n.challenges].filter(a).flat(),sessionMetaData:e.metadata||{}}]}return t},n=W(ee,Z,e,t,ie),o=W(ee,te,e,t,((e,t,n)=>ue(t,n)));return()=>{n(),o()}},ce=(e,t)=>({url:e,type:x,speed:V,language:t}),pe=(e,t)=>({url:e,type:K,speed:V,language:t}),fe=(e,t)=>({url:e,type:$,speed:V,language:t}),ve=Object.fromEntries(["/sounds/7abe057dc8446ad325229edd6d8fd250.mp3","/sounds/2aae0ea735c8e9ed884107d6f0a09e35.mp3","/sounds/421d48c53ad6d52618dba715722278e0.mp3","/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3","/sounds/0a27c1ee63dd220647e8410a0029aed2.mp3","/sounds/a28ff0a501ef5f33ca78c0afc45ee53e.mp3","/sounds/2e4669d8cf839272f0731f8afa488caf.mp3","/sounds/f0b6ab4396d5891241ef4ca73b4de13a.mp3"].map((e=>{return[e,(t=e,{url:t,type:k,speed:V,language:null})];var t}))),ge=/\/duolingo-data\/tts\/(?<language>[a-z-_]+)\/token\//i,_e="sound_type_map",he=()=>c(_e,ve),me=[j,x,K,$,k],ye=[V,L],be=(e,t)=>((e,t,n)=>{for(const a of e){const e=Number(a(t,n));if(!isNaN(e)&&0!==e)return e}return 0})([(e,t)=>me.indexOf(e.type)-me.indexOf(t.type),(e,t)=>ye.indexOf(e.speed)-ye.indexOf(t.speed)],e,t),we=e=>{const t=he()||{};for(const n of e){const e=i(n.url);(!t[e]||be(n,t[e])>0)&&(t[e]=n)}p(_e,t)},Oe="sound_detection_listeners_version",ke="sound_detection_unregistration_callbacks",xe=(e,t,n)=>{var a;return{url:e.url,type:t,speed:(null===(a=e.speed)||void 0===a?void 0:a.value)||V,language:n}},Ke=()=>{const e=2<=(Number(c(Oe))||0);var t,o,s,r,i;!!c(ke)&&e||(e||$e(),p(Oe,2),p(ke,[(i=e=>(e=>{const t=e.learningLanguage;a(null==e?void 0:e.elements)&&we(e.elements.map((e=>{var t;return(null==e||null===(t=e.line)||void 0===t?void 0:t.content)||(null==e?void 0:e.learningLanguageTitleContent)})).flatMap((e=>[null==e?void 0:e.audio,null==e?void 0:e.audioPrefix,null==e?void 0:e.audioSuffix])).map((e=>null==e?void 0:e.url)).filter(n).map((e=>ce(e,t))))})(e),ie(ne,i)),(s=(e,t)=>((e,t)=>{const l=t.toLanguage;a(null==e?void 0:e.alphabets)&&n(null==t?void 0:t.toLanguage)&&we(e.alphabets.flatMap((e=>null==e?void 0:e.groups)).flatMap((e=>null==e?void 0:e.characters)).flat().map((e=>null==e?void 0:e.ttsUrl)).filter(n).map((e=>fe(e,l))))})(e,t),ie(ae,s,r)),(o=e=>{var t;n(null==(t=e)?void 0:t.tts_url)&&we([ce(t.tts_url,t.sentence_language)])},ie(le,o)),(t=e=>(e=>{const t=[],l=e.learning_language;n(e.tts)&&t.push(pe(e.tts,l)),a(e.alternative_forms)&&t.push(e.alternative_forms.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>ce(e,l)))),we(t.flat())})(e),ie(oe,t)),de((e=>(e=>{const t=[];for(const i of e){var o;const e=i.type,u=w(i),d=O(i);if(n(i.tts)){const n=b.indexOf(e)>=0?fe:ce;t.push(n(i.tts,u))}if(n(i.slowTts)&&t.push({url:i.slowTts,type:x,speed:L,language:u}),n(i.solutionTts)&&t.push(ce(i.solutionTts,d)),a(i.choices)){const a=-1===b.indexOf(e)?pe:fe;t.push(i.choices.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>a(e,d))))}if(a(i.tokens)&&t.push(i.tokens.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>pe(e,u)))),a(i.questionTokens)&&t.push(i.questionTokens.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>pe(e,d)))),a(null===(o=i.metadata)||void 0===o?void 0:o.speakers))for(const e of i.metadata.speakers){var s,r;l(null===(s=e.tts)||void 0===s?void 0:s.tokens)&&t.push(Object.values(e.tts.tokens).filter((e=>n(e.url))).map((e=>xe(e,K,d)))),a(null===(r=e.tts)||void 0===r?void 0:r.sentence)&&t.push(e.tts.sentence.filter((e=>n(e.url))).map((e=>xe(e,x,d))))}if(a(i.pairs)){const a=-1===b.indexOf(e)?pe:fe;t.push(i.pairs.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>a(e,d))))}a(i.options)&&t.push(i.options.map((e=>null==e?void 0:e.tts)).filter(n).map((e=>pe(e,d))))}we(t.flat())})(e.challenges)))]))},$e=()=>{const e=c(ke);!a(e)||X(se)||X("sound_playback_requested")||X("sound_playback_cancelled")||X("sound_playback_confirmed")||(e.forEach((e=>e())),p(Oe,null),p(ke,null))},je=(e,t,n)=>{const a=(e=>{const t=he()[e];if(l(t))return t;const n=e.match(ge);return n?pe(e,n.language):null})(i(t));return{url:t,type:(null==a?void 0:a.type)||j,speed:(null==a?void 0:a.speed)||V,language:null==a?void 0:a.language,playbackStrategy:n,sound:e}};(e=>{_("Howl","init",(e=>function(t){var n;p("is_howler_used",!0);const a=e.call(this,t),l=String(this._src||(null===(n=this._parent)||void 0===n?void 0:n._src)||"").trim();return""!==l&&Y(se,je(this,l,M)),a})),Ke();const t=J(se,e)})(e)}();
