import{r as t}from"./react-vendor-BHWD85mu.js";let e,a,r,o={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,s=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,l=(t,e)=>{let a="",r="",o="";for(let i in t){let s=t[i];"@"==i[0]?"i"==i[1]?a=i+" "+s+";":r+="f"==i[1]?l(s,i):i+"{"+l(s,"k"==i[1]?"":e)+"}":"object"==typeof s?r+=l(s,e?e.replace(/([^,])+/g,t=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,e=>/&/.test(e)?e.replace(/&/g,t):t?t+" "+e:e)):i):null!=s&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=l.p?l.p(i,s):i+":"+s+";")}return a+(e&&o?e+"{"+o+"}":o)+r},d={},c=t=>{if("object"==typeof t){let e="";for(let a in t)e+=a+c(t[a]);return e}return t};function p(t){let e=this||{},a=t.call?t(e.p):t;return((t,e,a,r,o)=>{let p=c(t),m=d[p]||(d[p]=(t=>{let e=0,a=11;for(;e<t.length;)a=101*a+t.charCodeAt(e++)>>>0;return"go"+a})(p));if(!d[m]){let e=p!==t?t:(t=>{let e,a,r=[{}];for(;e=i.exec(t.replace(s,""));)e[4]?r.shift():e[3]?(a=e[3].replace(n," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][e[1]]=e[2].replace(n," ").trim();return r[0]})(t);d[m]=l(o?{["@keyframes "+m]:e}:e,a?"":"."+m)}let u=a&&d.g?d.g:null;return a&&(d.g=d[m]),f=d[m],g=e,y=r,(b=u)?g.data=g.data.replace(b,f):-1===g.data.indexOf(f)&&(g.data=y?f+g.data:g.data+f),m;var f,g,y,b})(a.unshift?a.raw?((t,e,a)=>t.reduce((t,r,o)=>{let i=e[o];if(i&&i.call){let t=i(a),e=t&&t.props&&t.props.className||/^go/.test(t)&&t;i=e?"."+e:t&&"object"==typeof t?t.props?"":l(t,""):!1===t?"":t}return t+r+(null==i?"":i)},""))(a,[].slice.call(arguments,1),e.p):a.reduce((t,a)=>Object.assign(t,a&&a.call?a(e.p):a),{}):a,(t=>{if("object"==typeof window){let e=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return e.nonce=window.__nonce__,e.parentNode||(t||document.head).appendChild(e),e.firstChild}return t||o})(e.target),e.g,e.o,e.k)}p.bind({g:1});let m=p.bind({k:1});function u(t,o){let i=this||{};return function(){let o=arguments;return function s(n,l){let d=Object.assign({},n),c=d.className||s.className;i.p=Object.assign({theme:a&&a()},d),i.o=/ *go\d+/.test(c),d.className=p.apply(i,o)+(c?" "+c:"");let m=t;return t[0]&&(m=d.as||t,delete d.as),r&&m[0]&&r(d),e(m,d)}}}var f=(t,e)=>(t=>"function"==typeof t)(t)?t(e):t,g=(()=>{let t=0;return()=>(++t).toString()})(),y=(()=>{let t;return()=>{if(void 0===t&&typeof window<"u"){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t}})(),b="default",h=(t,e)=>{let{toastLimit:a}=t.settings;switch(e.type){case 0:return{...t,toasts:[e.toast,...t.toasts].slice(0,a)};case 1:return{...t,toasts:t.toasts.map(t=>t.id===e.toast.id?{...t,...e.toast}:t)};case 2:let{toast:r}=e;return h(t,{type:t.toasts.find(t=>t.id===r.id)?1:0,toast:r});case 3:let{toastId:o}=e;return{...t,toasts:t.toasts.map(t=>t.id===o||void 0===o?{...t,dismissed:!0,visible:!1}:t)};case 4:return void 0===e.toastId?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(t=>t.id!==e.toastId)};case 5:return{...t,pausedAt:e.time};case 6:let i=e.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(t=>({...t,pauseDuration:t.pauseDuration+i}))}}},x=[],v={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},w={},$=(t,e=b)=>{w[e]=h(w[e]||v,t),x.forEach(([t,a])=>{t===e&&a(w[e])})},E=t=>Object.keys(w).forEach(e=>$(t,e)),j=(t=b)=>e=>{$(e,t)},k=t=>(e,a)=>{let r=((t,e="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:e,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...a,id:(null==a?void 0:a.id)||g()}))(e,t,a);return j(r.toasterId||(t=>Object.keys(w).find(e=>w[e].toasts.some(e=>e.id===t)))(r.id))({type:2,toast:r}),r.id},z=(t,e)=>k("blank")(t,e);z.error=k("error"),z.success=k("success"),z.loading=k("loading"),z.custom=k("custom"),z.dismiss=(t,e)=>{let a={type:3,toastId:t};e?j(e)(a):E(a)},z.dismissAll=t=>z.dismiss(void 0,t),z.remove=(t,e)=>{let a={type:4,toastId:t};e?j(e)(a):E(a)},z.removeAll=t=>z.remove(void 0,t),z.promise=(t,e,a)=>{let r=z.loading(e.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof t&&(t=t()),t.then(t=>{let o=e.success?f(e.success,t):void 0;return o?z.success(o,{id:r,...a,...null==a?void 0:a.success}):z.dismiss(r),t}).catch(t=>{let o=e.error?f(e.error,t):void 0;o?z.error(o,{id:r,...a,...null==a?void 0:a.error}):z.dismiss(r)}),t};var A,N,O,_,I=m`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,F=m`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,C=m`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,D=u("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${F} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${C} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,L=m`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,S=u("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${L} 1s linear infinite;
`,M=m`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,P=m`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,T=u("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${P} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,q=u("div")`
  position: absolute;
`,H=u("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Z=m`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=u("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Z} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,G=({toast:e})=>{let{icon:a,type:r,iconTheme:o}=e;return void 0!==a?"string"==typeof a?t.createElement(B,null,a):a:"blank"===r?null:t.createElement(H,null,t.createElement(S,{...o}),"loading"!==r&&t.createElement(q,null,"error"===r?t.createElement(D,{...o}):t.createElement(T,{...o})))},J=t=>`\n0% {transform: translate3d(0,${-200*t}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,K=t=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*t}%,-1px) scale(.6); opacity:0;}\n`,Q=u("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,R=u("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;t.memo(({toast:e,position:a,style:r,children:o})=>{let i=e.height?((t,e)=>{let a=t.includes("top")?1:-1,[r,o]=y()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[J(a),K(a)];return{animation:e?`${m(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${m(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||a||"top-center",e.visible):{opacity:0},s=t.createElement(G,{toast:e}),n=t.createElement(R,{...e.ariaProps},f(e.message,e));return t.createElement(Q,{className:e.className,style:{...i,...r,...e.style}},"function"==typeof o?o({icon:s,message:n}):t.createElement(t.Fragment,null,s,n))}),A=t.createElement,l.p=N,e=A,a=O,r=_,p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var U=z;export{U as z};
