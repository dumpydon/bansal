const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dist=path.resolve(__dirname,'../dist');
function create(reduced=false){
 const dom=new JSDOM(fs.readFileSync(path.join(dist,'index.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.matchMedia=()=>({matches:reduced,addEventListener(){}});
 let pending=new Map(),counter=0;w.setTimeout=(fn,ms)=>{assert.equal(ms,2000);pending.set(++counter,fn);return counter};w.clearTimeout=id=>pending.delete(id);
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 w.eval(fs.readFileSync(path.join(dist,'catalog-data.js'),'utf8'));w.eval(fs.readFileSync(path.join(dist,'catalog.js'),'utf8'));
 return {dom,w,d:w.document,pending,tick(){assert.equal(pending.size,1,'Exactly one slideshow timer');let [id,fn]=[...pending][0];pending.delete(id);fn()}};
}
let {dom,w,d,pending,tick}=create();const data=w.BANSAL_CATALOG,photos=data.products.filter(p=>p.image);assert.equal(data.brands.length,7);assert(data.products.length>=200);assert.equal(new Set(data.products.map(p=>p.id)).size,data.products.length);
for(let i=0;i<photos.length;i++){assert.equal(d.querySelector('#catalog-featured').getAttribute('href'),photos[i].url);assert.equal(d.querySelector('#showcase-name').textContent,photos[i].name);tick()}
assert.equal(d.querySelector('#showcase-name').textContent,photos[0].name,'Whole catalogue loops to first company');
d.querySelector('#catalog-play').click();assert.equal(pending.size,0,'Pause cancels timer');d.querySelector('#catalog-play').click();assert.equal(pending.size,1);
d.querySelector('#catalog-next').click();assert.equal(pending.size,0,'Manual navigation pauses playback');
d.querySelector('[data-category="biscuits"]').click();assert.equal(d.querySelector('#showcase-brand').textContent,'Priyagold');assert.equal(d.querySelector('[data-category="biscuits"]').getAttribute('aria-pressed'),'true');assert(d.querySelector('[data-category="biscuits"]').parentElement.querySelector('a').href.includes('priyagold.com'));
const brandButton=d.querySelector('[data-brand="bikano"]');brandButton.click();assert(d.querySelector('#catalog-dialog').open);assert.equal(d.querySelector('#catalog-brand-filter').value,'bikano');assert.equal(d.querySelectorAll('.catalog-card').length,24);assert.equal(pending.size,0,'Modal stops automatic cycling');assert.equal(d.activeElement.id,'catalog-search');
const search=d.querySelector('#catalog-search');search.value='aloo bhujia';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.catalog-card').length,1);assert.match(d.querySelector('.catalog-card h3').textContent,/Aloo Bhujia/);assert(d.querySelector('#catalog-dialog-official').href.includes('bikano'));
search.value='no-match-zzz';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.catalog-card').length,0);assert(d.querySelector('.catalog-empty'));
search.value='';search.dispatchEvent(new w.Event('input'));d.querySelector('#catalog-more').click();assert.equal(d.querySelectorAll('.catalog-card').length,48);
search.value='refill';search.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert(!d.querySelector('#catalog-dialog').open);assert.equal(d.activeElement,brandButton,'Focus returns to opener');
for(const brand of data.brands){d.querySelector(`[data-brand="${brand.id}"]`).click();assert.equal(d.querySelector('#catalog-brand-filter').value,brand.id);assert(d.querySelectorAll('.catalog-card').length>0);d.querySelector('#catalog-close').click()}
for(const p of data.products){for(const asset of [p.image,p.thumb].filter(Boolean)){assert(fs.existsSync(path.join(dist,asset)),`Missing ${asset}`);assert(fs.statSync(path.join(dist,asset)).size>100,`Empty ${asset}`)}assert(p.url.startsWith('https://'),'Official links use HTTPS')}
dom.window.close();
({dom,w,d,pending,tick}=create(true));assert.equal(pending.size,0,'Reduced-motion users start with a still product');d.querySelector('#catalog-next').click();assert.equal(pending.size,0);d.querySelector('#catalog-play').click();assert.equal(pending.size,1,'Explicit Play permits image changes');dom.window.close();
console.log(`PASS: ${data.products.length} catalogue entries, ${photos.length} product images; full brand loop, 2s timing, filters, search, pagination, modal focus, Escape, pause and reduced motion.`);
