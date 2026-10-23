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
  const vehicle = $('#vehicle'), replay = $('#motion'), scene = $('.hero-scene');
  const canAnimate = typeof vehicle.animate === 'function';
  const startRatio = 0.15;
  let animation = null, wheels = [], armed = true;
  let sceneVisible = false, visibleRatio = 0, pausedForTab = false;

  function setJourneyControl(state) {
    const labels = {
      running: ['Ⅱ Pause the journey', 'Pause the delivery animation'],
      paused: ['▷ Continue the journey', 'Continue the delivery animation'],
      finished: ['↻ Replay the journey', 'Replay the delivery animation'],
      still: ['✓ At the next stop', 'Delivery illustration at the next stop']
    };
    const [text, label] = labels[state];
    replay.textContent = text;
    replay.setAttribute('aria-label', label);
  }
  function pauseJourney() {
    if (animation?.playState !== 'running') return;
    animation.pause();
    wheels.forEach(wheel => wheel.pause());
    setJourneyControl('paused');
  }
  function resumeJourney() {
    animation.play();
    wheels.forEach(wheel => wheel.play());
    setJourneyControl('running');
  }
  function cancelJourney() {
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }
    wheels.forEach(wheel => wheel.cancel());
    animation = null;
    wheels = [];
  }
  function startJourney() {
    cancelJourney();
    pausedForTab = false;
    if (reduced.matches || !canAnimate) {
      vehicle.setAttribute('transform', 'translate(645 573)');
      setJourneyControl('still');
      return;
    }
    vehicle.setAttribute('transform', 'translate(505 573)');
    const timing = { duration: 3900, easing: 'cubic-bezier(.35,0,.2,1)', fill: 'forwards' };
    animation = vehicle.animate([
      { transform: 'translate(505px, 573px)' },
      { transform: 'translate(645px, 573px)' }
    ], timing);
    wheels = [...vehicle.querySelectorAll('.spokes')].map(wheel => wheel.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(334deg)' }
    ], timing));
    const current = animation;
    current.onfinish = () => {
      if (animation === current) setJourneyControl('finished');
    };
    setJourneyControl('running');
  }
  function playOnEntry() {
    if (!armed || !sceneVisible || visibleRatio < startRatio || document.hidden || reduced.matches) return;
    armed = false;
    startJourney();
  }
  function updateSceneVisibility(isVisible, ratio) {
    sceneVisible = isVisible && ratio > 0;
    visibleRatio = ratio;
    if (!sceneVisible) {
      // Re-arm only after a full exit, so small scroll movements cannot restart the scene.
      armed = true;
      pausedForTab = false;
      pauseJourney();
      return;
    }
    playOnEntry();
  }
  function measureScene() {
    const bounds = scene.getBoundingClientRect();
    const headerHeight = $('.header')?.getBoundingClientRect().height || 0;
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;
    const visibleHeight = Math.max(0, Math.min(bounds.bottom, height) - Math.max(bounds.top, headerHeight));
    const visibleWidth = Math.max(0, Math.min(bounds.right, width) - Math.max(bounds.left, 0));
    const area = bounds.width * bounds.height;
    const ratio = area > 0 ? visibleHeight * visibleWidth / area : 0;
    updateSceneVisibility(ratio > 0, ratio);
  }
  if ('IntersectionObserver' in window) {
    const headerHeight = Math.round($('.header')?.getBoundingClientRect().height || 0);
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => updateSceneVisibility(entry.isIntersecting, entry.intersectionRatio));
    }, { threshold: [0, startRatio], rootMargin: `-${headerHeight}px 0px 0px 0px` });
    sceneObserver.observe(scene);
  } else {
    // Keep entry playback available in browsers without IntersectionObserver.
    let scheduled = false;
    const queueMeasure = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; measureScene(); });
    };
    window.addEventListener('scroll', queueMeasure, { passive: true });
    window.addEventListener('resize', queueMeasure);
    measureScene();
  }
  replay.addEventListener('click', () => {
    pausedForTab = false;
    armed = false;
    if (!reduced.matches && canAnimate && animation?.playState === 'running') pauseJourney();
    else if (!reduced.matches && canAnimate && animation?.playState === 'paused') resumeJourney();
    else startJourney();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animation?.playState === 'running') {
        pausedForTab = true;
        pauseJourney();
      }
    } else if (sceneVisible) {
      if (armed) playOnEntry();
      else if (pausedForTab && animation?.playState === 'paused' && !reduced.matches) resumeJourney();
      pausedForTab = false;
    }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      armed = true;
      measureScene();
    }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelJourney();
      pausedForTab = false;
      armed = true;
      vehicle.setAttribute('transform', 'translate(645 573)');
      document.documentElement.classList.remove('js-motion');
      setJourneyControl('finished');
    } else playOnEntry();
  });
})();
