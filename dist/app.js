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
  const founderProfiles = $('.founder-profiles'), portraitMotion = $('.founder-motion-toggle');
  let portraitsPaused = false;
  function updatePortraitMotion() {
    if (!founderProfiles || !portraitMotion) return;
    founderProfiles.dataset.motionEnabled = String(!reduced.matches);
    founderProfiles.dataset.motionPaused = String(portraitsPaused);
    portraitMotion.hidden = reduced.matches;
    portraitMotion.setAttribute('aria-pressed', String(portraitsPaused));
    portraitMotion.textContent = portraitsPaused ? 'Play portrait motion' : 'Pause portrait motion';
  }
  portraitMotion?.addEventListener('click', () => {
    portraitsPaused = !portraitsPaused;
    updatePortraitMotion();
  });
  updatePortraitMotion();
  if('IntersectionObserver' in window&&!reduced.matches){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));}
  const vehicle = $('#vehicle'), carrier = $('#carrier'), replay = $('#motion'), scene = $('.hero-scene');
  const walkingLegs = [...carrier.querySelectorAll('.leg-front, .leg-back')];
  const wheelSpokes = [...vehicle.querySelectorAll('.spokes')];
  const canAnimate = typeof vehicle.animate === 'function';
  const journeyDuration = 14000;
  const startRatio = 0.15;
  let animation = null, companions = [], armed = true;
  let sceneVisible = false, visibleRatio = 0, pausedForTab = false;

  // Restore the complete approved 14-second study: carry, load, travel, arrival.
  // Sampling its original poses keeps the shared SVG timeline sharp at every size.
  function journeyPose(seconds) {
    const travel = Math.max(0, Math.min(1, (seconds - 5) / 6));
    const eased = travel * travel * (3 - 2 * travel);
    const x = 505 + 590 * eased;
    const workerX = seconds < 5
      ? 390 + Math.min(seconds / 4, 1) * 90
      : x + 130 + 80 * Math.max(0, Math.min(1, (seconds - 11) / 3));
    const workerY = 728 + (seconds < 4 ? Math.sin(seconds * 6) * 1.5 : 0);
    return {
      vehicle: `translate(${x}px, 573px)`,
      carrier: `translate(${workerX}px, ${workerY}px)`,
      opacity: seconds < 4.6 || seconds >= 11 ? 1 : 0,
      wheel: `rotate(${eased * 1408}deg)`,
      legs: [0, 1].map(i => `rotate(${seconds < 4 ? Math.sin(seconds * 6 + i * Math.PI) * 7 : 0}deg)`)
    };
  }
  const poses = Array.from({ length: 281 }, (_, i) => ({ offset: i / 280, ...journeyPose(i / 20) }));
  function setStillPose(atEnd = false) {
    const pose = journeyPose(atEnd ? 14 : 0);
    vehicle.style.transform = pose.vehicle;
    carrier.style.transform = pose.carrier;
    carrier.style.opacity = pose.opacity;
    wheelSpokes.forEach(wheel => { wheel.style.transform = pose.wheel; });
    walkingLegs.forEach((leg, i) => {
      leg.style.transformOrigin = '0px -65px';
      leg.style.transform = pose.legs[i];
    });
  }

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
    companions.forEach(track => track.pause());
    setJourneyControl('paused');
  }
  function resumeJourney() {
    animation.play();
    companions.forEach(track => track.play());
    setJourneyControl('running');
  }
  function cancelJourney() {
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }
    companions.forEach(track => track.cancel());
    animation = null;
    companions = [];
  }
  function startJourney() {
    cancelJourney();
    pausedForTab = false;
    if (reduced.matches || !canAnimate) {
      setStillPose(true);
      setJourneyControl('still');
      return;
    }
    setStillPose();
    const timing = { duration: journeyDuration, easing: 'linear', fill: 'forwards' };
    animation = vehicle.animate(poses.map(pose => ({ offset: pose.offset, transform: pose.vehicle })), timing);
    companions = [
      carrier.animate(poses.map(pose => ({ offset: pose.offset, transform: pose.carrier, opacity: pose.opacity })), timing),
      ...wheelSpokes.map(wheel => wheel.animate(poses.map(pose => ({ offset: pose.offset, transform: pose.wheel })), timing)),
      ...walkingLegs.map((leg, i) => leg.animate(poses.map(pose => ({ offset: pose.offset, transform: pose.legs[i] })), timing))
    ];
    // All parts share one start time, including after a replay or interruption.
    const startTime = document.timeline?.currentTime;
    if (startTime != null) [animation, ...companions].forEach(track => { track.startTime = startTime; });
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
  if (reduced.matches || !canAnimate) setStillPose(true);
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
    updatePortraitMotion();
    if (reduced.matches) {
      cancelJourney();
      pausedForTab = false;
      armed = true;
      setStillPose(true);
      document.documentElement.classList.remove('js-motion');
      setJourneyControl('finished');
    } else playOnEntry();
  });
})();
