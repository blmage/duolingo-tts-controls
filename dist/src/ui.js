!function(){"use strict";var t,e,n,r,o,u={},l=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(t,e){for(var n in e)t[n]=e[n];return t}function i(t){var e=t.parentNode;e&&e.removeChild(t)}function _(t,e,n){var r,o=arguments,u={};for(r in e)"key"!==r&&"ref"!==r&&(u[r]=e[r]);if(arguments.length>3)for(n=[n],r=3;r<arguments.length;r++)n.push(o[r]);if(null!=n&&(u.children=n),"function"==typeof t&&null!=t.defaultProps)for(r in t.defaultProps)void 0===u[r]&&(u[r]=t.defaultProps[r]);return s(t,u,e&&e.key,e&&e.ref,null)}function s(e,n,r,o,u){var l={type:e,props:n,key:r,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:u};return null==u&&(l.__v=l),t.vnode&&t.vnode(l),l}function f(t){return t.children}function p(t,e){this.props=t,this.context=e}function d(t,e){if(null==e)return t.__?d(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e)return n.__e;return"function"==typeof t.type?d(t):null}function v(t){var e,n;if(null!=(t=t.__)&&null!=t.__c){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e){t.__e=t.__c.base=n.__e;break}return v(t)}}function h(o){(!o.__d&&(o.__d=!0)&&e.push(o)&&!y.__r++||r!==t.debounceRendering)&&((r=t.debounceRendering)||n)(y)}function y(){for(var t;y.__r=e.length;)t=e.sort((function(t,e){return t.__v.__b-e.__v.__b})),e=[],t.some((function(t){var e,n,r,o,u,l,c;t.__d&&(l=(u=(e=t).__v).__e,(c=e.__P)&&(n=[],(r=a({},u)).__v=r,o=E(c,u,r,e.__n,void 0!==c.ownerSVGElement,null,n,null==l?d(u):l),C(n,u),o!=l&&v(u)))}))}function m(t,e,n,r,o,c,a,_,p,v){var h,y,m,b,k,w,S,C=r&&r.__k||l,x=C.length;for(p==u&&(p=null!=a?a[0]:x?d(r,0):null),n.__k=[],h=0;h<e.length;h++)if(null!=(b=n.__k[h]=null==(b=e[h])||"boolean"==typeof b?null:"string"==typeof b||"number"==typeof b?s(null,b,null,null,b):Array.isArray(b)?s(f,{children:b},null,null,null):null!=b.__e||null!=b.__c?s(b.type,b.props,b.key,null,b.__v):b)){if(b.__=n,b.__b=n.__b+1,null===(m=C[h])||m&&b.key==m.key&&b.type===m.type)C[h]=void 0;else for(y=0;y<x;y++){if((m=C[y])&&b.key==m.key&&b.type===m.type){C[y]=void 0;break}m=null}k=E(t,b,m=m||u,o,c,a,_,p,v),(y=b.ref)&&m.ref!=y&&(S||(S=[]),m.ref&&S.push(m.ref,null,b),S.push(y,b.__c||k,b)),null!=k?(null==w&&(w=k),p=g(t,b,m,C,a,k,p),"option"==n.type?t.value="":"function"==typeof n.type&&(n.__d=p)):p&&m.__e==p&&p.parentNode!=t&&(p=d(m))}if(n.__e=w,null!=a&&"function"!=typeof n.type)for(h=a.length;h--;)null!=a[h]&&i(a[h]);for(h=x;h--;)null!=C[h]&&A(C[h],C[h]);if(S)for(h=0;h<S.length;h++)N(S[h],S[++h],S[++h])}function g(t,e,n,r,o,u,l){var c,a,i;if(void 0!==e.__d)c=e.__d,e.__d=void 0;else if(o==n||u!=l||null==u.parentNode)t:if(null==l||l.parentNode!==t)t.appendChild(u),c=null;else{for(a=l,i=0;(a=a.nextSibling)&&i<r.length;i+=2)if(a==u)break t;t.insertBefore(u,l),c=l}return void 0!==c?c:u.nextSibling}function b(t,e,n){"-"===e[0]?t.setProperty(e,n):t[e]="number"==typeof n&&!1===c.test(e)?n+"px":null==n?"":n}function k(t,e,n,r,o){var u,l,c,a,i;if(o?"className"===e&&(e="class"):"class"===e&&(e="className"),"style"===e)if(u=t.style,"string"==typeof n)u.cssText=n;else{if("string"==typeof r&&(u.cssText="",r=null),r)for(a in r)n&&a in n||b(u,a,"");if(n)for(i in n)r&&n[i]===r[i]||b(u,i,n[i])}else"o"===e[0]&&"n"===e[1]?(l=e!==(e=e.replace(/Capture$/,"")),c=e.toLowerCase(),e=(c in t?c:e).slice(2),n?(r||t.addEventListener(e,w,l),(t.l||(t.l={}))[e]=n):t.removeEventListener(e,w,l)):"list"!==e&&"tagName"!==e&&"form"!==e&&"type"!==e&&"size"!==e&&!o&&e in t?t[e]=null==n?"":n:"function"!=typeof n&&"dangerouslySetInnerHTML"!==e&&(e!==(e=e.replace(/^xlink:?/,""))?null==n||!1===n?t.removeAttributeNS("http://www.w3.org/1999/xlink",e.toLowerCase()):t.setAttributeNS("http://www.w3.org/1999/xlink",e.toLowerCase(),n):null==n||!1===n&&!/^ar/.test(e)?t.removeAttribute(e):t.setAttribute(e,n))}function w(e){this.l[e.type](t.event?t.event(e):e)}function S(t,e,n){var r,o;for(r=0;r<t.__k.length;r++)(o=t.__k[r])&&(o.__=t,o.__e&&("function"==typeof o.type&&o.__k.length>1&&S(o,e,n),e=g(n,o,o,t.__k,null,o.__e,e),"function"==typeof t.type&&(t.__d=e)))}function E(e,n,r,o,u,l,c,i,_){var s,d,v,h,y,g,b,k,w,E,C,N=n.type;if(void 0!==n.constructor)return null;(s=t.__b)&&s(n);try{t:if("function"==typeof N){if(k=n.props,w=(s=N.contextType)&&o[s.__c],E=s?w?w.props.value:s.__:o,r.__c?b=(d=n.__c=r.__c).__=d.__E:("prototype"in N&&N.prototype.render?n.__c=d=new N(k,E):(n.__c=d=new p(k,E),d.constructor=N,d.render=L),w&&w.sub(d),d.props=k,d.state||(d.state={}),d.context=E,d.__n=o,v=d.__d=!0,d.__h=[]),null==d.__s&&(d.__s=d.state),null!=N.getDerivedStateFromProps&&(d.__s==d.state&&(d.__s=a({},d.__s)),a(d.__s,N.getDerivedStateFromProps(k,d.__s))),h=d.props,y=d.state,v)null==N.getDerivedStateFromProps&&null!=d.componentWillMount&&d.componentWillMount(),null!=d.componentDidMount&&d.__h.push(d.componentDidMount);else{if(null==N.getDerivedStateFromProps&&k!==h&&null!=d.componentWillReceiveProps&&d.componentWillReceiveProps(k,E),!d.__e&&null!=d.shouldComponentUpdate&&!1===d.shouldComponentUpdate(k,d.__s,E)||n.__v===r.__v){d.props=k,d.state=d.__s,n.__v!==r.__v&&(d.__d=!1),d.__v=n,n.__e=r.__e,n.__k=r.__k,d.__h.length&&c.push(d),S(n,i,e);break t}null!=d.componentWillUpdate&&d.componentWillUpdate(k,d.__s,E),null!=d.componentDidUpdate&&d.__h.push((function(){d.componentDidUpdate(h,y,g)}))}d.context=E,d.props=k,d.state=d.__s,(s=t.__r)&&s(n),d.__d=!1,d.__v=n,d.__P=e,s=d.render(d.props,d.state,d.context),d.state=d.__s,null!=d.getChildContext&&(o=a(a({},o),d.getChildContext())),v||null==d.getSnapshotBeforeUpdate||(g=d.getSnapshotBeforeUpdate(h,y)),C=null!=s&&s.type==f&&null==s.key?s.props.children:s,m(e,Array.isArray(C)?C:[C],n,r,o,u,l,c,i,_),d.base=n.__e,d.__h.length&&c.push(d),b&&(d.__E=d.__=null),d.__e=!1}else null==l&&n.__v===r.__v?(n.__k=r.__k,n.__e=r.__e):n.__e=x(r.__e,n,r,o,u,l,c,_);(s=t.diffed)&&s(n)}catch(e){n.__v=null,t.__e(e,n,r)}return n.__e}function C(e,n){t.__c&&t.__c(n,e),e.some((function(n){try{e=n.__h,n.__h=[],e.some((function(t){t.call(n)}))}catch(e){t.__e(e,n.__v)}}))}function x(t,e,n,r,o,c,a,i){var _,s,f,p,d,v=n.props,h=e.props;if(o="svg"===e.type||o,null!=c)for(_=0;_<c.length;_++)if(null!=(s=c[_])&&((null===e.type?3===s.nodeType:s.localName===e.type)||t==s)){t=s,c[_]=null;break}if(null==t){if(null===e.type)return document.createTextNode(h);t=o?document.createElementNS("http://www.w3.org/2000/svg",e.type):document.createElement(e.type,h.is&&{is:h.is}),c=null,i=!1}if(null===e.type)v!==h&&t.data!=h&&(t.data=h);else{if(null!=c&&(c=l.slice.call(t.childNodes)),f=(v=n.props||u).dangerouslySetInnerHTML,p=h.dangerouslySetInnerHTML,!i){if(null!=c)for(v={},d=0;d<t.attributes.length;d++)v[t.attributes[d].name]=t.attributes[d].value;(p||f)&&(p&&f&&p.__html==f.__html||(t.innerHTML=p&&p.__html||""))}(function(t,e,n,r,o){var u;for(u in n)"children"===u||"key"===u||u in e||k(t,u,null,n[u],r);for(u in e)o&&"function"!=typeof e[u]||"children"===u||"key"===u||"value"===u||"checked"===u||n[u]===e[u]||k(t,u,e[u],n[u],r)})(t,h,v,o,i),p?e.__k=[]:(_=e.props.children,m(t,Array.isArray(_)?_:[_],e,n,r,"foreignObject"!==e.type&&o,c,a,u,i)),i||("value"in h&&void 0!==(_=h.value)&&_!==t.value&&k(t,"value",_,v.value,!1),"checked"in h&&void 0!==(_=h.checked)&&_!==t.checked&&k(t,"checked",_,v.checked,!1))}return t}function N(e,n,r){try{"function"==typeof e?e(n):e.current=n}catch(e){t.__e(e,r)}}function A(e,n,r){var o,u,l;if(t.unmount&&t.unmount(e),(o=e.ref)&&(o.current&&o.current!==e.__e||N(o,null,n)),r||"function"==typeof e.type||(r=null!=(u=e.__e)),e.__e=e.__d=void 0,null!=(o=e.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(e){t.__e(e,n)}o.base=o.__P=null}if(o=e.__k)for(l=0;l<o.length;l++)o[l]&&A(o[l],n,r);null!=u&&i(u)}function L(t,e,n){return this.constructor(t,n)}function T(e,n,r){var c,a,i;t.__&&t.__(e,n),a=(c=r===o)?null:r&&r.__k||n.__k,e=_(f,null,[e]),i=[],E(n,(c?n:r||n).__k=e,a||u,u,void 0!==n.ownerSVGElement,r&&!c?[r]:a?null:n.childNodes.length?l.slice.call(n.childNodes):null,i,r||u,c),C(i,e)}t={__e:function(t,e){for(var n,r;e=e.__;)if((n=e.__c)&&!n.__)try{if(n.constructor&&null!=n.constructor.getDerivedStateFromError&&(r=!0,n.setState(n.constructor.getDerivedStateFromError(t))),null!=n.componentDidCatch&&(r=!0,n.componentDidCatch(t)),r)return h(n.__E=n)}catch(e){t=e}throw t}},p.prototype.setState=function(t,e){var n;n=this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof t&&(t=t(n,this.props)),t&&a(n,t),null!=t&&this.__v&&(e&&this.__h.push(e),h(this))},p.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),h(this))},p.prototype.render=f,e=[],n="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,y.__r=0,o=u;var H=["0","1","2","3","4","5","6","7","8","9"],I=["listen","listenTap"],D=/\/[\d]{4}-[\d]{2}-[\d]{2}\/sessions/g,M="basic",U=[M,"cartoon"];function F(){}function W(t){return"object"==typeof t&&!!t&&!Array.isArray(t)}function P(t){return Array.isArray(t)}function B(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;t instanceof Element&&("none"===t.style.display?!1!==e&&(t.style.display=""):!0!==e&&(t.style.display="none"))}function O(t){t.preventDefault(),t.stopPropagation()}var j,q,R,V=0,K=[],Q=t.__r,z=t.diffed,J=t.__c,X=t.unmount;function Z(e,n){t.__h&&t.__h(q,e,V||n),V=0;var r=q.__H||(q.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function G(t){return V=1,function(t,e,n){var r=Z(j++,2);return r.t=t,r.__c||(r.__c=q,r.__=[n?n(e):ct(void 0,e),function(t){var e=r.t(r.__[0],t);r.__[0]!==e&&(r.__=[e,r.__[1]],r.__c.setState({}))}]),r.__}(ct,t)}function $(e,n){var r=Z(j++,3);!t.__s&&lt(r.__H,n)&&(r.__=e,r.__H=n,q.__H.__h.push(r))}function Y(t){return V=5,tt((function(){return{current:t}}),[])}function tt(t,e){var n=Z(j++,7);return lt(n.__H,e)?(n.__H=e,n.__h=t,n.__=t()):n.__}function et(t,e){return V=8,tt((function(){return t}),e)}function nt(){K.some((function(e){if(e.__P)try{e.__H.__h.forEach(ot),e.__H.__h.forEach(ut),e.__H.__h=[]}catch(n){return e.__H.__h=[],t.__e(n,e.__v),!0}})),K=[]}t.__r=function(t){Q&&Q(t),j=0;var e=(q=t.__c).__H;e&&(e.__h.forEach(ot),e.__h.forEach(ut),e.__h=[])},t.diffed=function(e){z&&z(e);var n=e.__c;n&&n.__H&&n.__H.__h.length&&(1!==K.push(n)&&R===t.requestAnimationFrame||((R=t.requestAnimationFrame)||function(t){var e,n=function(){clearTimeout(r),rt&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,100);rt&&(e=requestAnimationFrame(n))})(nt))},t.__c=function(e,n){n.some((function(e){try{e.__h.forEach(ot),e.__h=e.__h.filter((function(t){return!t.__||ut(t)}))}catch(r){n.some((function(t){t.__h&&(t.__h=[])})),n=[],t.__e(r,e.__v)}})),J&&J(e,n)},t.unmount=function(e){X&&X(e);var n=e.__c;if(n&&n.__H)try{n.__H.__.forEach(ot)}catch(e){t.__e(e,n.__v)}};var rt="function"==typeof requestAnimationFrame;function ot(t){"function"==typeof t.u&&t.u()}function ut(t){t.u=t.__()}function lt(t,e){return!t||e.some((function(e,n){return e!==t[n]}))}function ct(t,e){return"function"==typeof e?e(t):e}
/*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */function at(){for(var t=0,e=0,n=arguments.length;e<n;e++)t+=arguments[e].length;var r=Array(t),o=0;for(e=0;e<n;e++)for(var u=arguments[e],l=0,c=u.length;l<c;l++,o++)r[o]=u[l];return r}var it="object"==typeof window,_t=it?window:null,st=function(t){return!!t.addEventListener},ft=function(t){return!!t.on},pt=function(){},dt=function(t,e,n,r){void 0===e&&(e=pt),void 0===n&&(n={}),void 0===r&&(r=[t]);var o=n.event,u=void 0===o?"keydown":o,l=n.target,c=n.options,a=tt((function(){var r=function(t){if(Array.isArray(t)){var e=t.map((function(t){return String(t).toLowerCase()}));return function(t){return e.indexOf(t.key.toLowerCase())>=0}}if("string"==typeof t){var n=t.toLowerCase();return function(t){return t.key.toLowerCase()===n}}return t?function(){return!0}:function(){return!1}}(t);return function(t){if(r(t))return n.discard&&(t.preventDefault(),t.stopPropagation()),e(t.key.toLowerCase(),t)}}),r);!function(t,e,n,r){void 0===n&&(n=_t),$((function(){if(e&&n)return st(n)?n.addEventListener(t,e,r):ft(n)&&n.on(t,e,r),function(){st(n)?n.removeEventListener(t,e,r):ft(n)&&n.off(t,e,r)}}),[t,e,n,JSON.stringify(r)])}(u,a,l,c)},vt=function(t){var e=Y(t);e.current=t,$((function(){return function(){return e.current()}}),[])},ht=function(t){var e=G(t),n=e[0],r=e[1],o=Y(n),u=Y({get current(){return o.current}}),l=et((function(t){r(t),o.current=t}),[r]);return[n,u.current,l]},yt={delay:200,defer:!1},mt="normal";function gt(t){return"slow"===t?1:.5}function bt(t){return"slow"===t?2.5:2}function kt(t,e){return Math.max(gt(t),Math.min(e,bt(t)))}function wt(t){return Math.max(.05,Math.min(t,1))}function St(t){return"".concat("_duo-ttsc_","tts_rate_").concat(t)}function Et(t){return"".concat("_duo-ttsc_","tts_volume_").concat(t)}function Ct(t){var e=localStorage.getItem(St(t));return kt(t,Number(e)||1)}function xt(t){var e=localStorage.getItem(Et(t));return wt(Number(e)||1)}function Nt(t){if("loaded"!==t.state())return 0;var e,n=!!t._playLock;n&&(t._playLock=!1);for(var r=t._getSoundIds(),o=0;o<r.length;o++){var u=t._soundById(r[o]);if(!u._paused){e=u._id;break}}var l=Number(t.seek(e));return n&&(t._playLock=!0),isNaN(l)?0:l}function At(t,e,n){if(n.rate(t),n.volume(e>1?1:e),e>1&&n._webAudio&&n._getSoundIds&&n._soundById&&Howler&&Howler.ctx)for(var r=n._getSoundIds(),o=0;o<r.length;o++){var u=n._soundById(r[o]);u&&u._node&&!u._muted&&u._node.gain.setValueAtTime(e,Howler.ctx.currentTime)}}var Lt=Symbol("base"),Tt=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];return et(n=>(P(n)?n:[n]).flatMap(n=>{var r=[];return t[Lt]&&t[Lt][n]&&r.push(...t[Lt][n]),e.forEach(e=>{e&&t[e]&&t[e][n]&&r.push(...t[e][n])}),r}).join(" "),e.concat([t]))},Ht=["pause","pin","play","stop"],It=t=>{var{type:e,disabled:n=!1,onClick:r=F}=t,o=Y(null),u=Tt(Ft,[e]);return $(()=>{n&&o.current&&document.activeElement===o.current&&o.current.blur()}),_("div",{className:u(Dt)},_("button",{ref:o,disabled:n,onClick:r,onKeyUp:t=>t.preventDefault(),className:u(Mt)},_("span",{className:u(Ut)})))},Dt="wrapper",Mt="button",Ut="icon",Ft={[Lt]:{[Dt]:["_10S_q"],[Mt]:["_2dfXt","_3ZQ9H","_3lE5Q","_18se6","vy3TL","_3iIWE","_1Mkpg","_1Dtxl","_1sVAI","sweRn","_1BWZU","_1LIf4","QVrnU","".concat("_duo-ttsc_","control-button")],[Ut]:["D9gQ7","".concat("_duo-ttsc_","control-button-icon")]}};Ht.forEach(t=>{Ft[t]={[Mt]:["".concat("_duo-ttsc_","control-button-").concat(t)]}});var Wt=["position","rate","volume"],Pt=t=>{var{type:e,value:n=1,min:r=n,max:o=n,step:u=.1,hint:l="",disabled:c=!1,onChangeStart:a=F,onChange:i=F,onChangeEnd:s=F}=t,f=Y(!1),p=et(t=>{var e=t.target.value;f.current?i(e):(f.current=!0,a(e))},[a,i,f]),d=et(t=>{f.current&&(f.current=!1,s(t.target.value))},[s,f]),v=Tt(Kt,[e]);return _("div",{className:v(Bt)},_("span",{onClick:()=>s(r),className:v([Ot,jt])}),_("input",{type:"range",min:r,max:o,step:u,value:n,disabled:c,onKeyDown:t=>t.preventDefault(),onKeyUp:t=>t.preventDefault(),onInput:p,onChange:d,onMouseUp:d,className:v(Rt)}),_("span",{onClick:()=>s(o),className:v([Ot,qt])}),""!==l&&_("span",{className:v(Vt)},l))},Bt="wrapper",Ot="button",jt="min_button",qt="max_button",Rt="input",Vt="hint",Kt={[Lt]:{[Bt]:["".concat("_duo-ttsc_","slider")],[Ot]:["_104UW","_1a2L9","".concat("_duo-ttsc_","slider-button")],[jt]:["".concat("_duo-ttsc_","slider-min-button")],[qt]:["".concat("_duo-ttsc_","slider-max-button")],[Rt]:["_2iSv6","_7gXTk","".concat("_duo-ttsc_","slider-input")],[Vt]:["D9gQ7","".concat("_duo-ttsc_","slider-hint")]}};Wt.forEach(t=>{Kt[t]={[Bt]:["".concat("_duo-ttsc_","slider-").concat(t)]}});var Qt=t=>{var{formStyle:e=M,ttsType:n=mt,active:r=!1,howl:o=null}=t,[u,l,c]=(t=>{var[e,n,r]=ht(Ct(t));return[e,n,et(e=>{var n=Number(e),o=kt(t,isNaN(n)?1:n);r(o),localStorage.setItem(St(t),String(o))},[t,r])]})(n),[a,i,s]=(t=>{var[e,n,r]=ht(xt(t));return[e,n,et(e=>{var n=Number(e),o=wt(isNaN(n)?1:n);r(o),localStorage.setItem(Et(t),String(o))},[t,r])]})(n),[f,p]=G(0),[d,v,h]=ht(0),[y,m,g]=ht(!1),[b,k,w]=ht(!1),S=Y(0),E=et(()=>!m.current||k.current,[m,k]),C=function(t,e){void 0===e&&(e=yt);for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var o=Y(!1),u=Y(null),l=et((function(){for(var n=[],r=0;r<arguments.length;r++)n[r]=arguments[r];o.current?e.defer&&(u.current=n):(o.current=!0,u.current=null,t.apply(void 0,n),setTimeout((function(){o.current=!1,Array.isArray(u.current)&&l.apply(void 0,u.current)}),e.delay))}),[t,e.delay,e.defer]);return et((function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];return l.apply(void 0,at(n,t))}),[n.concat(l)])}((t,e,n)=>t&&At(e,n,t),{delay:50,defer:!0},o),x=et(t=>{c(t),C(t,i.current)},[i,c,C]),N=et(t=>{s(t),C(l.current,t)},[l,s,C]),A=Y(null),L=Y(!1),T=et(t=>{var e=Math.round(10*Number(t))/10;return isNaN(e)?null:Math.max(0,Math.min(e,f))},[f]),I=et(t=>{h(t),A.current=null},[h,A]),D=et(t=>{h(t),A.current=t},[h,A]),U=Y(new Set),F=Y(!1),P=et(()=>U.current.size>0,[U]),B=et(t=>{var e,n=T(t);null!==n&&(P()?e=!F.current:(o&&o.seek(n),e=E()),e?D(n):I(n));return n},[o,T,I,D,E,P,F]),j=et((t,e)=>{U.current.add(t),B(e),1===U.current.size&&(o&&y?(F.current=!b,o.pause()):F.current=!1)},[o,y,b,U,F,B]),q=et((t,e)=>{U.current.delete(t);var n=B(e);0===U.current.size&&(o&&(null!==n&&o.seek(n),F.current&&o.play()),F.current=!1)},[o,U,F,B]),R=et(()=>o&&!P()&&o.play(),[o,P]),V=et(()=>{if(o){o.pause();var t=Nt(o);t>=f-.2&&o.seek(t)}},[o,f]),K=et(()=>{o&&(L.current=!0,o.stop())},[o]),Q=et(()=>{var t=T(v.current);null!==t&&(S.current=t)},[v,S,T]),z=function(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"keydown";dt(t,(t,n)=>{r&&(O(n),e(t,n))},{event:o},[r].concat(n))};z(["<",">"],t=>{"<"===t?l.current>gt(n)&&x(l.current-.1):l.current<bt(n)&&x(l.current+.1)},[n,l,x]),z(["arrowdown","arrowup"],t=>{"arrowdown"===t?i.current>.05&&N(i.current-.05):i.current<1&&N(i.current+.05)},[i,N]),z(["0","home","end"],t=>B("end"===t?f:0),[f,B]),z(H.slice(1),t=>B(T(f*Number(t)/10)),[f,T,B]),z(["arrowleft","arrowright"],(t,e)=>{var n="arrowleft"===t?Math.max(0,v.current-.1):Math.min(f,v.current+.1);e.repeat?n!==v.current&&B(n):j(t,n)},[f,v,B,j]),z(["arrowleft","arrowright"],t=>q(t,v.current),[v,q],"keyup"),z([" ","k"],()=>!y||b?R():V(),[y,b,R,V]),z("p",()=>Q(),[Q]);var J=Y(!1);$(()=>{if(o){var t=o.playing(),e=Nt(o);p(o.duration()),I(e||0),g(t),w(!t&&e>0);var n=function(t){!function(t){return t._getSoundIds().length>1}(this)||J.current?(g(!0),w(!1),A.current=null,J.current=!1):(J.current=!0,this.seek(v.current,t))},r=()=>{w(!0),A.current=Nt(o)};return o.on("play",n),o.on("pause",r),()=>{o&&(o.off("play",n),o.off("pause",r))}}},[o,v,p,I,g,w,A,J]);var X,Z,tt,nt=Y(!1),rt=et((function(){if(!nt.current){var t=L.current||null===A.current||A.current>=f?S.current:A.current;L.current&&(A.current=null,L.current=!1),g(!1),h(t),this.seek(t)}}),[f,g,S,A,L,h,nt]);$(()=>{if(o)return o.on("end",rt),o.on("stop",rt),()=>{o.off("end",rt),o.off("stop",rt)}},[o,rt]),vt(()=>{o&&(nt.current=!0,o.stop(),o.seek(0))}),X=()=>{if(o&&o.playing()){var t=Nt(o);b||t===d||t===A.current||I(t)}},Z=y&&!b?75:null,tt=Y((function(){})),$((function(){tt.current=X})),$((function(){if(null!==Z){var t=setInterval((function(){return tt.current()}),Z||0);return function(){return clearInterval(t)}}}),[Z]);var ot=Tt(Zt,[e]),ut=W(o),lt=1===u?"1x":"".concat(u.toFixed(1),"x"),ct=ut?"".concat(d.toFixed(1),"s / ").concat(f.toFixed(1),"s"):"? / ?";return _("div",{className:ot([zt,r?Jt:null])},_(Pt,{type:"rate",value:u,min:gt(n),max:bt(n),step:.1,hint:lt,onChangeStart:x,onChange:x,onChangeEnd:x}),_(Pt,{type:"volume",value:a,min:.05,max:1,step:.05,hint:"".concat(Math.round(100*a),"%"),onChangeStart:N,onChange:N,onChangeEnd:N}),_(Pt,{type:"position",value:d,min:0,max:f,step:.1,hint:ct,disabled:!ut,onChangeStart:t=>j("slider",t),onChange:B,onChangeEnd:t=>q("slider",t)}),_("div",{className:ot(Xt)},_(It,!y||b?{type:"play",disabled:!ut,onClick:R}:{type:"pause",disabled:!ut,onClick:V}),_(It,{type:"stop",disabled:!ut||!y,onClick:K}),_(It,{type:"pin",disabled:!ut,onClick:Q})))},zt="wrapper",Jt="wrapper__active",Xt="button_wrapper",Zt={[Lt]:{[zt]:["".concat("_duo-ttsc_","control-panel")],[Jt]:["D9gQ7","".concat("_duo-ttsc_","control-panel_active")],[Xt]:["_2mM1T","".concat("_duo-ttsc_","control-buttons")]}},Gt=t=>{var{formStyle:e=M,active:n=!1,onClick:r=F}=t;return _("button",{onClick:r,onKeyDown:t=>t.preventDefault(),onKeyUp:t=>t.preventDefault(),className:Tt(ee,[e])([$t,n?Yt:te])})},$t="button",Yt="button__active",te="button__inactive",ee={[Lt]:{[$t]:["".concat("_duo-ttsc_","control-form-toggle-button")],[Yt]:["".concat("_duo-ttsc_","control-form-toggle-button_active")]},[M]:{[$t]:["_2dIjg","XepLJ","_1bJB-","vy3TL","_3iIWE","_1Mkpg","_1Dtxl","_1sVAI","sweRn","_1BWZU","_2bW5I","_3ZpUo","_2odwU"]},cartoon:{[$t]:["_1kiAo","_3iIWE","_1Mkpg","_2bW5I","_1Dtxl"],[Yt]:["_2rA41"],[te]:["D9gQ7"]}},ne=[],re=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(t,e,n,r,o){return e.match(D)&&(!0,this.addEventListener("load",()=>{try{!1;var t=W(this.response)?this.response:JSON.parse(this.responseText);W(t)&&P(t.challenges)&&(ne=[],t.challenges.forEach((t,e)=>{I.indexOf(t.type)>=0&&(t.tts&&ne.push({ttsType:mt,soundUrl:String(t.tts).trim(),challengeIndex:e}),t.slowTts&&ne.push({ttsType:"slow",soundUrl:String(t.slowTts).trim(),challengeIndex:e}))}))}catch(t){}})),re.call(this,t,e,n,r,o)};var oe={},ue=null;setInterval(()=>{if(window.Howl&&ue!==Howl.prototype){ue=Howl.prototype;var t=Howl.prototype.init,e=Howl.prototype.play;Howl.prototype.init=function(e){try{[e.src].flat().forEach(t=>oe[t]=this)}catch(t){}return t.call(this,e)},Howl.prototype.play=function(t){try{if(!t){var n=String(this._src||this._parent&&this._parent._src||"").trim(),r=ne.find(t=>n===t.soundUrl);W(r)&&function(t){var e,n=U.find(t=>([e]=ie(Ee,t),!!e));if(e!==ae){if(he(!0),ae=e,!e)return;if([ce]=ie(we,n),!ce||ce.querySelector(He))return;var[r]=ie(Se,n,ce),o=ie(Ce,n,e).flatMap(t=>ie(xe,n,t));if(!r||0===o.length)return;o.forEach(t=>{var e=t.matches(Le[Ne][n])?"slow":mt,o=document.createElement("div");o.classList.add(...Te),o.style.display="none",r.append(o);var u=t.parentElement,l=document.createElement("button");l.style.display="none",l.addEventListener("click",()=>t.click()),u.prepend(l);var c=document.createElement("div");u.appendChild(c),T(_(Gt,{formStyle:n,active:!1,onClick:()=>pe(e)}),u,c),c.isConnected&&u.removeChild(c),le[e]={formStyle:n,ttsType:e,isActive:!1,isFocused:!1,howl:null,panelWrapper:o,toggleButton:u.lastElementChild}}),ne.filter(e=>e.challengeIndex===t).map(t=>[t.ttsType,oe[t.soundUrl]]).filter(t=>W(t[1])).forEach(t=>{var[n,r]=t,o=()=>{le[n]&&e===ae&&(!function(t,e){At(Ct(t),xt(t),e)}(n,r),le[n].howl=r,fe(n))};"loaded"===r.state()?o():r.once("load",o)})}}(r.challengeIndex)}}catch(t){}return e.call(this,t)}}},50),setInterval(()=>{oe=Object.fromEntries(Object.entries(oe).filter(t=>"unloaded"!==t[1].state()))},6e4);var le={},ce=null,ae=null;function ie(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:document.body,r=Array.from(n.querySelectorAll(Le[t][e]));return r.forEach(n=>{n.classList.add("".concat("_duo-ttsc_").concat(t),"".concat("_duo-ttsc_").concat(t,"_").concat(e))}),r}function _e(){return Object.keys(le)}function se(){return Object.values(le).find(t=>t.isActive)}function fe(t){if(le[t]&&le[t].panelWrapper.isConnected){var{formStyle:e,isActive:n,isFocused:r,howl:o,panelWrapper:u,toggleButton:l}=le[t];T(_(Gt,{formStyle:e,active:n,onClick:()=>pe(t)}),l.parentElement,l),T(_(Qt,{formStyle:e,ttsType:t,active:n&&r,howl:o}),u)}}function pe(t){if(le[t]&&le[t].panelWrapper.isConnected){var e=!1,n=se();if(n&&(n.isActive=!1,n.isFocused=!1,fe(n.ttsType),B(n.panelWrapper,!1)),!n||n.ttsType!==t){var r=le[t];r.isActive=!0,r.isFocused=!0,fe(r.ttsType),B(r.panelWrapper,!0),e=!0}null!==ce&&ce.classList.toggle(Ae,e)}}function de(){var t=se();t&&!t.isFocused&&(t.isFocused=!0,fe(t.ttsType))}function ve(){var t=se();t&&t.isFocused&&(t.isFocused=!1,fe(t.ttsType))}function he(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];Object.entries(le).forEach(e=>{var[n,r]=e;!t&&r.panelWrapper.isConnected||(T("",r.panelWrapper),delete le[n])})}setInterval(()=>he(),50);var ye=!1;function me(){var t=function(){var t=document.activeElement;return t&&["input","select","textarea"].indexOf(t.tagName.toLowerCase())>=0?t:null}();return t&&!Object.values(le).some(e=>e.isActive&&e.panelWrapper.contains(t))?t:void 0}document.addEventListener("focusin",()=>!ye&&me()&&ve()),document.addEventListener("focusout",()=>!ye&&!me()&&de());var ge={control:()=>{var t=se(),e=me();if(t)if(e)e.blur(),de();else{var n=document.querySelector(Ie);n&&!n.disabled&&(ve(),n.focus())}else{var r=_e();r.length>0&&(e&&e.blur(),pe(r[0]))}},escape:()=>{var t=se();if(t){var e=document.querySelector(Ie);pe(t.ttsType),e&&e.focus()}},tab:()=>{var t=_e();if(t.length>1){var e=Object.values(le).find(t=>t.isActive&&t.isFocused);if(e){var n=(t.indexOf(e.ttsType)+1)%t.length;pe(t[n]),ye=!0,e.toggleButton.focus(),e.toggleButton.blur(),ye=!1}}}},be=new Set,ke=null;document.addEventListener("keydown",t=>{13===t.keyCode&&""===t.key||(ke=0===be.size?t.code:null,be.add(t.code))}),document.addEventListener("keyup",t=>{if(t.code===ke){var e=t.key.toLowerCase();ge[e]&&(O(t),ge[e](t))}be.delete(t.code),ke=null}),window.addEventListener("blur",()=>{be.clear(),ke=null});var we="challenge-form",Se="playback-form",Ee="playback-buttons-wrapper",Ce="playback-button-wrapper",xe="playback-button",Ne="slow-playback-button",Ae="".concat("_duo-ttsc_","with-active-controls"),Le={[we]:{[M]:I.map(t=>'[data-test*="challenge-'.concat(t,'"] > *:first-child')),cartoon:I.map(t=>'[data-test*="challenge-'.concat(t,'"] > *:first-child'))},[Se]:{[M]:"._3msZN",cartoon:".esH1e"},[Ee]:{[M]:"._2NEKS:first-child ._3hbUp",cartoon:"._2NEKS:first-child ._3D7BY"},[Ce]:{[M]:"._3hUV6",cartoon:"._3hUV6"},[xe]:{[M]:"._2dIjg",cartoon:"._1kiAo"},[Ne]:{[M]:".gJtFB",cartoon:"._1ySpy"}},Te=["".concat("_duo-ttsc_","control-form"),"RFxAM"],He='[data-test="hint-sentence"]',Ie=['input[data-test="challenge-text-input"]','textarea[data-test="challenge-translate-input"]'].join(", ")}();
