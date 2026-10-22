const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dist=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
for(const reduced of [false,true]){
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'http://localhost/'}),w=dom.window;w.matchMedia=q=>({matches:q.includes('reduced-motion')?reduced:false,addEventListener(){}});
 const anims=new WeakMap();w.Element.prototype.animate=function(){const a={playState:'running',pause(){this.playState='paused'},play(){this.playState='running'},cancel(){this.playState='idle'}};anims.set(this,[...(anims.get(this)||[]),a]);return a};w.Element.prototype.getAnimations=function(){return anims.get(this)||[]};
 w.eval(fs.readFileSync(path.join(dist,'app.js'),'utf8'));
 const d=w.document,menu=d.querySelector('.menu');menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(menu.getAttribute('aria-expanded'),'false');
 const tabs=[...d.querySelectorAll('[role=tab]')];for(const tab of tabs){tab.click();assert.equal(tab.getAttribute('aria-selected'),'true');assert.equal(d.querySelectorAll('[aria-selected=true]').length,1);assert.equal(d.querySelector('[role=tabpanel]').getAttribute('aria-labelledby'),tab.id);assert(d.querySelector('[role=tabpanel] h3').textContent.length>5)}
 tabs[4].dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));assert.equal(tabs[0].getAttribute('aria-selected'),'true');tabs[0].dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(tabs[1].getAttribute('aria-selected'),'true');
 const control=d.querySelector('#motion');if(!reduced){control.click();assert.match(control.textContent,/Continue/);assert.equal(d.querySelector('#vehicle').getAnimations()[0].playState,'paused');control.click();assert.match(control.textContent,/Pause/)}else{assert.equal(d.querySelector('#vehicle').getAnimations().length,0);control.click();assert.match(control.textContent,/next stop/)}
 for(const a of d.querySelectorAll('a[href^="#"]'))assert(d.querySelector(a.getAttribute('href')),'Missing anchor '+a.href);
 for(const img of d.querySelectorAll('img')){assert(img.hasAttribute('alt'));assert(fs.existsSync(path.join(dist,img.getAttribute('src'))));}
 dom.window.close();
}
const doc=new JSDOM(html).window.document;assert.equal(doc.querySelectorAll('h1').length,1);
for(const el of doc.querySelectorAll('script[src],link[href]')){const u=el.getAttribute('src')||el.getAttribute('href');if(!u.startsWith('http'))assert(fs.existsSync(path.join(dist,u)),u)}
const ids=[...doc.querySelectorAll('[id]')].map(el=>el.id);const dup=ids.filter((v,i)=>ids.indexOf(v)!==i);console.log('Duplicate IDs:',[...new Set(dup)]);assert.equal(dup.length,0,'Duplicate IDs');
console.log('PASS: menu, Escape, all 5 categories, keyboard tabs, motion pause/resume, reduced motion, anchors, image alternatives and local assets.');
