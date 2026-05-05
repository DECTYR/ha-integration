function t(t,e,i,s){var n,r=arguments.length,o=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,f=globalThis,_=f.trustedTypes,m=_?_.emptyScript:"",g=f.reactiveElementPolyfillSupport,y=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let C=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...h(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),n=e.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const r=n.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const r=this.constructor;if(!1===s&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??$)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[y("elementProperties")]=new Map,C[y("finalized")]=new Map,g?.({ReactiveElement:C}),(f.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,A=t=>t,S=w.trustedTypes,x=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,k="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+E,M=`<${L}>`,N=document,T=()=>N.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,I=Array.isArray,O="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,R=/>/g,H=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,F=/"/g,j=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),G=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),V=new WeakMap,W=N.createTreeWalker(N,129);function q(t,e){if(!I(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==x?x.createHTML(e):e}class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[c,l]=((t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=P;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,d=0;for(;d<i.length&&(o.lastIndex=d,c=o.exec(i),null!==c);)d=o.lastIndex,o===P?"!--"===c[1]?o=U:void 0!==c[1]?o=R:void 0!==c[2]?(j.test(c[2])&&(n=RegExp("</"+c[2],"g")),o=H):void 0!==c[3]&&(o=H):o===H?">"===c[0]?(o=n??P,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?H:'"'===c[3]?F:z):o===F||o===z?o=H:o===U||o===R?o=P:(o=H,n=void 0);const h=o===H&&t[e+1].startsWith("/>")?" ":"";r+=o===P?i+M:l>=0?(s.push(a),i.slice(0,l)+k+i.slice(l)+E+h):i+E+(-2===l?e:h)}return[q(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]})(t,e);if(this.el=Z.createElement(c,i),W.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=W.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(k)){const e=l[r++],i=s.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?tt:"?"===o[1]?et:"@"===o[1]?it:Q}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],T()),W.nextNode(),a.push({type:2,index:++n});s.append(t[e],T())}}}else if(8===s.nodeType)if(s.data===L)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function X(t,e,i=t,s){if(e===G)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=D(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=X(t,n._$AS(t,e.values),n,s)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??N).importNode(e,!0);W.currentNode=s;let n=W.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new J(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=i[++o]}r!==a?.index&&(n=W.nextNode(),r++)}return W.currentNode=N,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class J{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),D(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>I(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Y(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new Z(t)),e}k(t){I(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new J(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=X(this,t,e,0),r=!D(t)||t!==this._$AH&&t!==G,r&&(this._$AH=t);else{const s=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=X(this,s[i+o],e,o),a===G&&(a=this._$AH[o]),r||=!D(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class et extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class it extends Q{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??K)===G)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const nt={I:J},rt=w.litHtmlPolyfillSupport;rt?.(Z,J),(w.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;let at=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new J(e.insertBefore(T(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ct=ot.litElementPolyfillSupport;ct?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const lt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:$},ht=(t=dt,e,i)=>{const{kind:s,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,n,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];e.call(this,i),this.requestUpdate(s,n,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ut(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function pt(t){return ut({...t,state:!0,attribute:!1})}const{I:ft}=nt,_t=t=>t,mt=()=>document.createComment(""),gt=(t,e,i)=>{const s=t._$AA.parentNode,n=void 0===e?t._$AB:e._$AA;if(void 0===i){const e=s.insertBefore(mt(),n),r=s.insertBefore(mt(),n);i=new ft(e,r,t,t.options)}else{const e=i._$AB.nextSibling,r=i._$AM,o=r!==t;if(o){let e;i._$AQ?.(t),i._$AM=t,void 0!==i._$AP&&(e=t._$AU)!==r._$AU&&i._$AP(e)}if(e!==n||o){let t=i._$AA;for(;t!==e;){const e=_t(t).nextSibling;_t(s).insertBefore(t,n),t=e}}}return i},yt=(t,e,i=t)=>(t._$AI(e,i),t),vt={},$t=(t,e=vt)=>t._$AH=e,bt=t=>{t._$AR(),t._$AA.remove()},Ct=1,wt=2,At=t=>(...e)=>({_$litDirective$:t,values:e});let St=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const xt=(t,e)=>{const i=t._$AN;if(void 0===i)return!1;for(const t of i)t._$AO?.(e,!1),xt(t,e);return!0},kt=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===i?.size)},Et=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),Nt(e)}};function Lt(t){void 0!==this._$AN?(kt(this),this._$AM=t,Et(this)):this._$AM=t}function Mt(t,e=!1,i=0){const s=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)xt(s[t],!1),kt(s[t]);else null!=s&&(xt(s,!1),kt(s));else xt(this,t)}const Nt=t=>{t.type==wt&&(t._$AP??=Mt,t._$AQ??=Lt)};class Tt extends St{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),Et(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(xt(this,t),kt(this))}setValue(t){if((t=>void 0===t.strings)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}class Dt{}const It=new WeakMap,Ot=At(class extends Tt{render(t){return K}update(t,[e]){const i=e!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),K}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){const e=this.ht??globalThis;let i=It.get(e);void 0===i&&(i=new WeakMap,It.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?It.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),Pt="important",Ut=" !"+Pt,Rt=At(class extends St{constructor(t){if(super(t),t.type!==Ct||"style"!==t.name||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const s=t[i];return null==s?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(e)),this.render(e);for(const t of this.ft)null==e[t]&&(this.ft.delete(t),t.includes("-")?i.removeProperty(t):i[t]=null);for(const t in e){const s=e[t];if(null!=s){this.ft.add(t);const e="string"==typeof s&&s.endsWith(Ut);t.includes("-")||e?i.setProperty(t,e?s.slice(0,-11):s,e?Pt:""):i[t]=s}}return G}});let Ht=!1,zt=null;async function Ft(){const t=window;return Ht&&t.L?t.L:zt||(zt=new Promise((e,i)=>{if(t.L)return Ht=!0,void e(t.L);!function(t){const e=`dectyr-leaflet-css-${t.replace(/[^a-z0-9]+/gi,"-")}`;if(document.getElementById(e))return;const i=document.createElement("link");i.id=e,i.rel="stylesheet",i.href=t,document.head.appendChild(i)}("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",s.async=!0,s.dataset.dectyrLeaflet="1",s.onload=()=>{const t=window.L;t?(Ht=!0,e(t)):i(new Error("Leaflet script loaded but window.L is missing"))},s.onerror=()=>i(new Error("Failed to load Leaflet from CDN")),document.head.appendChild(s)}),zt)}const jt="dectyr_rx5",Bt="/dectyr_rx5_static",Gt=`${Bt}/brand/icon.png`,Kt=`${Bt}/dectyr-logo.png`,Vt=`${Bt}/dectyr-logo.svg`;function Wt(t){return e=>t.states[e]}function qt(t){if(void 0===t||"unknown"===t||"unavailable"===t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function Zt(t){return"on"===t}function Xt(t){if(!t||"unknown"===t||"unavailable"===t)return null;const e=new Date(t);return Number.isNaN(e.getTime())?null:e}function Yt(t){if(!t)return null;const e=new Date(t);return Number.isNaN(e.getTime())?null:e}function Jt(t){if(void 0===t)return null;const e=String(t).trim();return e&&"unknown"!==e&&"unavailable"!==e?e:null}function Qt(t){if(!t?.length)return null;for(const e of t)if(e[0]===jt&&"string"==typeof e[1]&&e[1].startsWith("drone:"))return e[1].slice(6);return null}function te(t){if(!t?.length)return null;for(const e of t)if(e[0]===jt&&"string"==typeof e[1]&&e[1].length>0&&!e[1].startsWith("drone:"))return e[1];return null}function ee(t,e){const i=new Map;if(!t.entities)return i;for(const[s,n]of Object.entries(t.entities))n.device_id===e&&n.platform===jt&&i.set(s,n.translation_key??null);return i}function ie(t,e){const i=t,s=e??Wt(t);if(!i.devices)return[];const n=[];for(const t of Object.values(i.devices)){const e=te(t.identifiers);if(!e)continue;const r=ee(i,t.id);let o,a,c,l,d=!1,h=null,u=null;const p=[];for(const[t,e]of r){const i=s(t);if(i)if("scanner_position"===e){if("unavailable"!==i.state&&"unknown"!==i.state){if(null!=i.attributes.latitude){const t=Number(i.attributes.latitude);Number.isFinite(t)&&(h=t)}if(null!=i.attributes.longitude){const t=Number(i.attributes.longitude);Number.isFinite(t)&&(u=t)}}}else if("scanner_online"===e)o=t,d=Zt(i.state);else if("scanner_cpu_temperature"===e){const t=qt(i.state);null!==t&&(a=t)}else if("scanner_battery_soc"===e){const t=qt(i.state);null!==t&&(c=t)}else"scanner_gnss_fix_quality"===e?l="unknown"!==i.state?i.state:void 0:"scanner_last_alert_message"===e&&i.state&&"unavailable"!==i.state&&p.push(i.state)}const f=t.name_by_user&&t.name_by_user.trim()||t.name&&t.name.trim()||`RX-5 (${e.slice(-8)})`;n.push({scanner_id:e,device_id:t.id,name:f,status_entity:o,is_online:d,cpu_temp:a,battery:c,gnss_fix:l,alerts:p.length?p:void 0,latitude:h,longitude:u})}return n.sort((t,e)=>t.name.localeCompare(e.name))}function se(t){const e=new Map;let i,s;for(const[n,r]of t)r&&("drone_position"===r?i=n:"operator_position"===r?s=n:e.set(r,n));return{tracker:i,operatorTracker:s,byTk:e}}function ne(t,e){const i=t,s=e??Wt(t);if(!i.devices)return[];const n=[];for(const t of Object.values(i.devices)){const e=Qt(t.identifiers);if(!e)continue;const r=ee(i,t.id),{tracker:o,operatorTracker:a,byTk:c}=se(r),l=o?s(o):void 0,d=!!l&&"unavailable"!==l.state&&"unknown"!==l.state;let h=null,u=null;if(l){if(null!=l.attributes.latitude){const t=Number(l.attributes.latitude);Number.isFinite(t)&&(h=t)}if(null!=l.attributes.longitude){const t=Number(l.attributes.longitude);Number.isFinite(t)&&(u=t)}}const p=t=>{const e=c.get(t);if(e)return s(e)?.state},f=c.get("drone_multi_source"),_=f?s(f)?.state:void 0;let m=Xt(p("drone_last_seen"));!m&&l&&(m=Yt(l.last_updated)??Yt(l.last_changed)??null);const g=a?s(a):void 0;let y=null,v=null;if(g){if(null!=g.attributes.latitude){const t=Number(g.attributes.latitude);Number.isFinite(t)&&(y=t)}if(null!=g.attributes.longitude){const t=Number(g.attributes.longitude);Number.isFinite(t)&&(v=t)}}const $=t.manufacturer&&String(t.manufacturer).trim()||(null!=l?.attributes.manufacturer?String(l.attributes.manufacturer):null),b=t.model&&String(t.model).trim()||(null!=l?.attributes.model?String(l.attributes.model):null),C=t.name_by_user&&t.name_by_user.trim()||t.name&&t.name.trim()||[$,b].filter(Boolean).join(" ")||`Drone ${e.slice(-10)}`;n.push({drone_id:e,device_id:t.id,display_name:C,manufacturer:$,model:b,is_live:d,latitude:h,longitude:u,altitude_msl:qt(p("drone_altitude_msl")),altitude_agl:qt(p("drone_altitude_agl")),speed_horizontal:qt(p("drone_speed_horizontal")),speed_vertical:qt(p("drone_speed_vertical")),direction:qt(p("drone_direction")),rssi:qt(p("drone_rssi")),operator_id:Jt(p("drone_operator_id")),operator_country:Jt(p("drone_operator_country")),operator_latitude:y,operator_longitude:v,category_eu:Jt(p("drone_category_eu")),class_eu:Jt(p("drone_class_eu")),signal_type:Jt(p("drone_signal_type")),broadcast_protocol:Jt(p("drone_broadcast_protocol")),multi_source:Zt(_),distance_to_scanner:qt(p("drone_distance_to_scanner")),last_seen:m})}return n}let re=null;function oe(t){const e=null!=t&&Number.isFinite(t)?t:0,i=function(){if(null!=re)return re;let t='<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2501" height="2501" viewBox="0 0 2501 2501">\n<path fill-rule="evenodd" fill="rgb(19.993591%, 19.993591%, 19.993591%)" fill-opacity="1" d="M 1188.691406 878.859375 L 426.578125 1368.121094 C 422.996094 1370.421875 421 1374.078125 421 1378.328125 L 421 1472.398438 C 421 1476.300781 422.65625 1479.660156 425.75 1482.03125 C 428.84375 1484.410156 432.511719 1485.140625 436.28125 1484.128906 L 1196.128906 1280.53125 C 1201.480469 1279.089844 1205.089844 1274.421875 1205.121094 1268.871094 L 1207.390625 889.148438 C 1207.421875 884.578125 1205.109375 880.640625 1201.101562 878.441406 C 1197.101562 876.238281 1192.539062 876.390625 1188.691406 878.859375 Z M 1312.988281 878.859375 L 2075.101562 1368.121094 C 2078.679688 1370.421875 2080.679688 1374.078125 2080.679688 1378.328125 L 2080.679688 1472.398438 C 2080.679688 1476.300781 2079.03125 1479.660156 2075.929688 1482.03125 C 2072.839844 1484.410156 2069.171875 1485.140625 2065.398438 1484.128906 L 1305.550781 1280.53125 C 1300.199219 1279.089844 1296.589844 1274.421875 1296.558594 1268.871094 L 1294.289062 889.148438 C 1294.261719 884.578125 1296.570312 880.640625 1300.578125 878.441406 C 1304.578125 876.238281 1309.140625 876.390625 1312.988281 878.859375 "/>\n<path fill-rule="evenodd" fill="rgb(19.993591%, 19.993591%, 19.993591%)" fill-opacity="1" d="M 1218.078125 1709.171875 L 949.828125 1991.511719 C 947.484375 1993.980469 946.3125 1996.910156 946.3125 2000.3125 L 946.3125 2047.03125 C 946.3125 2051.480469 948.382812 2055.300781 952.105469 2057.730469 C 955.828125 2060.164062 960.160156 2060.519531 964.230469 2058.730469 L 1231.710938 1941.226562 C 1236.441406 1939.148438 1239.328125 1934.742188 1239.351562 1929.574219 L 1240.121094 1718.019531 C 1240.140625 1712.675781 1237.058594 1708.105469 1232.101562 1706.113281 C 1227.140625 1704.125 1221.761719 1705.296875 1218.078125 1709.171875 Z M 1294.769531 1709.171875 L 1563.019531 1991.511719 C 1565.371094 1993.980469 1566.539062 1996.910156 1566.539062 2000.3125 L 1566.539062 2047.03125 C 1566.539062 2051.480469 1564.46875 2055.300781 1560.738281 2057.730469 C 1557.019531 2060.164062 1552.691406 2060.519531 1548.621094 2058.730469 L 1281.140625 1941.226562 C 1276.410156 1939.148438 1273.519531 1934.742188 1273.5 1929.574219 L 1272.730469 1718.019531 C 1272.710938 1712.675781 1275.789062 1708.105469 1280.75 1706.113281 C 1285.710938 1704.125 1291.089844 1705.296875 1294.769531 1709.171875 "/>\n<path fill-rule="evenodd" fill="rgb(19.993591%, 19.993591%, 19.993591%)" fill-opacity="1" d="M 1308.828125 1848.382812 C 1308.828125 1849.378906 1308.828125 1850.371094 1308.828125 1851.367188 C 1308.828125 1852.671875 1308.839844 1853.976562 1308.839844 1855.277344 C 1308.839844 1856.578125 1308.839844 1857.878906 1308.851562 1859.175781 L 1308.859375 1863.058594 C 1308.859375 1864.351562 1308.859375 1865.640625 1308.859375 1866.929688 C 1308.871094 1868.214844 1308.871094 1869.5 1308.871094 1870.78125 C 1308.871094 1872.0625 1308.871094 1873.34375 1308.871094 1874.621094 C 1308.871094 1877.171875 1308.871094 1879.714844 1308.859375 1882.242188 C 1308.859375 1883.507812 1308.851562 1884.769531 1308.851562 1886.027344 C 1308.839844 1887.285156 1308.828125 1888.539062 1308.820312 1889.792969 C 1308.800781 1892.296875 1308.769531 1894.785156 1308.738281 1897.261719 C 1308.71875 1898.496094 1308.699219 1899.730469 1308.679688 1900.960938 C 1308.648438 1902.191406 1308.628906 1903.417969 1308.601562 1904.640625 C 1308.570312 1905.859375 1308.539062 1907.078125 1308.5 1908.292969 C 1308.46875 1909.507812 1308.429688 1910.71875 1308.390625 1911.921875 C 1308.308594 1914.335938 1308.21875 1916.726562 1308.109375 1919.105469 C 1308.058594 1920.292969 1308 1921.476562 1307.941406 1922.652344 C 1307.871094 1923.832031 1307.808594 1925.007812 1307.738281 1926.175781 C 1307.601562 1928.515625 1307.441406 1930.835938 1307.269531 1933.132812 C 1307.179688 1934.285156 1307.078125 1935.429688 1306.988281 1936.566406 C 1306.890625 1937.707031 1306.789062 1938.839844 1306.679688 1939.96875 C 1306.570312 1941.097656 1306.460938 1942.222656 1306.339844 1943.339844 C 1306.21875 1944.457031 1306.101562 1945.570312 1305.96875 1946.675781 C 1305.839844 1947.78125 1305.710938 1948.882812 1305.570312 1949.980469 C 1305.429688 1951.074219 1305.28125 1952.164062 1305.128906 1953.246094 C 1304.96875 1954.328125 1304.820312 1955.40625 1304.648438 1956.480469 C 1304.488281 1957.550781 1304.308594 1958.617188 1304.140625 1959.675781 C 1303.960938 1960.734375 1303.769531 1961.785156 1303.578125 1962.835938 C 1303.390625 1963.878906 1303.191406 1964.921875 1302.988281 1965.953125 C 1302.78125 1966.988281 1302.570312 1968.015625 1302.351562 1969.035156 C 1302.128906 1970.054688 1301.898438 1971.070312 1301.671875 1972.078125 C 1301.429688 1973.085938 1301.191406 1974.085938 1300.941406 1975.078125 C 1300.441406 1977.066406 1299.910156 1979.023438 1299.339844 1980.953125 C 1299.058594 1981.921875 1298.769531 1982.878906 1298.46875 1983.828125 C 1297.269531 1987.632812 1295.941406 1991.316406 1294.460938 1994.875 C 1294.078125 1995.765625 1293.699219 1996.644531 1293.308594 1997.519531 C 1292.53125 1999.269531 1291.710938 2000.984375 1290.851562 2002.664062 C 1277.960938 2027.851562 1264.410156 2040.398438 1250.578125 2039.886719 C 1238.359375 2039.4375 1225.910156 2028.773438 1213.53125 2007.609375 C 1212.589844 2005.996094 1211.691406 2004.347656 1210.828125 2002.664062 C 1209.96875 2000.984375 1209.148438 1999.269531 1208.371094 1997.519531 C 1207.980469 1996.644531 1207.589844 1995.765625 1207.21875 1994.875 C 1205.738281 1991.316406 1204.410156 1987.632812 1203.210938 1983.828125 C 1202.910156 1982.878906 1202.621094 1981.921875 1202.339844 1980.953125 C 1201.769531 1979.023438 1201.238281 1977.066406 1200.738281 1975.078125 C 1200.488281 1974.085938 1200.25 1973.085938 1200.011719 1972.078125 C 1199.78125 1971.070312 1199.550781 1970.054688 1199.328125 1969.035156 C 1199.109375 1968.015625 1198.898438 1966.988281 1198.691406 1965.953125 C 1198.488281 1964.921875 1198.289062 1963.878906 1198.101562 1962.835938 C 1197.910156 1961.785156 1197.71875 1960.734375 1197.539062 1959.675781 C 1197.371094 1958.617188 1197.191406 1957.550781 1197.03125 1956.480469 C 1196.859375 1955.40625 1196.710938 1954.328125 1196.550781 1953.246094 C 1196.398438 1952.164062 1196.25 1951.074219 1196.109375 1949.980469 C 1195.96875 1948.882812 1195.839844 1947.78125 1195.710938 1946.675781 C 1195.578125 1945.570312 1195.460938 1944.457031 1195.339844 1943.339844 C 1195.21875 1942.222656 1195.109375 1941.097656 1195 1939.96875 C 1194.890625 1938.839844 1194.789062 1937.707031 1194.691406 1936.566406 C 1194.589844 1935.429688 1194.5 1934.285156 1194.410156 1933.132812 C 1194.238281 1930.835938 1194.078125 1928.515625 1193.941406 1926.175781 C 1193.871094 1925.007812 1193.808594 1923.832031 1193.738281 1922.652344 C 1193.679688 1921.476562 1193.621094 1920.292969 1193.570312 1919.105469 C 1193.460938 1916.726562 1193.371094 1914.335938 1193.289062 1911.921875 C 1193.25 1910.71875 1193.210938 1909.507812 1193.179688 1908.292969 C 1193.140625 1907.078125 1193.109375 1905.859375 1193.078125 1904.640625 C 1193.050781 1903.417969 1193.03125 1902.191406 1193 1900.960938 C 1192.980469 1899.730469 1192.960938 1898.496094 1192.941406 1897.261719 C 1192.910156 1894.785156 1192.878906 1892.296875 1192.859375 1889.792969 C 1192.851562 1888.539062 1192.839844 1887.285156 1192.828125 1886.027344 C 1192.828125 1884.769531 1192.820312 1883.507812 1192.820312 1882.242188 C 1192.808594 1879.714844 1192.808594 1877.171875 1192.808594 1874.621094 C 1192.808594 1873.34375 1192.808594 1872.0625 1192.808594 1870.78125 C 1192.808594 1869.5 1192.808594 1868.214844 1192.820312 1866.929688 C 1192.820312 1865.640625 1192.820312 1864.351562 1192.820312 1863.058594 L 1192.828125 1859.175781 C 1192.839844 1857.878906 1192.839844 1856.578125 1192.839844 1855.277344 C 1192.839844 1853.976562 1192.851562 1852.671875 1192.851562 1851.367188 C 1192.851562 1850.371094 1192.851562 1849.378906 1192.851562 1848.382812 L 1172.289062 1848.382812 C 1157.460938 1848.382812 1145.640625 1836.472656 1145.03125 1821.65625 L 1107.738281 908.261719 C 1107.738281 908.089844 1107.738281 907.949219 1107.738281 907.789062 L 1107.738281 907.730469 C 1107.738281 904.5 1107.738281 901.269531 1107.730469 898.050781 C 1107.730469 894.828125 1107.71875 891.609375 1107.71875 888.398438 C 1107.710938 885.191406 1107.699219 881.980469 1107.699219 878.78125 L 1107.671875 869.199219 C 1107.671875 866.011719 1107.660156 862.820312 1107.648438 859.648438 C 1107.648438 856.46875 1107.640625 853.300781 1107.640625 850.140625 C 1107.628906 846.96875 1107.628906 843.820312 1107.628906 840.671875 L 1107.628906 840.660156 C 1107.628906 834.359375 1107.628906 828.089844 1107.648438 821.851562 C 1107.660156 818.730469 1107.679688 815.621094 1107.691406 812.511719 C 1107.710938 809.410156 1107.730469 806.308594 1107.761719 803.21875 C 1107.808594 797.050781 1107.878906 790.898438 1107.96875 784.800781 C 1108.011719 781.738281 1108.058594 778.699219 1108.121094 775.660156 C 1108.179688 772.628906 1108.238281 769.601562 1108.308594 766.589844 C 1108.378906 763.570312 1108.460938 760.570312 1108.539062 757.570312 C 1108.621094 754.570312 1108.71875 751.589844 1108.808594 748.609375 C 1109.011719 742.660156 1109.238281 736.761719 1109.511719 730.890625 C 1109.648438 727.960938 1109.789062 725.039062 1109.941406 722.128906 C 1110.101562 719.21875 1110.261719 716.320312 1110.429688 713.441406 C 1110.78125 707.671875 1111.160156 701.941406 1111.601562 696.269531 C 1111.808594 693.429688 1112.039062 690.609375 1112.28125 687.800781 C 1112.519531 684.980469 1112.78125 682.191406 1113.039062 679.398438 C 1113.308594 676.621094 1113.578125 673.839844 1113.878906 671.089844 L 1113.878906 671.078125 C 1114.171875 668.328125 1114.46875 665.578125 1114.789062 662.851562 C 1115.109375 660.121094 1115.441406 657.398438 1115.789062 654.699219 C 1116.140625 652 1116.5 649.308594 1116.871094 646.640625 C 1117.25 643.960938 1117.640625 641.300781 1118.050781 638.660156 C 1118.460938 636.019531 1118.878906 633.390625 1119.320312 630.769531 C 1119.761719 628.160156 1120.210938 625.558594 1120.691406 622.980469 C 1121.160156 620.398438 1121.648438 617.828125 1122.160156 615.28125 C 1122.660156 612.730469 1123.191406 610.191406 1123.730469 607.671875 C 1124.269531 605.160156 1124.828125 602.648438 1125.410156 600.171875 C 1125.988281 597.679688 1126.589844 595.210938 1127.210938 592.761719 C 1128.441406 587.859375 1129.75 583.019531 1131.148438 578.261719 C 1131.839844 575.878906 1132.558594 573.511719 1133.300781 571.171875 C 1188.140625 396.898438 1313.539062 396.898438 1368.378906 571.171875 C 1369.121094 573.511719 1369.839844 575.878906 1370.53125 578.261719 C 1371.929688 583.019531 1373.238281 587.859375 1374.46875 592.761719 C 1375.089844 595.210938 1375.691406 597.679688 1376.269531 600.171875 C 1376.851562 602.648438 1377.410156 605.160156 1377.949219 607.671875 C 1378.488281 610.191406 1379.019531 612.730469 1379.519531 615.28125 C 1380.03125 617.828125 1380.519531 620.398438 1380.988281 622.980469 C 1381.460938 625.558594 1381.921875 628.160156 1382.359375 630.769531 C 1382.800781 633.390625 1383.21875 636.019531 1383.628906 638.660156 C 1384.039062 641.300781 1384.429688 643.960938 1384.808594 646.640625 C 1385.179688 649.308594 1385.539062 652 1385.890625 654.699219 C 1386.238281 657.398438 1386.570312 660.121094 1386.890625 662.851562 C 1387.210938 665.578125 1387.511719 668.328125 1387.800781 671.078125 L 1387.800781 671.089844 C 1388.101562 673.839844 1388.371094 676.621094 1388.640625 679.398438 C 1388.898438 682.191406 1389.160156 684.980469 1389.398438 687.800781 C 1389.640625 690.609375 1389.871094 693.429688 1390.078125 696.269531 C 1390.519531 701.941406 1390.898438 707.671875 1391.25 713.441406 C 1391.421875 716.320312 1391.578125 719.21875 1391.738281 722.128906 C 1391.890625 725.039062 1392.03125 727.960938 1392.171875 730.890625 C 1392.429688 736.761719 1392.671875 742.660156 1392.859375 748.609375 C 1392.960938 751.589844 1393.058594 754.570312 1393.140625 757.570312 C 1393.21875 760.570312 1393.300781 763.570312 1393.371094 766.589844 C 1393.441406 769.601562 1393.5 772.628906 1393.558594 775.660156 C 1393.621094 778.699219 1393.671875 781.738281 1393.710938 784.800781 C 1393.800781 790.898438 1393.871094 797.050781 1393.921875 803.21875 C 1393.949219 806.308594 1393.96875 809.410156 1393.988281 812.511719 C 1394 815.621094 1394.019531 818.730469 1394.03125 821.851562 C 1394.050781 828.089844 1394.050781 834.359375 1394.050781 840.660156 L 1394.050781 840.671875 C 1394.050781 843.820312 1394.050781 846.96875 1394.039062 850.140625 C 1394.039062 853.300781 1394.03125 856.46875 1394.03125 859.648438 C 1394.019531 862.820312 1394.011719 866.011719 1394.011719 869.199219 L 1393.980469 878.78125 C 1393.980469 881.980469 1393.96875 885.191406 1393.960938 888.398438 C 1393.960938 891.609375 1393.949219 894.828125 1393.949219 898.050781 C 1393.941406 901.269531 1393.941406 904.5 1393.941406 907.730469 L 1393.941406 907.789062 C 1393.941406 907.949219 1393.941406 908.089844 1393.941406 908.261719 L 1356.640625 1821.65625 C 1356.039062 1836.472656 1344.21875 1848.382812 1329.390625 1848.382812 Z M 1107.738281 908.261719 C 1107.738281 908.089844 1107.738281 907.949219 1107.738281 907.789062 L 1107.738281 908.261719 "/>\n</svg>\n'.replace(/^\s*<\?xml[^>]*>\s*/i,"");return t=t.replace(/\swidth="[^"]*"/,' width="38"'),t=t.replace(/\sheight="[^"]*"/,' height="38"'),/\saria-hidden=/.test(t)||(t=t.replace(/<svg\b/,'<svg aria-hidden="true"')),re=t,t}();return`<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;transform:rotate(${e}deg);transform-origin:center center;">${i}</div>`}function ae(t){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">\n    <circle cx="16" cy="16" r="14" fill="${t?"#4caf50":"#9e9e9e"}" opacity="0.95" stroke="white" stroke-width="2"/>\n    <path d="M 16 16 L 16 5 A 11 11 0 0 1 26 12 Z" fill="white" opacity="0.38"/>\n    <circle cx="16" cy="16" r="10" fill="none" stroke="white" stroke-width="1" opacity="0.65"/>\n    <circle cx="16" cy="16" r="6" fill="none" stroke="white" stroke-width="0.85" opacity="0.55"/>\n    <line x1="16" y1="3" x2="16" y2="29" stroke="white" stroke-width="0.55" opacity="0.35"/>\n    <line x1="3" y1="16" x2="29" y2="16" stroke="white" stroke-width="0.55" opacity="0.35"/>\n    <circle cx="16" cy="16" r="1.8" fill="white"/>\n  </svg>`}function ce(t,e,i){const s=t.divIcon,n=["dectyr-map-icon","dectyr-drone-marker",e.is_live?"dectyr-drone-live":"dectyr-drone-offline",""].filter(Boolean).join(" ");return s({html:oe(e.direction),className:n,iconSize:[44,44],iconAnchor:[22,22]})}var le;function de(){const t="#ff9800";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">\n    <circle cx="16" cy="16" r="13" fill="${t}" opacity="0.95" stroke="white" stroke-width="2"/>\n    <circle cx="16" cy="11" r="3.5" fill="white"/>\n    <path d="M 10 24 L 10 17 Q 10 14 13 14 L 19 14 Q 22 14 22 17 L 22 24"\n          fill="white"/>\n    <rect x="13" y="18" width="6" height="2" fill="${t}" rx="0.5"/>\n  </svg>`}let he=null,ue=null;let pe=le=class extends at{constructor(){super(...arguments),this._mapContainerRef=new Dt,this._map=null,this._homeCircle=null,this._L=null,this._scannerMarkers=new Map,this._droneMarkers=new Map,this._operatorMarkers=new Map,this._trailPoints=new Map,this._trailLines=new Map,this._scannerMarkerStylesInstalled=!1,this._initLock=!1,this._initStarted=!1,this._disconnected=!1,this._lastAppliedCenterKey=""}_centerKey(t,e){return`${t.toFixed(5)},${e.toFixed(5)}`}setConfig(t){if(!t)throw new Error("Invalid configuration");this.config=t}getCardSize(){const t=this.config;if(t&&"number"==typeof t.height&&t.height>0&&isFinite(t.height))return Math.max(2,Math.round(t.height/50));if(null!=t?.aspect_ratio){const e=this._parseAspectRatio(t.aspect_ratio);if(null!=e)return e>=2.5?4:e>=1.5?6:8}return 6}_parseAspectRatio(t){if("number"==typeof t&&isFinite(t)&&t>0)return t;if("string"!=typeof t)return null;const e=t.trim(),i=e.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);if(i){const t=parseFloat(i[1]),e=parseFloat(i[2]);if(e>0&&isFinite(t))return t/e}const s=parseFloat(e);return isFinite(s)&&s>0?s:null}_mapShellStyles(){const t=this.config;if(!t)return{height:"400px",minHeight:"200px"};if("number"==typeof t.height&&t.height>0&&isFinite(t.height))return{height:`${t.height}px`,minHeight:"200px"};const e=null!=t.aspect_ratio?this._parseAspectRatio(t.aspect_ratio):null;return null!=e?{aspectRatio:`${e}`,height:"auto",minHeight:"200px"}:{height:"400px",minHeight:"200px"}}connectedCallback(){super.connectedCallback(),this._disconnected=!1}async firstUpdated(t){if(super.firstUpdated(t),this._disconnected)return void console.info("[dectyr-map-card] firstUpdated skipped (already disconnected)");const e=this.shadowRoot;if(e)try{const t=await async function(){return he||ue||(ue=(async()=>{const t=await fetch("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");if(!t.ok)throw new Error(`Leaflet CSS fetch failed: ${t.status}`);const e=await t.text(),i=new CSSStyleSheet;return i.replaceSync(e),he=i,i})(),ue)}();if(this._disconnected)return;e.adoptedStyleSheets.includes(t)||(e.adoptedStyleSheets=[...e.adoptedStyleSheets,t])}catch(t){console.error("[dectyr-map-card] Failed to load Leaflet CSS:",t)}this._disconnected||await this._initMap()}updated(t){if(super.updated(t),this._disconnected)return;if(t.has("config")&&this._map&&window.setTimeout(()=>{!this._disconnected&&this._map&&this._map.invalidateSize({pan:!1})},100),!this._mapContainerRef.value||this._map||this._initLock||this._initStarted||this._initMap(),t.has("hass")&&this._map&&this.hass&&(this._updateTrails(),this._updateScannerMarkers(),this._updateDroneMarkers(),this._updateOperatorMarkers()),!this._map||!t.has("hass")||!this.hass?.config)return;const e=this.hass.config.latitude,i=this.hass.config.longitude;if("number"!=typeof e||"number"!=typeof i)return;const s=this._centerKey(e,i);s!==this._lastAppliedCenterKey&&(this._lastAppliedCenterKey=s,this._map.setView([e,i],15),requestAnimationFrame(()=>{!this._disconnected&&this._map&&this._map.invalidateSize({pan:!1})}))}disconnectedCallback(){console.info("[dectyr-map-card] disconnectedCallback — cleanup"),this._disconnected=!0,this._destroyMap(),super.disconnectedCallback()}async _initMap(){if(this._initLock||this._initStarted)console.info("[dectyr-map-card] Init already in progress or completed");else if(this._disconnected)console.info("[dectyr-map-card] Skipping init (disconnected)");else if(this.isConnected){this._initLock=!0,this._initStarted=!0;try{const t=await Ft();if(this._disconnected||!this.isConnected)return void console.info("[dectyr-map-card] Aborted init after Leaflet load (detached)");const e=this._mapContainerRef.value;if(!e)return void console.warn("[dectyr-map-card] Container ref not available");console.info("[dectyr-map-card] Container dimensions:",{width:e.offsetWidth,height:e.offsetHeight});let i=[48.8566,2.3522];const s=this.hass?.config?.latitude,n=this.hass?.config?.longitude;"number"==typeof s&&"number"==typeof n&&(i=[s,n]),console.info("[dectyr-map-card] Initializing map at",i);const r=t.map,o=t.tileLayer;this._map=r(e,{center:i,zoom:15,zoomControl:!0}),this._L=t,o("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(this._map);const a=this.hass?.config?.latitude,c=this.hass?.config?.longitude;if("number"==typeof a&&"number"==typeof c){const e=[a,c],i=t.circle;this._homeCircle=i(e,{radius:100,color:"var(--primary-color, #03a9f4)",fillColor:"var(--primary-color, #03a9f4)",fillOpacity:.1,weight:2,opacity:.6}).addTo(this._map).bindPopup("Home"),console.info("[dectyr-map-card] Home circle added")}this._lastAppliedCenterKey=this._centerKey(i[0],i[1]),this._invalidateSizeTimer=window.setTimeout(()=>{this._invalidateSizeTimer=void 0,!this._disconnected&&this._map&&this._map.invalidateSize({pan:!1})},100),console.info("[dectyr-map-card] Map initialized successfully"),this._ensureDivIconMarkerStyles(),this._updateTrails(),this._updateScannerMarkers(),this._updateDroneMarkers(),this._updateOperatorMarkers()}catch(t){console.error("[dectyr-map-card] Init failed:",t)}finally{this._initLock=!1,this._map||(this._initStarted=!1)}}else console.info("[dectyr-map-card] Skipping init (not connected)")}_ensureDivIconMarkerStyles(){const t=this.shadowRoot;if(!t||this._scannerMarkerStylesInstalled)return;const e="dectyr-map-card-divicon-styles";if(t.querySelector(`#${e}`))return void(this._scannerMarkerStylesInstalled=!0);const i=document.createElement("style");i.id=e,i.textContent="\n      .leaflet-div-icon.dectyr-scanner-marker,\n      .leaflet-div-icon.dectyr-drone-marker,\n      .leaflet-div-icon.dectyr-operator-marker {\n        border: none !important;\n        background: transparent !important;\n      }\n    ",t.appendChild(i),this._scannerMarkerStylesInstalled=!0}_makeScannerDivIcon(t){const e=this._L;if(!e)return;return(0,e.divIcon)({html:ae(t),className:"dectyr-scanner-marker "+(t?"online":"offline"),iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16]})}_makeOperatorDivIcon(){const t=this._L;if(!t)return;return(0,t.divIcon)({html:de(),className:"dectyr-operator-marker",iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-14]})}_popupEscape(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}_updateScannerMarkers(){const t=this._map,e=this._L;if(!t||!e||!this.hass||this._disconnected)return;const i=ie(this.hass).filter(t=>{const{latitude:e,longitude:i}=t;return"number"==typeof e&&Number.isFinite(e)&&"number"==typeof i&&Number.isFinite(i)}),s=new Set,n=e.marker;for(const e of i){const i=e.latitude,r=e.longitude;s.add(e.device_id);const o=this._scannerMarkers.get(e.device_id),a=[i,r];if(o){const t=o.getLatLng();t.lat===i&&t.lng===r||o.setLatLng(a);const s=this._makeScannerDivIcon(e.is_online);void 0!==s&&o.setIcon(s);const n=e.scanner_id.length>8?e.scanner_id.slice(-8):e.scanner_id,c=e.is_online?"Online":"Offline",l=this._popupEscape(e.name);o.bindPopup(`<strong>${l}</strong><br>\n        ID: <code>${this._popupEscape(n)}</code><br>\n        Status: <span style="color:${e.is_online?"#4caf50":"#9e9e9e"}">${c}</span>`)}else{const i=this._makeScannerDivIcon(e.is_online);if(void 0===i)continue;const s=n(a,{icon:i}).addTo(t),r=e.scanner_id.length>8?e.scanner_id.slice(-8):e.scanner_id,o=e.is_online?"Online":"Offline",c=this._popupEscape(e.name);s.bindPopup(`<strong>${c}</strong><br>\n        ID: <code>${this._popupEscape(r)}</code><br>\n        Status: <span style="color:${e.is_online?"#4caf50":"#9e9e9e"}">${o}</span>`),this._scannerMarkers.set(e.device_id,s),console.info(`[dectyr-map-card] Scanner marker added: ${e.name}`)}}for(const[t,e]of this._scannerMarkers.entries())if(!s.has(t)){try{e.remove()}catch{}this._scannerMarkers.delete(t),console.info(`[dectyr-map-card] Scanner marker removed: ${t}`)}}_liveDronesWithPosition(){return this.hass?ne(this.hass).filter(t=>t.is_live&&null!=t.latitude&&null!=t.longitude&&Number.isFinite(t.latitude)&&Number.isFinite(t.longitude)):[]}_fmtNum(t,e="",i=1){return null!=t&&Number.isFinite(t)?`${t.toFixed(i)}${e}`:"—"}_fmtLastSeen(t){if(!t.last_seen)return"—";try{return t.last_seen.toLocaleString()}catch{return"—"}}_buildDronePopupHtml(t){const e=this._popupEscape;return[`<strong>${e(t.display_name)}</strong>`,`<code>${e(t.drone_id)}</code>`,`Alt MSL / AGL: ${this._fmtNum(t.altitude_msl," m")} / ${this._fmtNum(t.altitude_agl," m")}`,`Speed H/V: ${this._fmtNum(t.speed_horizontal," m/s")} / ${this._fmtNum(t.speed_vertical," m/s")}`,`Heading: ${this._fmtNum(t.direction,"°",0)}`,`EU cat. / class: ${e(t.category_eu??"—")} / ${e(t.class_eu??"—")}`,`Dist. to scanner: ${this._fmtNum(t.distance_to_scanner," m")}`,`Signal: ${e(t.signal_type??"—")} · Multi-src: ${t.multi_source?"yes":"no"}`,`Operator ID: ${e(t.operator_id??"—")}`,`Last seen: ${e(this._fmtLastSeen(t))}`].join("<br>")}_updateDroneMarkers(){const t=this._map,e=this._L;if(!t||!e||!this.hass||this._disconnected)return;const i=this._liveDronesWithPosition(),s=new Set,n=e.marker;for(const r of i){s.add(r.drone_id);const i=[r.latitude,r.longitude],o=this._buildDronePopupHtml(r);let a=this._droneMarkers.get(r.drone_id);a?(a.setLatLng(i),a.setIcon(ce(e,r)),a.bindPopup(o)):(a=n(i,{icon:ce(e,r)}).addTo(t).bindPopup(o),this._droneMarkers.set(r.drone_id,a),console.info(`[dectyr-map-card] Drone marker added: ${r.display_name}`))}for(const[t,e]of this._droneMarkers.entries())if(!s.has(t)){try{e.remove()}catch{}this._droneMarkers.delete(t),console.info(`[dectyr-map-card] Drone marker removed: ${t}`)}}_buildOperatorPopup(t){const e=t.operator_id?`Operator ID: <code>${this._popupEscape(t.operator_id)}</code>`:"Operator ID: unknown";return`<strong>Pilot</strong><br>\n      Controlling: ${this._popupEscape(t.drone_name)}<br>\n      ${e}`}_updateOperatorMarkers(){const t=this._map,e=this._L;if(!t||!e||!this.hass||this._disconnected)return;const i=[];for(const t of ne(this.hass)){if(!t.is_live)continue;const e=t.operator_latitude,s=t.operator_longitude;null!=e&&null!=s&&Number.isFinite(e)&&Number.isFinite(s)&&i.push({device_id:t.device_id,drone_name:t.display_name,drone_id:t.drone_id,operator_id:t.operator_id,latitude:e,longitude:s})}const s=new Set,n=e.marker;for(const e of i){s.add(e.device_id);const i=[e.latitude,e.longitude],r=this._buildOperatorPopup(e),o=this._operatorMarkers.get(e.device_id);if(o){const t=o.getLatLng();t.lat===e.latitude&&t.lng===e.longitude||o.setLatLng(i);const s=this._makeOperatorDivIcon();void 0!==s&&o.setIcon(s),o.bindPopup(r)}else{const s=this._makeOperatorDivIcon();if(void 0===s)continue;const o=n(i,{icon:s}).addTo(t).bindPopup(r);this._operatorMarkers.set(e.device_id,o),console.info(`[dectyr-map-card] Operator marker added for: ${e.drone_name}`)}}for(const[t,e]of this._operatorMarkers.entries())if(!s.has(t)){try{e.remove()}catch{}this._operatorMarkers.delete(t)}}_updateTrails(){const t=this._map,e=this._L;if(!t||!e||this._disconnected)return;const i=Date.now(),s=this._liveDronesWithPosition(),n=new Set,r=e.polyline;for(const e of s){n.add(e.drone_id);let s=this._trailPoints.get(e.drone_id);s||(s=[],this._trailPoints.set(e.drone_id,s));const o=e.latitude,a=e.longitude,c=s[s.length-1];c&&c.lat===o&&c.lng===a||s.push({lat:o,lng:a,ts:i});const l=i-le.TRAIL_MAX_AGE_MS;for(;s.length>0&&s[0].ts<l;)s.shift();for(;s.length>le.TRAIL_MAX_POINTS;)s.shift();const d=this._trailLines.get(e.drone_id),h="#1565c0";if(s.length>=2){const i=s.map(t=>[t.lat,t.lng]);if(d)d.setLatLngs(i),d.setStyle({color:h,weight:3,opacity:.6});else{const s=r(i,{color:h,weight:3,opacity:.6}).addTo(t);this._trailLines.set(e.drone_id,s)}}else if(d){try{d.remove()}catch{}this._trailLines.delete(e.drone_id)}}for(const t of[...this._trailLines.keys()])if(!n.has(t)){const e=this._trailLines.get(t);try{e?.remove()}catch{}this._trailLines.delete(t),this._trailPoints.delete(t)}}_destroyMap(){void 0!==this._invalidateSizeTimer&&(window.clearTimeout(this._invalidateSizeTimer),this._invalidateSizeTimer=void 0);for(const t of this._operatorMarkers.values())try{t.remove()}catch{}this._operatorMarkers.clear();for(const t of this._trailLines.values())try{t.remove()}catch{}this._trailLines.clear(),this._trailPoints.clear();for(const t of this._droneMarkers.values())try{t.remove()}catch{}this._droneMarkers.clear();for(const t of this._scannerMarkers.values())try{t.remove()}catch{}if(this._scannerMarkers.clear(),this._homeCircle){try{this._homeCircle.remove()}catch(t){console.warn("[dectyr-map-card] Home circle cleanup error:",t)}this._homeCircle=null}if(this._map){console.info("[dectyr-map-card] Destroying map");try{this._map.remove()}catch(t){console.warn("[dectyr-map-card] Cleanup error:",t)}this._map=null}this._L=null,this._initStarted=!1,this._initLock=!1,this._lastAppliedCenterKey=""}render(){return this.config?B`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:map"></ha-icon>
          <span>${this.config.title??"Live Map"}</span>
        </div>
        <div class="map-shell" style=${Rt(this._mapShellStyles())}>
          <div class="map-container" ${Ot(this._mapContainerRef)}></div>
        </div>
      </ha-card>
    `:B``}static get styles(){return o`
      :host {
        display: block;
      }
      ha-card {
        overflow: hidden;
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        font-weight: 500;
        font-size: 1.1em;
        border-bottom: 1px solid var(--divider-color);
      }
      .card-header ha-icon {
        color: var(--primary-color);
      }
      .map-shell {
        position: relative;
        width: 100%;
      }
      .map-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        overflow: hidden;
        contain: layout size;
      }
    `}};pe.TRAIL_MAX_POINTS=30,pe.TRAIL_MAX_AGE_MS=18e5,t([ut({attribute:!1})],pe.prototype,"hass",void 0),t([pt()],pe.prototype,"config",void 0),pe=le=t([lt("dectyr-map-card")],pe),window.customCards=window.customCards||[],window.customCards.push({type:"dectyr-map-card",name:"Dectyr Map (debug)",description:"Minimal map card for debugging Leaflet integration",preview:!1,documentationURL:"https://github.com/alexandre0thomas/ha-dectyr"}),console.info("%c DECTYR-MAP-CARD %c v0.7.0 (resizable) ","color: white; background: #00569b; font-weight: 700;","color: #00569b; background: white; font-weight: 700;");const fe=(t,e,i)=>{const s=new Map;for(let n=e;n<=i;n++)s.set(t[n],n);return s},_e=At(class extends St{constructor(t){if(super(t),t.type!==wt)throw Error("repeat() can only be used in text expressions")}dt(t,e,i){let s;void 0===i?i=e:void 0!==e&&(s=e);const n=[],r=[];let o=0;for(const e of t)n[o]=s?s(e,o):o,r[o]=i(e,o),o++;return{values:r,keys:n}}render(t,e,i){return this.dt(t,e,i).values}update(t,[e,i,s]){const n=(t=>t._$AH)(t),{values:r,keys:o}=this.dt(e,i,s);if(!Array.isArray(n))return this.ut=o,r;const a=this.ut??=[],c=[];let l,d,h=0,u=n.length-1,p=0,f=r.length-1;for(;h<=u&&p<=f;)if(null===n[h])h++;else if(null===n[u])u--;else if(a[h]===o[p])c[p]=yt(n[h],r[p]),h++,p++;else if(a[u]===o[f])c[f]=yt(n[u],r[f]),u--,f--;else if(a[h]===o[f])c[f]=yt(n[h],r[f]),gt(t,c[f+1],n[h]),h++,f--;else if(a[u]===o[p])c[p]=yt(n[u],r[p]),gt(t,n[h],n[u]),u--,p++;else if(void 0===l&&(l=fe(o,p,f),d=fe(a,h,u)),l.has(a[h]))if(l.has(a[u])){const e=d.get(o[p]),i=void 0!==e?n[e]:null;if(null===i){const e=gt(t,n[h]);yt(e,r[p]),c[p]=e}else c[p]=yt(i,r[p]),gt(t,n[h],i),n[e]=null;p++}else bt(n[u]),u--;else bt(n[h]),h++;for(;p<=f;){const e=gt(t,c[f+1]);yt(e,r[p]),c[p++]=e}for(;h<=u;){const t=n[h++];null!==t&&bt(t)}return this.ut=o,$t(t,c),G}}),me=o`
  :host {
    --dectyr-radius: 12px;
    --dectyr-muted: var(--secondary-text-color);
    --dectyr-border-subtle: 1px solid var(--divider-color);
    --dectyr-live-border: 1px solid var(--success-color, #4caf50);
    --dectyr-offline-border: 1px solid var(--disabled-color, #9e9e9e);
    --dectyr-row-bg: var(--secondary-background-color);
  }
`,ge=o`
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
`,ye=o`
  .distance-badge {
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 0.85em;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    white-space: nowrap;
    color: white;
  }
  .distance-far {
    background: #4caf50;
  }
  .distance-medium {
    background: #ff9800;
  }
  .distance-close {
    background: #f44336;
  }
  .distance-unknown {
    background: #9e9e9e;
  }
`;const ve={FRA:"FR",USA:"US",GBR:"GB",DEU:"DE",ITA:"IT",ESP:"ES",NLD:"NL",BEL:"BE",UKR:"UA",POL:"PL",CHE:"CH",AUT:"AT",CAN:"CA",AUS:"AU",JPN:"JP",CHN:"CN",IND:"IN",BRA:"BR",MEX:"MX",SWE:"SE",NOR:"NO",DNK:"DK",FIN:"FI",IRL:"IE",PRT:"PT",GRC:"GR",CZE:"CZ",SVK:"SK",HUN:"HU",ROU:"RO",BGR:"BG",HRV:"HR",SVN:"SI",LUX:"LU",MLT:"MT",CYP:"CY",EST:"EE",LVA:"LV",LTU:"LT",ISL:"IS",LIE:"LI",MCO:"MC",AND:"AD",SMR:"SM",VAT:"VA",RUS:"RU",TUR:"TR",ISR:"IL",ARE:"AE",SAU:"SA",ZAF:"ZA",EGY:"EG",MAR:"MA",DZA:"DZ",TUN:"TN",NGA:"NG",KEN:"KE",ARG:"AR",CHL:"CL",COL:"CO",PER:"PE",NZL:"NZ",KOR:"KR",TWN:"TW",SGP:"SG",MYS:"MY",THA:"TH",VNM:"VN",IDN:"ID",PHL:"PH"};let $e=class extends at{constructor(){super(...arguments),this.isNew=!1,this.compact=!1}render(){const t=this.drone.is_live,e=this.isNew?" is-new":"";return B`
      <div
        class="drone-card ${t?"live":"offline"}${e}"
        @click=${this._onClick}
        role="button"
        tabindex="0"
        @keydown=${this._onKeydown}
      >
        <div class="header">
          <ha-icon
            icon=${t?"mdi:quadcopter":this._iconForManufacturer()}
            class="drone-icon"
          ></ha-icon>
          <div class="title-block">
            <div class="title">${this.drone.display_name}</div>
            <div class="subtitle">${this.drone.drone_id}</div>
          </div>
          ${t?this._renderDistanceBadge():this._renderOfflineBadge()}
        </div>
        ${t?this._renderTelemetryLine():""}
        ${this._renderOperatorLine()}
      </div>
    `}_onKeydown(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._onClick())}_onClick(){this.dispatchEvent(new CustomEvent("dectyr-drone-clicked",{detail:{drone_id:this.drone.drone_id},bubbles:!0,composed:!0}))}_iconForManufacturer(){const t=(this.drone.manufacturer||"").toLowerCase();return t.includes("dji")?"mdi:dji":t.includes("parrot")?"mdi:parrot":"mdi:quadcopter"}_renderDistanceBadge(){const t="number"==typeof(e=this.drone.distance_to_scanner)&&isFinite(e)?e>500?"distance-far":e>250?"distance-medium":"distance-close":"distance-unknown";var e,i;return B`
      <span class="distance-badge ${t}">
        <ha-icon icon="mdi:map-marker-distance"></ha-icon>
        ${i=this.drone.distance_to_scanner,"number"==typeof i&&isFinite(i)?i<1e3?`${Math.round(i)}m`:`${(i/1e3).toFixed(1)}km`:"—"}
      </span>
    `}_renderOfflineBadge(){return B`
      <span class="rssi-badge rssi-unknown">${function(t){if(!t||Number.isNaN(t.getTime()))return"offline";const e=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(e<60)return`offline · ${e}s ago`;const i=Math.floor(e/60);return i<60?`offline · ${i}min ago`:`offline · ${Math.floor(i/60)}h ago`}(this.drone.last_seen)}</span>
    `}_renderTelemetryLine(){const t=[],e=this.drone.altitude_agl??this.drone.altitude_msl;var i,s,n;return null===e||Number.isNaN(e)||t.push(null===(i=e)||Number.isNaN(i)?"—":`${i.toFixed(0)}m`),null===this.drone.speed_horizontal||Number.isNaN(this.drone.speed_horizontal)||t.push(null===(s=this.drone.speed_horizontal)||Number.isNaN(s)?"—":`${s.toFixed(1)} m/s`),null===this.drone.direction||Number.isNaN(this.drone.direction)||t.push(null===(n=this.drone.direction)||Number.isNaN(n)?"—":`${n.toFixed(0)}°`),0===t.length?B``:B`
      <div class="telemetry-line">
        <ha-icon icon="mdi:trending-up" class="telemetry-icon"></ha-icon>
        <span>${t.join(" · ")}</span>
      </div>
    `}_renderOperatorLine(){if(!this.drone.is_live){const t=this.drone.last_seen,e=t?`Last seen ${function(t){const e=new Date,i=Math.floor((e.getTime()-t.getTime())/1e3);if(i<60)return"just now";if(i<3600){const t=Math.floor(i/60);return`${t} minute${1!==t?"s":""} ago`}if(i<86400){const t=Math.floor(i/3600);return`${t} hour${1!==t?"s":""} ago`}const s=Math.floor(i/86400);return`${s} day${1!==s?"s":""} ago`}(t)}`:"Offline";return B`
        <div class="operator-line offline-line">
          <ha-icon icon="mdi:account-clock" class="op-icon"></ha-icon>
          <span>${e}</span>
        </div>
      `}const t=this.drone.operator_id,e=this.drone.operator_country,i=e?function(t){if(!t)return"";const e=t.toUpperCase().trim(),i=ve[e];if(!i||2!==i.length)return t;const s=127462,n="A".charCodeAt(0);return String.fromCodePoint(s+i.charCodeAt(0)-n,s+i.charCodeAt(1)-n)}(e):"";return B`
      <div class="operator-line">
        <ha-icon icon="mdi:account" class="op-icon"></ha-icon>
        ${t?B`<span class="op">${t}</span>`:""}
        ${e?B`<span class="flag" title=${e}>${i} ${e}</span>`:""}
        ${this._renderEuClassification()}
        ${this.drone.multi_source?B`<span class="hint" title="Multi-source">· multi</span>`:""}
      </div>
    `}_renderEuClassification(){const t=(e=this.drone.category_eu)?e.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):null;var e;const i=this.drone.class_eu;if(!t&&!i)return B``;const s=i&&i.length>0?i.charAt(0).toUpperCase()+i.slice(1):"—";return B`<span class="eu">${s} / ${t??"—"}</span>`}static get styles(){return[me,ge,ye,o`
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
        .drone-icon {
          --mdc-icon-size: 28px;
          color: var(--primary-color);
          flex-shrink: 0;
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
      `]}};function be(t,e){return t.is_live!==e.is_live?t.is_live?-1:1:t.drone_id.localeCompare(e.drone_id,void 0,{sensitivity:"base",numeric:!0})}t([ut({type:Object})],$e.prototype,"drone",void 0),t([ut({type:Boolean,reflect:!0})],$e.prototype,"isNew",void 0),t([ut({type:Boolean})],$e.prototype,"compact",void 0),$e=t([lt("dectyr-drone-card")],$e);let Ce=class extends at{constructor(){super(...arguments),this.drones=[],this.newDroneIds=new Set}render(){const t=[...this.drones].sort(be);return B`
      <div class="list">
        ${_e(t,t=>t.drone_id,t=>B`
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
    `}};t([ut({type:Array})],Ce.prototype,"drones",void 0),t([ut({attribute:!1})],Ce.prototype,"newDroneIds",void 0),Ce=t([lt("dectyr-drone-list")],Ce);let we=class extends at{constructor(){super(...arguments),this.label="",this.value=""}render(){return B`
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
    `}};t([ut({type:String})],we.prototype,"label",void 0),t([ut({type:String})],we.prototype,"value",void 0),we=t([lt("dectyr-stat-tile")],we);const Ae="a",Se="lc",xe="lu";function ke(t,e){const i=void 0!==e[Se]?new Date(1e3*e[Se]).toISOString():void 0,s=void 0!==e[xe]?new Date(1e3*e[xe]).toISOString():i??(new Date).toISOString();let n;const r=e.c;return n="string"==typeof r?{id:r,parent_id:null,user_id:null}:r&&"object"==typeof r?{id:r.id??"",parent_id:r.parent_id??null,user_id:r.user_id??null}:{id:"",parent_id:null,user_id:null},{entity_id:t,state:e.s??"unknown",attributes:{...e[Ae]??{}},context:n,last_changed:i??s,last_updated:s}}let Ee=class extends at{constructor(){super(...arguments),this._hideInactive=!1,this._newDroneIds=new Set,this._headerLogoUrl=Gt,this._previousDroneIds=null,this._newDroneClearTimers=new Map,this._entityOverlay={},this._subscribedIdsKey="",this._subscriptionGeneration=0}setConfig(t){if(!t)throw new Error("Invalid configuration");this.config=t}getCardSize(){return 14}disconnectedCallback(){this._disconnectEntitySubscription();for(const t of this._newDroneClearTimers.values())window.clearTimeout(t);this._newDroneClearTimers.clear(),super.disconnectedCallback()}willUpdate(t){if(super.willUpdate(t),t.has("hass")&&this.hass){const t=ne(this.hass,t=>this._getMergedState(t));this._detectNewDrones(t)}}updated(t){super.updated(t),t.has("hass")&&this.hass?.connected&&this._syncEntitySubscription()}_getMergedState(t){return this._entityOverlay[t]??this.hass?.states[t]}async _disconnectEntitySubscription(){if(this._unsubEntities){try{await this._unsubEntities()}catch{}this._unsubEntities=void 0}this._entityOverlay={}}async _syncEntitySubscription(){if(!this.hass?.connected)return;const t=++this._subscriptionGeneration,e=function(t){const e=t.entities;if(!e)return[];const i=[];for(const[t,s]of Object.entries(e))s.platform===jt&&i.push(t);return i}(this.hass),i=[...e].sort().join("\n");if((i!==this._subscribedIdsKey||!this._unsubEntities)&&(await this._disconnectEntitySubscription(),t===this._subscriptionGeneration&&(this._subscribedIdsKey=i,0!==e.length)))try{const t=this.hass.connection;this._unsubEntities=await t.subscribeMessage(t=>{"event"===t.type&&t.event&&"object"==typeof t.event&&(!function(t,e){if(e.a)for(const[i,s]of Object.entries(e.a))t[i]=ke(i,s);if(e.r)for(const i of e.r)delete t[i];if(e.c)for(const[i,s]of Object.entries(e.c)){let e=t[i];if(!e)continue;e={...e,attributes:{...e.attributes}};const n=s["+"],r=s["-"];if(void 0!==n?.s&&(e.state=n.s),void 0!==n?.[Se]){const t=new Date(1e3*n[Se]).toISOString();e.last_changed=t,e.last_updated=t}else void 0!==n?.[xe]&&(e.last_updated=new Date(1e3*n[xe]).toISOString());if(void 0!==n?.c){const t=n.c;"string"==typeof t?e.context={...e.context,id:t}:t&&"object"==typeof t&&(e.context={...e.context,...t})}if(n?.[Ae]&&Object.assign(e.attributes,n[Ae]),r?.[Ae])for(const t of r[Ae])delete e.attributes[t];t[i]=e}}(this._entityOverlay,t.event),this.requestUpdate())},{type:"subscribe_entities",entity_ids:e})}catch(t){console.warn("Dectyr Surveillance: subscribe_entities failed",t),this._subscribedIdsKey=""}}_detectNewDrones(t){const e=new Set(t.map(t=>t.drone_id));if(null===this._previousDroneIds)return void(this._previousDroneIds=e);let i=!1;for(const t of e)if(!this._previousDroneIds.has(t)){this._newDroneIds=new Set(this._newDroneIds).add(t),i=!0;const e=this._newDroneClearTimers.get(t);void 0!==e&&window.clearTimeout(e);const s=window.setTimeout(()=>{const e=new Set(this._newDroneIds);e.delete(t),this._newDroneIds=e,this._newDroneClearTimers.delete(t),this.requestUpdate()},2e3);this._newDroneClearTimers.set(t,s)}this._previousDroneIds=e,i&&this.requestUpdate()}_onHideInactive(t){const e=t.target;this._hideInactive=Boolean(e.checked)}_onHeaderLogoError(){this._headerLogoUrl===Gt?this._headerLogoUrl=Kt:this._headerLogoUrl===Kt&&(this._headerLogoUrl=Vt)}render(){if(!this.hass||!this.config)return B`<ha-card><div class="card-content">Loading…</div></ha-card>`;const t=t=>this._getMergedState(t),e=ie(this.hass,t),i=ne(this.hass,t),s=i.filter(t=>t.is_live).length,n=this._hideInactive?i.filter(t=>t.is_live):i;return B`
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
          ${e.length?B`
                <div class="scanners-block">
                  <div class="section-title">Scanners</div>
                  <div class="scanner-list">
                    ${e.map(t=>B`
                        <div class="scanner-row">
                          <span class="dot ${t.is_online?"on":""}"></span>
                          <span class="sname">${t.name}</span>
                          ${null!=t.cpu_temp?B`<span class="meta">${t.cpu_temp.toFixed(0)}°C</span>`:""}
                          ${null!=t.battery?B`<span class="meta">${t.battery.toFixed(0)}%</span>`:""}
                        </div>
                      `)}
                  </div>
                </div>
              `:""}
          <div class="section-title">Drones</div>
          ${i.length>0?B`
                <dectyr-drone-list
                  .drones=${n}
                  .newDroneIds=${this._newDroneIds}
                ></dectyr-drone-list>
              `:B`<div class="empty">No drones detected yet.</div>`}
        </div>
      </ha-card>
    `}static get styles(){return[me,o`
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
      `]}};t([ut({attribute:!1})],Ee.prototype,"hass",void 0),t([pt()],Ee.prototype,"config",void 0),t([pt()],Ee.prototype,"_hideInactive",void 0),t([pt()],Ee.prototype,"_newDroneIds",void 0),t([pt()],Ee.prototype,"_headerLogoUrl",void 0),Ee=t([lt("dectyr-surveillance-card")],Ee),window.customCards=window.customCards||[],window.customCards.push({type:"dectyr-surveillance-card",name:"Dectyr Surveillance",description:"Live drone surveillance dashboard for Dectyr RX-5 detectors",preview:!1,documentationURL:"https://github.com/alexandre0thomas/ha-dectyr"}),console.info("%c DECTYR-SURVEILLANCE-CARD %c F3 ","color: white; background: #00569b; font-weight: 700;","color: #00569b; background: white; font-weight: 700;");export{Ee as DectyrSurveillanceCard};
