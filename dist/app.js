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
})();
