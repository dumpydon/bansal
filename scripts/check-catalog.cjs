const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dist=path.resolve(__dirname,'../dist');
function create(reduced=false){
 const dom=new JSDOM(fs.readFileSync(path.join(dist,'index.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.matchMedia=()=>({matches:reduced,addEventListener(){}});
 let pending=new Map(),counter=0,now=0;
 Object.defineProperty(w.performance,'now',{value:()=>now});
 w.setTimeout=(fn,ms)=>{assert(Number.isFinite(ms)&&ms>0);pending.set(++counter,{fn,at:now+ms,delay:ms});return counter};w.clearTimeout=id=>pending.delete(id);
 function advance(ms){const until=now+ms;for(;;){const next=[...pending].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>until)break;now=next[1].at;pending.delete(next[0]);next[1].fn()}now=until}
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 w.eval(fs.readFileSync(path.join(dist,'catalog-data.js'),'utf8'));w.eval(fs.readFileSync(path.join(dist,'catalog.js'),'utf8'));
 return {dom,w,d:w.document,pending,advance,tick(){assert.equal(pending.size,1,'Exactly one slideshow timer');advance([...pending.values()][0].at-now)}};
}
let {dom,w,d,pending,tick}=create();const data=w.BANSAL_CATALOG,photos=data.products.filter(p=>p.image);assert.equal(data.brands.length,7);assert(data.products.length>=200);assert.equal(new Set(data.products.map(p=>p.id)).size,data.products.length);
const imageArea=d.querySelector('#catalog-image-area');assert.equal(imageArea.querySelectorAll('img').length,5,'Five product images are visible');assert.equal(imageArea.querySelectorAll('a,button').length,5,'All five products have an interactive control');
for(let i=0;i<photos.length;i++){
 assert.equal([...pending.values()][0].delay,2000,'Normal slideshow interval is two seconds');
 assert.equal(d.querySelector('#catalog-featured').getAttribute('href'),photos[i].url);assert.equal(d.querySelector('#showcase-name').textContent,photos[i].name);
 for(const button of imageArea.querySelectorAll('[data-offset]')){const expected=photos[(i+Number(button.dataset.offset)+photos.length)%photos.length];assert.equal(button.querySelector('img').getAttribute('src'),expected.image);assert(button.getAttribute('aria-label').includes(expected.name));assert.equal(button.tabIndex,0,'Side products are keyboard accessible')}
 tick();
}
assert.equal(d.querySelector('#showcase-name').textContent,photos[0].name,'Whole catalogue loops to first company');
d.querySelector('#catalog-play').click();assert.equal(pending.size,0,'Pause cancels timer');d.querySelector('#catalog-play').click();assert.equal(pending.size,1);
d.querySelector('#catalog-next').click();assert.equal(pending.size,1,'Manual navigation uses a timed hold');assert.equal([...pending.values()][0].delay,7000);
d.querySelector('[data-category="biscuits"]').click();assert.equal(d.querySelector('#showcase-brand').textContent,'Priyagold');assert.equal(d.querySelector('[data-category="biscuits"]').getAttribute('aria-pressed'),'true');assert(d.querySelector('[data-category="biscuits"]').parentElement.querySelector('a').href.includes('priyagold.com'));
const brandButton=d.querySelector('[data-brand="bikano"]');brandButton.click();assert(d.querySelector('#catalog-dialog').open);assert.equal(d.querySelector('#catalog-brand-filter').value,'bikano');assert.equal(d.querySelectorAll('.catalog-card').length,24);assert.equal(pending.size,0,'Modal stops automatic cycling');assert.equal(d.activeElement.id,'catalog-search');
const search=d.querySelector('#catalog-search');search.value='aloo bhujia';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.catalog-card').length,1);assert.match(d.querySelector('.catalog-card h3').textContent,/Aloo Bhujia/);assert(d.querySelector('#catalog-dialog-official').href.includes('bikano'));
search.value='no-match-zzz';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.catalog-card').length,0);assert(d.querySelector('.catalog-empty'));
search.value='';search.dispatchEvent(new w.Event('input'));d.querySelector('#catalog-more').click();assert.equal(d.querySelectorAll('.catalog-card').length,48);
search.value='refill';search.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert(!d.querySelector('#catalog-dialog').open);assert.equal(d.activeElement,brandButton,'Focus returns to opener');
for(const brand of data.brands){d.querySelector(`[data-brand="${brand.id}"]`).click();assert.equal(d.querySelector('#catalog-brand-filter').value,brand.id);assert(d.querySelectorAll('.catalog-card').length>0);d.querySelector('#catalog-close').click()}
for(const p of data.products){for(const asset of [p.image,p.thumb].filter(Boolean)){assert(fs.existsSync(path.join(dist,asset)),`Missing ${asset}`);assert(fs.statSync(path.join(dist,asset)).size>100,`Empty ${asset}`)}assert(p.url.startsWith('https://'),'Official links use HTTPS')}
dom.window.close();
// Selecting either neighbouring pair centres that exact product, including across the loop boundary.
({dom,w,d,pending,tick}=create());
const firstSide=d.querySelector('[data-offset="-2"]');firstSide.focus();assert.equal(pending.size,0,'Keyboard focus on a side product pauses playback');
d.querySelector('[data-offset="1"]').focus();assert.equal(pending.size,0,'Moving between products keeps playback paused');
d.querySelector('#catalog-play').focus();assert.equal(pending.size,1,'Playback resumes after focus leaves the five products');
let selected=0;
for(const offset of [-2,-1,1,2]){selected=(selected+offset+photos.length)%photos.length;d.querySelector(`[data-offset="${offset}"]`).click();assert.equal(d.querySelector('#showcase-name').textContent,photos[selected].name);assert.equal(d.querySelector('#catalog-featured-image').getAttribute('src'),photos[selected].image);assert.equal(d.querySelector('#catalog-featured').getAttribute('href'),photos[selected].url);assert.equal(pending.size,1,'Side selection keeps one automatic resume timer');assert.equal([...pending.values()][0].delay,7000)}
d.querySelector('[data-category="extras"]').click();const drinks=photos.filter(p=>p.category==='extras');assert(drinks.length>=1);
for(const offset of [-2,-1,1,2]){const expected=drinks[((offset%drinks.length)+drinks.length)%drinks.length];assert.equal(d.querySelector(`[data-offset="${offset}"] img`).getAttribute('src'),expected.image,'Short category wraps both neighbouring pairs correctly')}
dom.window.close();
// Clicks get exactly seven seconds, including when the same product stays hovered and focused.
const timed=create(),area=timed.d.querySelector('#catalog-image-area');
const name=()=>timed.d.querySelector('#showcase-name').textContent;
area.dispatchEvent(new timed.w.Event('pointerenter'));
const outer=timed.d.querySelector('[data-offset="-2"]');outer.focus();assert.equal(timed.pending.size,0);
outer.click();const chosen=name();assert.equal([...timed.pending.values()][0].delay,7000);
assert.equal(timed.d.querySelector('.catalog-progress').style.getPropertyValue('--catalog-interval'),'7000ms','Progress bar matches the seven-second hold');
timed.advance(6999);assert.equal(name(),chosen,'Selection stays visible for the entire hold');
timed.advance(1);assert.notEqual(name(),chosen,'Resume exactly after seven seconds despite hover and focus');
const resumed=name();timed.advance(1999);assert.equal(name(),resumed);timed.advance(1);assert.notEqual(name(),resumed,'Return to the normal two-second interval');
timed.d.querySelector('[data-offset="2"]').click();timed.advance(3000);
timed.d.querySelector('[data-offset="-1"]').click();const newest=name();
timed.advance(6999);assert.equal(name(),newest,'A new click restarts the seven-second hold');
timed.advance(1);assert.notEqual(name(),newest);assert.equal(timed.pending.size,1,'Repeated selections never leave duplicate timers');
timed.d.querySelector('[data-offset="1"]').click();timed.advance(3000);timed.d.querySelector('#catalog-play').click();
const paused=name();assert.equal(timed.pending.size,0);timed.advance(20000);assert.equal(name(),paused,'Explicit Pause overrides automatic resume');
timed.d.querySelector('[data-offset="-2"]').click();const pausedSelection=name();timed.advance(9000);assert.equal(name(),pausedSelection,'Product selection preserves an explicit pause');
timed.d.querySelector('#catalog-play').click();assert.equal([...timed.pending.values()][0].delay,2000);timed.advance(2000);assert.notEqual(name(),pausedSelection);
timed.d.querySelector('[data-offset="1"]').click();const hiddenSelection=name();
Object.defineProperty(timed.d,'hidden',{configurable:true,value:true});timed.d.dispatchEvent(new timed.w.Event('visibilitychange'));assert.equal(timed.pending.size,0);
timed.advance(8000);assert.equal(name(),hiddenSelection,'Do not cycle in a hidden tab');
Object.defineProperty(timed.d,'hidden',{configurable:true,value:false});timed.d.dispatchEvent(new timed.w.Event('visibilitychange'));assert.equal([...timed.pending.values()][0].delay,2000);
timed.advance(2000);assert.notEqual(name(),hiddenSelection,'Resume normally when the tab returns after the hold');
const centre=timed.d.querySelector('#catalog-featured');centre.addEventListener('click',event=>event.preventDefault(),{once:true});centre.click();assert.equal([...timed.pending.values()][0].delay,7000,'Centre product clicks also get seven seconds');
timed.dom.window.close();
({dom,w,d,pending,tick}=create(true));assert.equal(pending.size,0,'Reduced-motion users start with a still product');d.querySelector('#catalog-next').click();assert.equal(pending.size,0);d.querySelector('#catalog-play').click();assert.equal(pending.size,1,'Explicit Play permits image changes');dom.window.close();
console.log(`PASS: ${data.products.length} catalogue entries, ${photos.length} product images; five clickable products, seven-second click holds, automatic two-second resume despite hover/focus, repeated selections, explicit pause, hidden tabs, full brand loop, filters, search, pagination, modal focus, Escape and reduced motion.`);
