(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const menu = $('.menu'), nav = $('#navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent='Menu +'; }
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close −':'Menu +';});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
  $('#year').textContent=new Date().getFullYear();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window&&!reduced.matches){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));}
  const vehicle=$('#vehicle'), replay=$('#motion');let animation=null;
  function runJourney(){
    if(animation&&animation.playState==='running'){animation.pause();vehicle.querySelectorAll('.spokes').forEach(w=>w.getAnimations().forEach(a=>a.pause()));replay.textContent='▷ Continue the journey';replay.setAttribute('aria-label','Continue the delivery animation');return;}
    if(animation&&animation.playState==='paused'){animation.play();vehicle.querySelectorAll('.spokes').forEach(w=>w.getAnimations().forEach(a=>a.play()));replay.textContent='Ⅱ Pause the journey';replay.setAttribute('aria-label','Pause the delivery animation');return;}
    if(reduced.matches){vehicle.setAttribute('transform','translate(645 573)');replay.textContent='✓ At the next stop';return;}
    vehicle.querySelectorAll('.spokes').forEach(w=>w.getAnimations().forEach(a=>a.cancel()));
    animation=vehicle.animate([{transform:'translate(505px, 573px)'},{transform:'translate(645px, 573px)'}],{duration:3900,easing:'cubic-bezier(.35,0,.2,1)',fill:'forwards'});
    for(const wheel of vehicle.querySelectorAll('.spokes'))wheel.animate([{transform:'rotate(0deg)'},{transform:'rotate(334deg)'}],{duration:3900,easing:'cubic-bezier(.35,0,.2,1)',fill:'forwards'});
    replay.textContent='Ⅱ Pause the journey';replay.setAttribute('aria-label','Pause the delivery animation');
    animation.onfinish=()=>{replay.textContent='↻ Replay the journey';replay.setAttribute('aria-label','Replay the delivery animation');};
  }
  replay.addEventListener('click',runJourney);
  if(vehicle.animate&&!reduced.matches)runJourney();
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&animation?.playState==='running'){animation.pause();vehicle.querySelectorAll('.spokes').forEach(w=>w.getAnimations().forEach(a=>a.pause()));replay.textContent='▷ Continue the journey';}});
  reduced.addEventListener('change',()=>{if(reduced.matches){animation?.cancel();vehicle.querySelectorAll('.spokes').forEach(w=>w.getAnimations().forEach(a=>a.cancel()));document.documentElement.classList.remove('js-motion');replay.textContent='View the next stop';}});
  const biscuitArt=`<div class="range-illustration"><svg viewBox="0 0 460 250" role="img" aria-label="Original illustration of layered wafers and biscuits"><ellipse cx="227" cy="219" rx="166" ry="13" fill="#795c3f" opacity=".1"/><g transform="translate(40 47) rotate(-12 130 90)"><path d="M20 85L184 40L303 91L137 140Z" fill="#d4ac6c" stroke="#9a754b"/><path d="M20 85v55l117 56v-56Z" fill="#d6af77" stroke="#9a754b"/><path d="M137 140l166-49v55l-166 50Z" fill="#bd8e51" stroke="#9a754b"/>${[0,1,2,3].map(i=>`<path d="M20 ${97+i*12}l117 55 166-49" fill="none" stroke="${i%2?'#f1d7a3':'#765034'}" stroke-width="5"/>`).join('')}${Array.from({length:10},(_,i)=>`<path d="M${35+i*16} ${81-i*4.4}l117 55" stroke="#b1854d" stroke-width="2"/>`).join('')}${Array.from({length:7},(_,i)=>`<path d="M${33+i*17} ${91+i*7.6}l160-47" stroke="#ecd19b" stroke-width="2"/>`).join('')}</g><g transform="translate(310 155) rotate(16)"><circle r="57" fill="#d8af72" stroke="#a77b48" stroke-width="3"/><circle r="48" fill="none" stroke="#b48753" stroke-width="2" stroke-dasharray="2 5"/><circle r="35" fill="none" stroke="#bb8e58"/>${[-1,0,1].map(i=>[-1,0,1].map(j=>`<circle cx="${i*17}" cy="${j*17}" r="2" fill="#a77b48"/>`).join('')).join('')}</g></svg></div>`;
  const babyArt=`<div class="range-illustration"><svg viewBox="0 0 460 250" role="img" aria-label="Original illustration of a folded baby diaper and a cotton sprig"><ellipse cx="230" cy="221" rx="125" ry="10" fill="#795c3f" opacity=".08"/><path d="M129 65Q230 40 331 65L310 149Q276 165 262 209H200Q184 168 150 149Z" fill="#fffcf3" stroke="#bea98d" stroke-width="2"/><path d="M140 68Q230 87 320 68M146 83Q230 102 314 83M150 98Q230 115 310 98" fill="none" stroke="#d4c7b3" stroke-width="2"/><path d="M150 143Q189 164 207 205M310 143Q274 164 255 205" stroke="#c9bba7" fill="none" stroke-width="5"/><path d="M192 125q38-12 76 0v37q-38-10-76 0Z" fill="#e4e9d7" stroke="#bbc5aa"/><path d="M344 198q33-77 43-120M359 153l-22-22M373 113l25-18" stroke="#89927b" fill="none" stroke-width="3"/><g fill="#faf7ed" stroke="#c7bba4"><circle cx="337" cy="126" r="14"/><circle cx="329" cy="120" r="11"/><circle cx="346" cy="116" r="12"/><circle cx="397" cy="89" r="13"/><circle cx="387" cy="76" r="14"/></g></svg></div>`;
  const content={
    confectionery:{art:'<div class="pack-row"><img src="assets/center-fresh.webp" width="300" height="224" alt="Center fresh brand"><img src="assets/jelly.webp" width="300" height="224" alt="Alpenliebe Juzt Jelly brand"></div>',title:'A little sweetness, everywhere.',copy:'Mentos · Chupa Chups · Alpenliebe · Center fruit · Center fresh'},
    biscuits:{art:biscuitArt,title:'Made for the everyday tea break.',copy:'Priyagold biscuits · Nabati wafers'},
    savouries:{art:'<div class="pack-row"><img src="assets/bikano.webp" width="558" height="700" alt="Bikano Aloo Bhujia pack"></div>',title:'A taste of familiar favourites.',copy:'Bikano namkeen · DMB packaged sweets & savouries'},
    baby:{art:babyArt,title:'Everyday care for little ones.',copy:'Huggies baby diapers & diaper pants'},
    home:{art:'<div class="pack-row"><img src="assets/all-out.webp" width="700" height="516" alt="All Out liquid vaporizer machine and refill pack"></div>',title:'Essentials for the home.',copy:'All Out liquid vaporizers · Coils · Cards · Sprays'}
  };
  const tabs=[...document.querySelectorAll('[role=tab]')],panel=$('#range-panel');
  function select(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});const c=content[tab.dataset.category];panel.innerHTML=c.art+'<h3>'+c.title+'</h3><p>'+c.copy+'</p>';panel.setAttribute('aria-labelledby',tab.id);if(focus)tab.focus();}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n;if(['ArrowRight','ArrowDown'].includes(e.key))n=(i+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(e.key))n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(tabs[n],true);}});});
  const mobile=matchMedia('(max-width:760px)');function tabOrientation(){document.querySelector('[role=tablist]').setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');}mobile.addEventListener('change',tabOrientation);tabOrientation();
})();
