function t(t,e,i,s){var n,r=arguments.length,o=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,v=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&d(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),n=e.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=s;const r=n.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const r=this.constructor;if(!1===s&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??$)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,m?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,x=t=>t,S=A.trustedTypes,k=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+M,N=`<${C}>`,L=document,T=()=>L.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,I="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,R=/>/g,H=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,B=/"/g,j=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),G=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),V=new WeakMap,K=L.createTreeWalker(L,129);function q(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}class W{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[l,d]=((t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=P;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===P?"!--"===l[1]?o=O:void 0!==l[1]?o=R:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=n??P,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?H:'"'===l[3]?B:z):o===B||o===z?o=H:o===O||o===R?o=P:(o=H,n=void 0);const h=o===H&&t[e+1].startsWith("/>")?" ":"";r+=o===P?i+N:d>=0?(s.push(a),i.slice(0,d)+E+i.slice(d)+M+h):i+M+(-2===d?e:h)}return[q(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]})(t,e);if(this.el=W.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=K.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(E)){const e=d[r++],i=s.getAttribute(t).split(M),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?tt:"?"===o[1]?et:"@"===o[1]?it:Q}),s.removeAttribute(t)}else t.startsWith(M)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(M),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],T()),K.nextNode(),a.push({type:2,index:++n});s.append(t[e],T())}}}else if(8===s.nodeType)if(s.data===C)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(M,t+1));)a.push({type:7,index:n}),t+=M.length-1}n++}}static createElement(t,e){const i=L.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,s){if(e===G)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=D(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=Y(t,n._$AS(t,e.values),n,s)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??L).importNode(e,!0);K.currentNode=s;let n=K.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new J(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=i[++o]}r!==a?.index&&(n=K.nextNode(),r++)}return K.currentNode=L,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class J{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),D(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=W.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new X(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new W(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new J(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=Y(this,t,e,0),r=!D(t)||t!==this._$AH&&t!==G,r&&(this._$AH=t);else{const s=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=Y(this,s[i+o],e,o),a===G&&(a=this._$AH[o]),r||=!D(a)||a!==this._$AH[o],a===Z?t=Z:t!==Z&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class et extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class it extends Q{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=Y(this,t,e,0)??Z)===G)return;const i=this._$AH,s=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const nt={I:J},rt=A.litHtmlPolyfillSupport;rt?.(W,J),(A.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;let at=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new J(e.insertBefore(T(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const lt=ot.litElementPolyfillSupport;lt?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ct={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},ht=(t=ct,e,i)=>{const{kind:s,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,n,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];e.call(this,i),this.requestUpdate(s,n,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ut(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function pt(t){return ut({...t,state:!0,attribute:!1})}const _t="dectyr_rx5",ft="/dectyr_rx5_static",gt=`${ft}/brand/icon.png`,mt=`${ft}/dectyr-logo.png`,vt=`${ft}/dectyr-logo.svg`,yt=2,$t=t=>(...e)=>({_$litDirective$:t,values:e});let bt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const{I:wt}=nt,At=t=>t,xt=()=>document.createComment(""),St=(t,e,i)=>{const s=t._$AA.parentNode,n=void 0===e?t._$AB:e._$AA;if(void 0===i){const e=s.insertBefore(xt(),n),r=s.insertBefore(xt(),n);i=new wt(e,r,t,t.options)}else{const e=i._$AB.nextSibling,r=i._$AM,o=r!==t;if(o){let e;i._$AQ?.(t),i._$AM=t,void 0!==i._$AP&&(e=t._$AU)!==r._$AU&&i._$AP(e)}if(e!==n||o){let t=i._$AA;for(;t!==e;){const e=At(t).nextSibling;At(s).insertBefore(t,n),t=e}}}return i},kt=(t,e,i=t)=>(t._$AI(e,i),t),Et={},Mt=(t,e=Et)=>t._$AH=e,Ct=t=>{t._$AR(),t._$AA.remove()},Nt=(t,e,i)=>{const s=new Map;for(let n=e;n<=i;n++)s.set(t[n],n);return s},Lt=$t(class extends bt{constructor(t){if(super(t),t.type!==yt)throw Error("repeat() can only be used in text expressions")}dt(t,e,i){let s;void 0===i?i=e:void 0!==e&&(s=e);const n=[],r=[];let o=0;for(const e of t)n[o]=s?s(e,o):o,r[o]=i(e,o),o++;return{values:r,keys:n}}render(t,e,i){return this.dt(t,e,i).values}update(t,[e,i,s]){const n=(t=>t._$AH)(t),{values:r,keys:o}=this.dt(e,i,s);if(!Array.isArray(n))return this.ut=o,r;const a=this.ut??=[],l=[];let d,c,h=0,u=n.length-1,p=0,_=r.length-1;for(;h<=u&&p<=_;)if(null===n[h])h++;else if(null===n[u])u--;else if(a[h]===o[p])l[p]=kt(n[h],r[p]),h++,p++;else if(a[u]===o[_])l[_]=kt(n[u],r[_]),u--,_--;else if(a[h]===o[_])l[_]=kt(n[h],r[_]),St(t,l[_+1],n[h]),h++,_--;else if(a[u]===o[p])l[p]=kt(n[u],r[p]),St(t,n[h],n[u]),u--,p++;else if(void 0===d&&(d=Nt(o,p,_),c=Nt(a,h,u)),d.has(a[h]))if(d.has(a[u])){const e=c.get(o[p]),i=void 0!==e?n[e]:null;if(null===i){const e=St(t,n[h]);kt(e,r[p]),l[p]=e}else l[p]=kt(i,r[p]),St(t,n[h],i),n[e]=null;p++}else Ct(n[u]),u--;else Ct(n[h]),h++;for(;p<=_;){const e=St(t,l[_+1]);kt(e,r[p]),l[p++]=e}for(;h<=u;){const t=n[h++];null!==t&&Ct(t)}return this.ut=o,Mt(t,l),G}}),Tt=o`
  :host {
    --dectyr-radius: 12px;
    --dectyr-muted: var(--secondary-text-color);
    --dectyr-border-subtle: 1px solid var(--divider-color);
    --dectyr-live-border: 1px solid var(--success-color, #4caf50);
    --dectyr-offline-border: 1px solid var(--disabled-color, #9e9e9e);
    --dectyr-row-bg: var(--secondary-background-color);
  }
`;const Dt=o`
  .rssi-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .rssi-good {
    background: var(--success-color, #4caf50);
    color: white;
  }
  .rssi-medium {
    background: var(--warning-color, #ff9800);
    color: white;
  }
  .rssi-poor {
    background: var(--error-color, #f44336);
    color: white;
  }
  .rssi-unknown {
    background: var(--disabled-color, #999);
    color: white;
  }
`;const Ut={FRA:"FR",USA:"US",GBR:"GB",DEU:"DE",ITA:"IT",ESP:"ES",NLD:"NL",BEL:"BE",UKR:"UA",POL:"PL",CHE:"CH",AUT:"AT",CAN:"CA",AUS:"AU",JPN:"JP",CHN:"CN",IND:"IN",BRA:"BR",MEX:"MX",SWE:"SE",NOR:"NO",DNK:"DK",FIN:"FI",IRL:"IE",PRT:"PT",GRC:"GR",CZE:"CZ",SVK:"SK",HUN:"HU",ROU:"RO",BGR:"BG",HRV:"HR",SVN:"SI",LUX:"LU",MLT:"MT",CYP:"CY",EST:"EE",LVA:"LV",LTU:"LT",ISL:"IS",LIE:"LI",MCO:"MC",AND:"AD",SMR:"SM",VAT:"VA",RUS:"RU",TUR:"TR",ISR:"IL",ARE:"AE",SAU:"SA",ZAF:"ZA",EGY:"EG",MAR:"MA",DZA:"DZ",TUN:"TN",NGA:"NG",KEN:"KE",ARG:"AR",CHL:"CL",COL:"CO",PER:"PE",NZL:"NZ",KOR:"KR",TWN:"TW",SGP:"SG",MYS:"MY",THA:"TH",VNM:"VN",IDN:"ID",PHL:"PH"};let It=class extends at{constructor(){super(...arguments),this.isNew=!1,this.compact=!1}render(){const t=this.drone.is_live,e=this.isNew?" is-new":"";return F`
      <div
        class="drone-card ${t?"live":"offline"}${e}"
        @click=${this._onClick}
        role="button"
        tabindex="0"
        @keydown=${this._onKeydown}
      >
        <div class="header">
          <ha-icon icon=${this._iconForManufacturer()} class="air-icon"></ha-icon>
          <div class="title-block">
            <div class="title">${this.drone.display_name}</div>
            <div class="subtitle">${this.drone.drone_id}</div>
          </div>
          ${t?this._renderRssiBadge():this._renderOfflineBadge()}
        </div>
        ${t?this._renderTelemetryLine():""}
        ${this._renderOperatorLine()}
      </div>
    `}_onKeydown(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._onClick())}_onClick(){this.dispatchEvent(new CustomEvent("dectyr-drone-clicked",{detail:{drone_id:this.drone.drone_id},bubbles:!0,composed:!0}))}_iconForManufacturer(){const t=(this.drone.manufacturer||"").toLowerCase();return t.includes("dji")?"mdi:dji":t.includes("parrot")?"mdi:parrot":"mdi:quadcopter"}_renderRssiBadge(){const t=null===(e=this.drone.rssi)||Number.isNaN(e)?"rssi-unknown":e>=-60?"rssi-good":e>=-80?"rssi-medium":"rssi-poor";var e;const i=function(t){return null===t||Number.isNaN(t)?"—":`${Math.round(t)}`}(this.drone.rssi);return F`
      <span class="rssi-badge ${t}"><ha-icon icon="mdi:signal"></ha-icon> ${i}</span>
    `}_renderOfflineBadge(){return F`
      <span class="rssi-badge rssi-unknown">${function(t){if(!t||Number.isNaN(t.getTime()))return"offline";const e=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(e<60)return`offline · ${e}s ago`;const i=Math.floor(e/60);return i<60?`offline · ${i}min ago`:`offline · ${Math.floor(i/60)}h ago`}(this.drone.last_seen)}</span>
    `}_renderTelemetryLine(){const t=[],e=this.drone.altitude_agl??this.drone.altitude_msl;var i,s,n;return null===e||Number.isNaN(e)||t.push(null===(i=e)||Number.isNaN(i)?"—":`${i.toFixed(0)}m`),null===this.drone.speed_horizontal||Number.isNaN(this.drone.speed_horizontal)||t.push(null===(s=this.drone.speed_horizontal)||Number.isNaN(s)?"—":`${s.toFixed(1)} m/s`),null===this.drone.direction||Number.isNaN(this.drone.direction)||t.push(null===(n=this.drone.direction)||Number.isNaN(n)?"—":`${n.toFixed(0)}°`),null===this.drone.distance_to_scanner||Number.isNaN(this.drone.distance_to_scanner)||t.push(`${function(t){return null===t||Number.isNaN(t)?"—":t<1e3?`${t.toFixed(0)}m`:`${(t/1e3).toFixed(1)}km`}(this.drone.distance_to_scanner)} to scan`),0===t.length?F``:F`
      <div class="telemetry-line">
        <ha-icon icon="mdi:trending-up" class="telemetry-icon"></ha-icon>
        <span>${t.join(" · ")}</span>
      </div>
    `}_renderOperatorLine(){if(!this.drone.is_live){const t=this.drone.last_seen,e=t?`Last seen ${function(t){const e=new Date,i=Math.floor((e.getTime()-t.getTime())/1e3);if(i<60)return"just now";if(i<3600){const t=Math.floor(i/60);return`${t} minute${1!==t?"s":""} ago`}if(i<86400){const t=Math.floor(i/3600);return`${t} hour${1!==t?"s":""} ago`}const s=Math.floor(i/86400);return`${s} day${1!==s?"s":""} ago`}(t)}`:"Offline";return F`
        <div class="operator-line offline-line">
          <ha-icon icon="mdi:account-clock" class="op-icon"></ha-icon>
          <span>${e}</span>
        </div>
      `}const t=this.drone.operator_id,e=this.drone.operator_country,i=e?function(t){if(!t)return"";const e=t.toUpperCase().trim(),i=Ut[e];if(!i||2!==i.length)return t;const s=127462,n="A".charCodeAt(0);return String.fromCodePoint(s+i.charCodeAt(0)-n,s+i.charCodeAt(1)-n)}(e):"";return F`
      <div class="operator-line">
        <ha-icon icon="mdi:account" class="op-icon"></ha-icon>
        ${t?F`<span class="op">${t}</span>`:""}
        ${e?F`<span class="flag" title=${e}>${i} ${e}</span>`:""}
        ${this._renderEuClassification()}
        ${this.drone.multi_source?F`<span class="hint" title="Multi-source">· multi</span>`:""}
      </div>
    `}_renderEuClassification(){const t=(e=this.drone.category_eu)?e.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):null;var e;const i=this.drone.class_eu;if(!t&&!i)return F``;const s=i&&i.length>0?i.charAt(0).toUpperCase()+i.slice(1):"—";return F`<span class="eu">${s} / ${t??"—"}</span>`}static get styles(){return[Tt,Dt,o`
        :host {
          display: block;
        }
        .drone-card {
          border-radius: var(--dectyr-radius);
          padding: 12px 14px;
          margin-bottom: 8px;
          background: var(--dectyr-row-bg);
          border: var(--dectyr-border-subtle);
          cursor: pointer;
          transition:
            opacity 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }
        .drone-card.live {
          border: var(--dectyr-live-border);
        }
        .drone-card.offline {
          border: var(--dectyr-offline-border);
          opacity: 0.55;
        }
        .drone-card.offline .rssi-badge {
          filter: grayscale(1);
        }
        .drone-card.is-new {
          animation: pulse-new 0.7s ease-out 3;
        }
        @keyframes pulse-new {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.55);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
          }
        }
        .header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .air-icon {
          --mdc-icon-size: 28px;
          color: var(--primary-color);
          margin-top: 2px;
        }
        .title-block {
          flex: 1;
          min-width: 0;
        }
        .title {
          font-weight: 600;
          font-size: 1.05em;
          line-height: 1.25;
        }
        .subtitle {
          font-size: 0.8em;
          color: var(--dectyr-muted);
          font-family: var(--code-font-family, monospace);
          word-break: break-all;
        }
        .telemetry-line {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--divider-color);
          font-size: 0.9em;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .telemetry-icon {
          --mdc-icon-size: 18px;
          flex-shrink: 0;
          opacity: 0.85;
        }
        .operator-line {
          margin-top: 8px;
          font-size: 0.88em;
          color: var(--dectyr-muted);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .op-icon {
          --mdc-icon-size: 18px;
          flex-shrink: 0;
        }
        .offline-line {
          color: var(--primary-text-color);
        }
        .flag {
          font-size: 1.05em;
        }
        .eu {
          font-weight: 500;
        }
        .hint {
          font-size: 0.85em;
          opacity: 0.85;
        }
      `]}};function Pt(t,e){return t.is_live!==e.is_live?t.is_live?-1:1:t.drone_id.localeCompare(e.drone_id,void 0,{sensitivity:"base",numeric:!0})}t([ut({type:Object})],It.prototype,"drone",void 0),t([ut({type:Boolean,reflect:!0})],It.prototype,"isNew",void 0),t([ut({type:Boolean})],It.prototype,"compact",void 0),It=t([dt("dectyr-drone-card")],It);let Ot=class extends at{constructor(){super(...arguments),this.drones=[],this.newDroneIds=new Set}render(){const t=[...this.drones].sort(Pt);return F`
      <div class="list">
        ${Lt(t,t=>t.drone_id,t=>F`
            <dectyr-drone-card
              .drone=${t}
              .isNew=${this.newDroneIds.has(t.drone_id)}
            ></dectyr-drone-card>
          `)}
      </div>
    `}static get styles(){return o`
      :host {
        display: block;
      }
      .list {
        margin-top: 4px;
      }
    `}};t([ut({type:Array})],Ot.prototype,"drones",void 0),t([ut({attribute:!1})],Ot.prototype,"newDroneIds",void 0),Ot=t([dt("dectyr-drone-list")],Ot);const Rt=(t,e)=>{const i=t._$AN;if(void 0===i)return!1;for(const t of i)t._$AO?.(e,!1),Rt(t,e);return!0},Ht=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===i?.size)},zt=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),Ft(e)}};function Bt(t){void 0!==this._$AN?(Ht(this),this._$AM=t,zt(this)):this._$AM=t}function jt(t,e=!1,i=0){const s=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)Rt(s[t],!1),Ht(s[t]);else null!=s&&(Rt(s,!1),Ht(s));else Rt(this,t)}const Ft=t=>{t.type==yt&&(t._$AP??=jt,t._$AQ??=Bt)};class Gt extends bt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),zt(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(Rt(this,t),Ht(this))}setValue(t){if((t=>void 0===t.strings)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}class Zt{}const Vt=new WeakMap,Kt=$t(class extends Gt{render(t){return Z}update(t,[e]){const i=e!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),Z}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){const e=this.ht??globalThis;let i=Vt.get(e);void 0===i&&(i=new WeakMap,Vt.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?Vt.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});let qt=!1,Wt=null;async function Yt(){const t=window;return qt&&t.L?t.L:Wt||(Wt=new Promise((e,i)=>{if(t.L)return qt=!0,void e(t.L);!function(t){const e=`dectyr-leaflet-css-${t.replace(/[^a-z0-9]+/gi,"-")}`;if(document.getElementById(e))return;const i=document.createElement("link");i.id=e,i.rel="stylesheet",i.href=t,document.head.appendChild(i)}("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",s.async=!0,s.dataset.dectyrLeaflet="1",s.onload=()=>{const t=window.L;t?(qt=!0,e(t)):i(new Error("Leaflet script loaded but window.L is missing"))},s.onerror=()=>i(new Error("Failed to load Leaflet from CDN")),document.head.appendChild(s)}),Wt)}class Xt{constructor(){this._trails=new Map,this._maxAgeMs=18e5,this._maxPoints=30}setMaxAgeMinutes(t){this._maxAgeMs=60*Math.max(1,t)*1e3}setMaxPoints(t){this._maxPoints=Math.max(2,Math.min(200,t))}add(t,e,i,s=new Date){if(!Number.isFinite(e)||!Number.isFinite(i))return;let n=this._trails.get(t);n||(n=[],this._trails.set(t,n));const r=n[n.length-1];if(r&&r.lat===e&&r.lng===i)return;n.push({lat:e,lng:i,timestamp:s});const o=Date.now()-this._maxAgeMs;for(;n.length>0&&n[0].timestamp.getTime()<o;)n.shift();for(;n.length>this._maxPoints;)n.shift()}get(t){return this._trails.get(t)??[]}getLatLngs(t){return this.get(t).map(t=>[t.lat,t.lng])}}function Jt(t){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">\n    <circle cx="12" cy="12" r="10" fill="${t}" opacity="0.95"/>\n    <path d="M12 6 L8 10 L8 14 L12 18 L16 14 L16 10 Z" fill="white"/>\n  </svg>`}function Qt(t){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">\n    <circle cx="12" cy="12" r="10" fill="${t?"#4caf50":"#9e9e9e"}" opacity="0.95"/>\n    <path d="M12 4 L12 8 M8 8 A 6 6 0 0 1 16 8" stroke="white" stroke-width="2" fill="none"/>\n  </svg>`}function te(t,e,i){const s=t.divIcon,n=null===(r=e.rssi)||Number.isNaN(r)?"#9e9e9e":r>=-60?"#4caf50":r>=-80?"#ff9800":"#f44336";var r;const o=["dectyr-map-icon","dectyr-drone-marker",e.is_live?"dectyr-drone-live":"dectyr-drone-offline",i?"dectyr-drone-highlight":""].filter(Boolean).join(" ");return s({html:Jt(n),className:o,iconSize:[32,32],iconAnchor:[16,16]})}function ee(t,e){return(0,t.divIcon)({html:Qt(e),className:"dectyr-map-icon dectyr-scanner-marker",iconSize:[28,28],iconAnchor:[14,14]})}function ie(t){return(0,t.divIcon)({html:(e="#2196f3",`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">\n    <circle cx="12" cy="12" r="10" fill="${e}" opacity="0.95"/>\n    <circle cx="12" cy="9" r="3" fill="white"/>\n    <path d="M5 21 a7 7 0 0 1 14 0 z" fill="white"/>\n  </svg>`),className:"dectyr-map-icon dectyr-operator-marker",iconSize:[24,24],iconAnchor:[12,12]});var e}var se;let ne=se=class extends at{constructor(){super(...arguments),this.drones=[],this.scanners=[],this.showTrails=!0,this.trailMinutes=30,this._mapLoading=!0,this._mapContainerRef=new Zt,this._trailStore=new Xt,this._droneMarkers=new Map,this._scannerMarkers=new Map,this._operatorMarkers=new Map,this._trailLines=new Map,this._mapInitLock=!1}createRenderRoot(){return this}disconnectedCallback(){super.disconnectedCallback(),this._destroyMap()}willUpdate(t){super.willUpdate(t),t.has("trailMinutes")&&this._trailStore.setMaxAgeMinutes(this.trailMinutes)}updated(t){super.updated(t);const e=this._mapContainerRef.value;e&&!this._map&&this._initMap(e),this._map&&this._L&&(t.has("drones")&&(this._ingestTrails(),this._updateDroneMarkers(),this._updateOperatorMarkers(),this._updateTrails()),t.has("scanners")&&this._updateScannerMarkers(),t.has("highlightedDroneId")&&this._applyHighlight(),t.has("showTrails")&&this._updateTrails())}_destroyMap(){const t=this._map;t?.remove?.(),this._map=void 0,this._L=void 0,this._droneMarkers.clear(),this._scannerMarkers.clear(),this._operatorMarkers.clear(),this._trailLines.clear(),this._homeCircle=void 0,this._mapLoading=!0,this._mapInitLock=!1}async _initMap(t){if(!this._map&&!this._mapInitLock){this._mapInitLock=!0;try{const e=await Yt();this._L=e;const i=this.homeZone?[this.homeZone.latitude,this.homeZone.longitude]:se.FALLBACK,s=e.map,n=e.tileLayer,r=e.circle;if(this._map=s(t,{center:i,zoom:15,zoomControl:!0}),n("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(this._map),this.homeZone){const t=[this.homeZone.latitude,this.homeZone.longitude];this._homeCircle=r(t,{radius:100,color:"var(--primary-color, #03a9f4)",fillOpacity:.12,weight:2}).addTo(this._map).bindPopup("Home")}this._trailStore.setMaxAgeMinutes(this.trailMinutes),this._ingestTrails(),this._updateDroneMarkers(),this._updateScannerMarkers(),this._updateOperatorMarkers(),this._updateTrails(),this._mapLoading=!1,this.requestUpdate(),requestAnimationFrame(()=>{this._map?.invalidateSize?.()})}catch(t){console.warn("Dectyr live map: Leaflet init failed",t),this._mapLoading=!1,this.requestUpdate()}finally{this._mapInitLock=!1}}}_ingestTrails(){const t=new Date;for(const e of this.drones)null!=e.latitude&&null!=e.longitude&&this._trailStore.add(e.drone_id,e.latitude,e.longitude,e.last_seen??t)}_updateDroneMarkers(){const t=this._L,e=this._map;if(!t||!e)return;const i=t.marker,s=new Set,n=this.highlightedDroneId;for(const r of this.drones){if(null==r.latitude||null==r.longitude)continue;s.add(r.drone_id);const o=[r.latitude,r.longitude],a=this._dronePopupHtml(r);let l=this._droneMarkers.get(r.drone_id);l?(l.setLatLng(o),l.setIcon?.(te(t,r,r.drone_id===n)),l.bindPopup(a)):(l=i(o,{icon:te(t,r,r.drone_id===n)}).addTo(e).bindPopup(a),this._droneMarkers.set(r.drone_id,l))}for(const[t,e]of this._droneMarkers)s.has(t)||(e.remove(),this._droneMarkers.delete(t))}_dronePopupHtml(t){const e=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");return`<strong>${e(t.display_name)}</strong><br/><code>${e(t.drone_id)}</code>`}_updateScannerMarkers(){const t=this._L,e=this._map;if(!t||!e)return;const i=t.marker,s=new Set;for(const n of this.scanners){if(null==n.latitude||null==n.longitude)continue;s.add(n.scanner_id);const r=[n.latitude,n.longitude],o=`<strong>${this._esc(n.name)}</strong><br/>Scanner · ${n.is_online?"online":"offline"}`;let a=this._scannerMarkers.get(n.scanner_id);a?(a.setLatLng(r),a.setIcon?.(ee(t,n.is_online)),a.bindPopup(o)):(a=i(r,{icon:ee(t,n.is_online)}).addTo(e).bindPopup(o),this._scannerMarkers.set(n.scanner_id,a))}for(const[t,e]of this._scannerMarkers)s.has(t)||(e.remove(),this._scannerMarkers.delete(t))}_esc(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}_updateOperatorMarkers(){const t=this._L,e=this._map;if(!t||!e)return;const i=t.marker,s=new Set;for(const n of this.drones){if(null==n.operator_latitude||null==n.operator_longitude)continue;const r=`${n.drone_id}-op`;s.add(r);const o=[n.operator_latitude,n.operator_longitude],a=`<strong>${n.operator_id?this._esc(n.operator_id):"Operator"}</strong><br/>${this._esc(n.display_name)}`;let l=this._operatorMarkers.get(r);l?(l.setLatLng(o),l.bindPopup(a)):(l=i(o,{icon:ie(t)}).addTo(e).bindPopup(a),this._operatorMarkers.set(r,l))}for(const[t,e]of this._operatorMarkers)s.has(t)||(e.remove(),this._operatorMarkers.delete(t))}_updateTrails(){const t=this._L,e=this._map;if(!t||!e)return;const i=t.polyline;if(!this.showTrails){for(const[,t]of this._trailLines)t.remove?.();return void this._trailLines.clear()}const s=new Set;for(const t of this.drones){const n=this._trailStore.getLatLngs(t.drone_id);if(n.length<2){const e=this._trailLines.get(t.drone_id);e?.remove?.(),this._trailLines.delete(t.drone_id);continue}s.add(t.drone_id);const r=t.is_live?"#1976d2":"#78909c",o=this._trailLines.get(t.drone_id);if(o?.setLatLngs)o.setLatLngs(n);else{o?.remove?.();const s=i(n,{color:r,weight:3,opacity:.75,dashArray:t.is_live?void 0:"6 4"}).addTo(e);this._trailLines.set(t.drone_id,s)}}for(const[t,e]of this._trailLines)s.has(t)||(e.remove?.(),this._trailLines.delete(t))}_applyHighlight(){const t=this._map;if(!t)return;this._updateDroneMarkers();const e=this.highlightedDroneId;if(!e)return;const i=this.drones.find(t=>t.drone_id===e);if(!i||null==i.latitude||null==i.longitude)return;const s=this._droneMarkers.get(e);if(!s)return;const n=t.getZoom,r=Math.max("function"==typeof n?n.call(t):15,16);t.setView?.([i.latitude,i.longitude],r,{animate:!0,duration:.35}),s.openPopup?.()}_resetView(){const t=this._map;if(!t?.fitBounds)return;const e=this._L;if(!e.latLngBounds||!e.latLng)return;const i=[];this.homeZone&&i.push(e.latLng(this.homeZone.latitude,this.homeZone.longitude));for(const t of this.drones)null!=t.latitude&&null!=t.longitude&&i.push(e.latLng(t.latitude,t.longitude)),null!=t.operator_latitude&&null!=t.operator_longitude&&i.push(e.latLng(t.operator_latitude,t.operator_longitude));for(const t of this.scanners)null!=t.latitude&&null!=t.longitude&&i.push(e.latLng(t.latitude,t.longitude));if(0===i.length){const e=this.homeZone?[this.homeZone.latitude,this.homeZone.longitude]:se.FALLBACK;return void t.setView?.(e,15)}if(1===i.length){const e=i[0];return void t.setView?.([e.lat,e.lng],15)}const s=e.latLngBounds(i);t.fitBounds(s,{padding:[28,28],maxZoom:17})}_toggleTrails(){this.showTrails=!this.showTrails}render(){return F`
      <div class="dectyr-live-map-host">
        <div class="map-container" part="map-container" ${Kt(this._mapContainerRef)}></div>
        <div class="map-controls">
          <button
            type="button"
            class="map-btn"
            title="Fit home and fleet"
            @click=${()=>this._resetView()}
          >
            <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
          </button>
          <button type="button" class="map-btn" title="Toggle trails" @click=${()=>this._toggleTrails()}>
            <ha-icon
              icon=${this.showTrails?"mdi:vector-polyline":"mdi:vector-polyline-remove"}
            ></ha-icon>
          </button>
        </div>
        ${this._mapLoading?F`<div class="map-loading">Loading map…</div>`:""}
      </div>
    `}static get styles(){return o`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 400px;
      }
      .dectyr-live-map-host {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .map-container {
        width: 100%;
        height: 100%;
        border-radius: var(--dectyr-radius, 8px);
        overflow: hidden;
        z-index: 0;
      }
      .map-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .map-btn {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        color: var(--primary-text-color, #111);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .map-btn:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .map-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
        font-size: 0.9em;
        pointer-events: none;
        border-radius: var(--dectyr-radius, 8px);
      }
      :host .dectyr-drone-highlight .dectyr-map-icon {
        filter: drop-shadow(0 0 6px rgba(255, 193, 7, 0.95));
        transform: scale(1.12);
      }
    `}};ne.FALLBACK=[48.8566,2.3522],t([ut({attribute:!1})],ne.prototype,"hass",void 0),t([ut({attribute:!1})],ne.prototype,"drones",void 0),t([ut({attribute:!1})],ne.prototype,"scanners",void 0),t([ut({attribute:!1})],ne.prototype,"homeZone",void 0),t([ut({attribute:!1})],ne.prototype,"highlightedDroneId",void 0),t([ut({type:Boolean})],ne.prototype,"showTrails",void 0),t([ut({type:Number})],ne.prototype,"trailMinutes",void 0),t([pt()],ne.prototype,"_mapLoading",void 0),ne=se=t([dt("dectyr-live-map")],ne);let re=class extends at{constructor(){super(...arguments),this.label="",this.value=""}render(){return F`
      <div class="tile">
        <span class="value">${this.value}</span>
        <span class="label">${this.label}</span>
      </div>
    `}static get styles(){return o`
      :host {
        display: block;
        flex: 1;
        min-width: 0;
      }
      .tile {
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: var(--dectyr-radius, 12px);
      }
      .value {
        display: block;
        font-size: 2em;
        font-weight: 600;
        color: var(--primary-color);
      }
      .label {
        display: block;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
    `}};t([ut({type:String})],re.prototype,"label",void 0),t([ut({type:String})],re.prototype,"value",void 0),re=t([dt("dectyr-stat-tile")],re);const oe="a",ae="lc",le="lu";function de(t,e){const i=void 0!==e[ae]?new Date(1e3*e[ae]).toISOString():void 0,s=void 0!==e[le]?new Date(1e3*e[le]).toISOString():i??(new Date).toISOString();let n;const r=e.c;return n="string"==typeof r?{id:r,parent_id:null,user_id:null}:r&&"object"==typeof r?{id:r.id??"",parent_id:r.parent_id??null,user_id:r.user_id??null}:{id:"",parent_id:null,user_id:null},{entity_id:t,state:e.s??"unknown",attributes:{...e[oe]??{}},context:n,last_changed:i??s,last_updated:s}}function ce(t){return e=>t.states[e]}function he(t){if(void 0===t||"unknown"===t||"unavailable"===t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function ue(t){return"on"===t}function pe(t){if(!t||"unknown"===t||"unavailable"===t)return null;const e=new Date(t);return Number.isNaN(e.getTime())?null:e}function _e(t){if(!t)return null;const e=new Date(t);return Number.isNaN(e.getTime())?null:e}function fe(t){if(void 0===t)return null;const e=String(t).trim();return e&&"unknown"!==e&&"unavailable"!==e?e:null}function ge(t){if(!t?.length)return null;for(const e of t)if(e[0]===_t&&"string"==typeof e[1]&&e[1].startsWith("drone:"))return e[1].slice(6);return null}function me(t){if(!t?.length)return null;for(const e of t)if(e[0]===_t&&"string"==typeof e[1]&&e[1].length>0&&!e[1].startsWith("drone:"))return e[1];return null}function ve(t,e){const i=new Map;if(!t.entities)return i;for(const[s,n]of Object.entries(t.entities))n.device_id===e&&n.platform===_t&&i.set(s,n.translation_key??null);return i}function ye(t){const e=new Map;let i,s;for(const[n,r]of t)r&&("drone_position"===r?i=n:"operator_position"===r?s=n:e.set(r,n));return{tracker:i,operatorTracker:s,byTk:e}}function $e(t,e){const i=t,s=e??ce(t);if(!i.devices)return[];const n=[];for(const t of Object.values(i.devices)){const e=ge(t.identifiers);if(!e)continue;const r=ve(i,t.id),{tracker:o,operatorTracker:a,byTk:l}=ye(r),d=o?s(o):void 0,c=!!d&&"unavailable"!==d.state&&"unknown"!==d.state;let h=null,u=null;if(d){if(null!=d.attributes.latitude){const t=Number(d.attributes.latitude);Number.isFinite(t)&&(h=t)}if(null!=d.attributes.longitude){const t=Number(d.attributes.longitude);Number.isFinite(t)&&(u=t)}}const p=t=>{const e=l.get(t);if(e)return s(e)?.state},_=l.get("drone_multi_source"),f=_?s(_)?.state:void 0;let g=pe(p("drone_last_seen"));!g&&d&&(g=_e(d.last_updated)??_e(d.last_changed)??null);const m=a?s(a):void 0;let v=null,y=null;if(m){if(null!=m.attributes.latitude){const t=Number(m.attributes.latitude);Number.isFinite(t)&&(v=t)}if(null!=m.attributes.longitude){const t=Number(m.attributes.longitude);Number.isFinite(t)&&(y=t)}}const $=t.manufacturer&&String(t.manufacturer).trim()||(null!=d?.attributes.manufacturer?String(d.attributes.manufacturer):null),b=t.model&&String(t.model).trim()||(null!=d?.attributes.model?String(d.attributes.model):null),w=t.name_by_user&&t.name_by_user.trim()||t.name&&t.name.trim()||[$,b].filter(Boolean).join(" ")||`Drone ${e.slice(-10)}`;n.push({drone_id:e,device_id:t.id,display_name:w,manufacturer:$,model:b,is_live:c,latitude:h,longitude:u,altitude_msl:he(p("drone_altitude_msl")),altitude_agl:he(p("drone_altitude_agl")),speed_horizontal:he(p("drone_speed_horizontal")),speed_vertical:he(p("drone_speed_vertical")),direction:he(p("drone_direction")),rssi:he(p("drone_rssi")),operator_id:fe(p("drone_operator_id")),operator_country:fe(p("drone_operator_country")),operator_latitude:v,operator_longitude:y,category_eu:fe(p("drone_category_eu")),class_eu:fe(p("drone_class_eu")),signal_type:fe(p("drone_signal_type")),broadcast_protocol:fe(p("drone_broadcast_protocol")),multi_source:ue(f),distance_to_scanner:he(p("drone_distance_to_scanner")),last_seen:g})}return n}let be=class extends at{constructor(){super(...arguments),this._hideInactive=!1,this._newDroneIds=new Set,this._headerLogoUrl=gt,this._previousDroneIds=null,this._newDroneClearTimers=new Map,this._entityOverlay={},this._subscribedIdsKey="",this._subscriptionGeneration=0}setConfig(t){if(!t)throw new Error("Invalid configuration");this.config=t}getCardSize(){return 14}disconnectedCallback(){this._disconnectEntitySubscription();for(const t of this._newDroneClearTimers.values())window.clearTimeout(t);this._newDroneClearTimers.clear(),void 0!==this._highlightClearTimer&&(window.clearTimeout(this._highlightClearTimer),this._highlightClearTimer=void 0),super.disconnectedCallback()}willUpdate(t){if(super.willUpdate(t),t.has("hass")&&this.hass){const t=$e(this.hass,t=>this._getMergedState(t));this._detectNewDrones(t)}}updated(t){super.updated(t),t.has("hass")&&this.hass?.connected&&this._syncEntitySubscription()}_getMergedState(t){return this._entityOverlay[t]??this.hass?.states[t]}async _disconnectEntitySubscription(){if(this._unsubEntities){try{await this._unsubEntities()}catch{}this._unsubEntities=void 0}this._entityOverlay={}}async _syncEntitySubscription(){if(!this.hass?.connected)return;const t=++this._subscriptionGeneration,e=function(t){const e=t.entities;if(!e)return[];const i=[];for(const[t,s]of Object.entries(e))s.platform===_t&&i.push(t);return i}(this.hass),i=[...e].sort().join("\n");if((i!==this._subscribedIdsKey||!this._unsubEntities)&&(await this._disconnectEntitySubscription(),t===this._subscriptionGeneration&&(this._subscribedIdsKey=i,0!==e.length)))try{const t=this.hass.connection;this._unsubEntities=await t.subscribeMessage(t=>{"event"===t.type&&t.event&&"object"==typeof t.event&&(!function(t,e){if(e.a)for(const[i,s]of Object.entries(e.a))t[i]=de(i,s);if(e.r)for(const i of e.r)delete t[i];if(e.c)for(const[i,s]of Object.entries(e.c)){let e=t[i];if(!e)continue;e={...e,attributes:{...e.attributes}};const n=s["+"],r=s["-"];if(void 0!==n?.s&&(e.state=n.s),void 0!==n?.[ae]){const t=new Date(1e3*n[ae]).toISOString();e.last_changed=t,e.last_updated=t}else void 0!==n?.[le]&&(e.last_updated=new Date(1e3*n[le]).toISOString());if(void 0!==n?.c){const t=n.c;"string"==typeof t?e.context={...e.context,id:t}:t&&"object"==typeof t&&(e.context={...e.context,...t})}if(n?.[oe]&&Object.assign(e.attributes,n[oe]),r?.[oe])for(const t of r[oe])delete e.attributes[t];t[i]=e}}(this._entityOverlay,t.event),this.requestUpdate())},{type:"subscribe_entities",entity_ids:e})}catch(t){console.warn("Dectyr Surveillance: subscribe_entities failed",t),this._subscribedIdsKey=""}}_detectNewDrones(t){const e=new Set(t.map(t=>t.drone_id));if(null===this._previousDroneIds)return void(this._previousDroneIds=e);let i=!1;for(const t of e)if(!this._previousDroneIds.has(t)){this._newDroneIds=new Set(this._newDroneIds).add(t),i=!0;const e=this._newDroneClearTimers.get(t);void 0!==e&&window.clearTimeout(e);const s=window.setTimeout(()=>{const e=new Set(this._newDroneIds);e.delete(t),this._newDroneIds=e,this._newDroneClearTimers.delete(t),this.requestUpdate()},2e3);this._newDroneClearTimers.set(t,s)}this._previousDroneIds=e,i&&this.requestUpdate()}_onHideInactive(t){const e=t.target;this._hideInactive=Boolean(e.checked)}_onHeaderLogoError(){this._headerLogoUrl===gt?this._headerLogoUrl=mt:this._headerLogoUrl===mt&&(this._headerLogoUrl=vt)}_onDroneClicked(t){const e=t.detail?.drone_id;e&&(void 0!==this._highlightClearTimer&&window.clearTimeout(this._highlightClearTimer),this._highlightedDroneId=e,this._highlightClearTimer=window.setTimeout(()=>{this._highlightedDroneId=void 0,this._highlightClearTimer=void 0,this.requestUpdate()},3e3))}render(){if(!this.hass||!this.config)return F`<ha-card><div class="card-content">Loading…</div></ha-card>`;const t=t=>this._getMergedState(t),e=function(t,e){const i=t,s=e??ce(t);if(!i.devices)return[];const n=[];for(const t of Object.values(i.devices)){const e=me(t.identifiers);if(!e)continue;const r=ve(i,t.id);let o,a,l,d,c=!1,h=null,u=null;const p=[];for(const[t,e]of r){const i=s(t);if(i)if("scanner_position"===e){if("unavailable"!==i.state&&"unknown"!==i.state){if(null!=i.attributes.latitude){const t=Number(i.attributes.latitude);Number.isFinite(t)&&(h=t)}if(null!=i.attributes.longitude){const t=Number(i.attributes.longitude);Number.isFinite(t)&&(u=t)}}}else if("scanner_online"===e)o=t,c=ue(i.state);else if("scanner_cpu_temperature"===e){const t=he(i.state);null!==t&&(a=t)}else if("scanner_battery_soc"===e){const t=he(i.state);null!==t&&(l=t)}else"scanner_gnss_fix_quality"===e?d="unknown"!==i.state?i.state:void 0:"scanner_last_alert_message"===e&&i.state&&"unavailable"!==i.state&&p.push(i.state)}const _=t.name_by_user&&t.name_by_user.trim()||t.name&&t.name.trim()||`RX-5 (${e.slice(-8)})`;n.push({scanner_id:e,device_id:t.id,name:_,status_entity:o,is_online:c,cpu_temp:a,battery:l,gnss_fix:d,alerts:p.length?p:void 0,latitude:h,longitude:u})}return n.sort((t,e)=>t.name.localeCompare(e.name))}(this.hass,t),i=$e(this.hass,t),s=i.filter(t=>t.is_live).length,n=this._hideInactive?i.filter(t=>t.is_live):i,r=function(t){const e=t.config?.latitude,i=t.config?.longitude;if("number"==typeof e&&Number.isFinite(e)&&"number"==typeof i&&Number.isFinite(i))return{latitude:e,longitude:i};const s=t.states["zone.home"],n=s?.attributes?.latitude,r=s?.attributes?.longitude;return"number"==typeof n&&Number.isFinite(n)&&"number"==typeof r&&Number.isFinite(r)?{latitude:n,longitude:r}:null}(this.hass)??void 0;return F`
      <ha-card>
        <div class="header">
          <div class="brand-wrap">
            <img
              class="brand-logo"
              src=${this._headerLogoUrl}
              alt="DECTYR"
              loading="lazy"
              decoding="async"
              @error=${this._onHeaderLogoError}
            />
          </div>
          <span class="title">${this.config.title??"Dectyr Surveillance"}</span>
          <span class="counter">${s} live · ${i.length} total</span>
          <ha-switch .checked=${this._hideInactive} @change=${this._onHideInactive}></ha-switch>
          <span class="switch-label">Hide inactive</span>
        </div>
        <div class="card-content">
          <div class="stats">
            <dectyr-stat-tile .value=${e.length} .label=${"scanner"+(1===e.length?"":"s")}>
            </dectyr-stat-tile>
            <dectyr-stat-tile .value=${s} .label=${`drone${1===s?"":"s"} live`}>
            </dectyr-stat-tile>
            <dectyr-stat-tile .value=${i.length} .label=${"total tracked"}></dectyr-stat-tile>
          </div>
          ${e.length?F`
                <div class="scanners-block">
                  <div class="section-title">Scanners</div>
                  <div class="scanner-list">
                    ${e.map(t=>F`
                        <div class="scanner-row">
                          <span class="dot ${t.is_online?"on":""}"></span>
                          <span class="sname">${t.name}</span>
                          ${null!=t.cpu_temp?F`<span class="meta">${t.cpu_temp.toFixed(0)}°C</span>`:""}
                          ${null!=t.battery?F`<span class="meta">${t.battery.toFixed(0)}%</span>`:""}
                        </div>
                      `)}
                  </div>
                </div>
              `:""}
          <div class="section-title">Map</div>
          <div class="map-and-list">
            <dectyr-live-map
              .hass=${this.hass}
              .drones=${n}
              .scanners=${e}
              .homeZone=${r}
              .highlightedDroneId=${this._highlightedDroneId}
              .trailMinutes=${30}
            ></dectyr-live-map>
            <div class="list-column">
              <div class="section-title list-title">Drones</div>
              ${i.length>0?F`
                    <dectyr-drone-list
                      .drones=${n}
                      .newDroneIds=${this._newDroneIds}
                      @dectyr-drone-clicked=${this._onDroneClicked}
                    ></dectyr-drone-list>
                  `:F`<div class="empty list-empty">No drones detected yet.</div>`}
            </div>
          </div>
        </div>
      </ha-card>
    `}static get styles(){return[Tt,o`
        :host {
          display: block;
        }
        .header {
          padding: 14px 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        .brand-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
        }
        .title {
          font-size: 1.1em;
          font-weight: 500;
          flex: 1;
          min-width: 0;
        }
        .counter {
          font-size: 0.88em;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }
        ha-switch {
          margin-left: auto;
        }
        .switch-label {
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }
        .card-content {
          padding: 16px;
        }
        .stats {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .section-title {
          font-weight: 600;
          margin: 12px 0 8px;
          color: var(--secondary-text-color);
        }
        .section-title:first-of-type {
          margin-top: 0;
        }
        .scanner-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .scanner-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--dectyr-radius);
          background: var(--secondary-background-color);
          font-size: 0.92em;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--disabled-color, #9e9e9e);
          flex-shrink: 0;
        }
        .dot.on {
          background: var(--success-color, #4caf50);
        }
        .sname {
          flex: 1;
          min-width: 0;
          font-weight: 500;
        }
        .meta {
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }
        .empty {
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
        }
        .map-and-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 768px) {
          .map-and-list {
            grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          }
        }
        .list-column {
          min-width: 0;
        }
        .list-title {
          margin-top: 0;
        }
        .list-empty {
          padding: 16px 8px;
        }
      `]}};t([ut({attribute:!1})],be.prototype,"hass",void 0),t([pt()],be.prototype,"config",void 0),t([pt()],be.prototype,"_hideInactive",void 0),t([pt()],be.prototype,"_newDroneIds",void 0),t([pt()],be.prototype,"_headerLogoUrl",void 0),t([pt()],be.prototype,"_highlightedDroneId",void 0),be=t([dt("dectyr-surveillance-card")],be),window.customCards=window.customCards||[],window.customCards.push({type:"dectyr-surveillance-card",name:"Dectyr Surveillance",description:"Live drone surveillance dashboard for Dectyr RX-5 detectors",preview:!1}),console.info("%c DECTYR-SURVEILLANCE-CARD %c F3 ","color: white; background: #00569b; font-weight: 700;","color: #00569b; background: white; font-weight: 700;");export{be as DectyrSurveillanceCard};
