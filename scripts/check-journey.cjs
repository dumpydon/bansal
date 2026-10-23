const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const dist = path.resolve(__dirname, '../dist');

function setup({ reduced = false, observer = true, visibleOnLoad = true } = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'), {
    url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document;
  const scene = d.querySelector('.hero-scene');
  let rect = visibleOnLoad
    ? { top: 100, bottom: 500, left: 0, right: 900, width: 900, height: 400 }
    : { top: -500, bottom: -100, left: 0, right: 900, width: 900, height: 400 };
  scene.getBoundingClientRect = () => rect;
  const media = { matches: reduced, addEventListener: (_, listener) => { media.listener = listener; } };
  w.matchMedia = () => media;
  const observers = [];
  if (observer) w.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
  };
  const runs = [];
  Object.defineProperty(d, 'timeline', { value: { currentTime: 500 } });
  w.Element.prototype.animate = function (frames, options) {
    const animation = {
      target: this, frames, options, playState: 'running',
      pause() { this.playState = 'paused'; },
      play() { this.playState = 'running'; },
      cancel() { this.playState = 'idle'; },
      finish() { this.playState = 'finished'; this.onfinish?.(); }
    };
    runs.push(animation); return animation;
  };
  w.eval(fs.readFileSync(path.join(dist, 'app.js'), 'utf8'));
  const vehicle = d.querySelector('#vehicle'), button = d.querySelector('#motion');
  const journeys = () => runs.filter(a => a.target === vehicle);
  const activeWheels = () => runs.filter(a => a.target.matches('.spokes') && a.playState !== 'idle');
  const activeParts = () => runs.filter(a => a.playState !== 'idle');
  return {
    dom, w, d, button, media, journeys, activeWheels, activeParts,
    enter(ratio = 0.5) {
      const io = observers.find(o => o.targets.has(scene)); assert(io, 'Scene must remain observed for repeat visits');
      io.callback([{ target: scene, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
    },
    setHidden(value) { Object.defineProperty(d, 'hidden', { configurable: true, value }); d.dispatchEvent(new w.Event('visibilitychange')); },
    setRect(value) { rect = value; }
  };
}

const t = setup();
assert.equal(t.journeys().length, 0, 'Do not run unseen animation before visibility is known');
t.enter(0); assert.equal(t.journeys().length, 0);
t.enter(0.05); assert.equal(t.journeys().length, 0, 'Wait for a meaningful amount of the scene');
t.enter(); const first = t.journeys()[0]; assert(first); assert.equal(first.options.duration, 14000, 'Play the complete original sequence');
assert.equal(first.frames[0].transform, 'translate(505px, 573px)');
assert.equal(t.activeParts().length, 6, 'Animate vehicle, carrier, both wheels and both walking legs');
assert(t.activeParts().every(a => a.options.duration === 14000 && a.startTime === 500), 'All parts share the full timeline and a synchronized start');
const carrier = t.activeParts().find(a => a.target.id === 'carrier');
const frameAt = (track, seconds) => track.frames.find(frame => Math.abs(frame.offset - seconds / 14) < 0.00001);
assert.equal(frameAt(first, 3).transform, 'translate(505px, 573px)', 'Rickshaw waits while the worker prepares the dispatch');
assert.match(frameAt(carrier, 3).transform, /^translate\(457\.5px, /, 'Worker carries the carton towards the vehicle');
assert.equal(frameAt(carrier, 4.6).opacity, 0, 'Retain the original loading transition');
assert.equal(frameAt(first, 5).transform, 'translate(505px, 573px)', 'Travel starts after preparation and loading');
assert.equal(frameAt(first, 8).transform, 'translate(800px, 573px)', 'Vehicle crosses the full market route');
assert.equal(frameAt(first, 11).transform, 'translate(1095px, 573px)', 'Vehicle reaches the shopfront');
assert.equal(frameAt(carrier, 11).opacity, 1, 'Carrier returns for the arrival stage');
assert.equal(frameAt(carrier, 14).transform, 'translate(1305px, 728px)', 'Complete the final approach to the shop');
assert(t.activeWheels().every(wheel => wheel.frames.at(-1).transform === 'rotate(1408deg)'), 'Wheels turn for the full route');
assert(t.activeParts().filter(a => a.target.matches('.leg-front,.leg-back')).every(leg => leg.frames.some(frame => frame.transform !== 'rotate(0deg)')), 'Walking legs move during preparation');
const legs = t.activeParts().filter(a => a.target.matches('.leg-front,.leg-back'));
const angleAt = (track, seconds) => Number(frameAt(track, seconds).transform.match(/rotate\(([^)]+)deg\)/)[1]);
for (const leg of legs) {
  assert(angleAt(leg, 11.25) * angleAt(leg, 11.75) < 0,
    'Arrival must alternate steps while the carrier approaches the shopkeeper');
  assert.equal(angleAt(leg, 8), 0, 'Walking stops while riding in the rickshaw');
  assert.equal(angleAt(leg, 14), 0, 'The carrier settles into the handover pose');
}
assert(angleAt(legs[0], 11.25) * angleAt(legs[1], 11.25) < 0,
  'The two legs counter-swing rather than sliding together');
assert.notEqual(frameAt(carrier, 11.25).transform.split(', ')[1], frameAt(carrier, 11.75).transform.split(', ')[1],
  'The arrival walk includes the same gentle body bounce as the departure walk');
assert.equal(frameAt(first, 13).transform, frameAt(first, 11).transform,
  'The rickshaw stays parked throughout the final walk');
t.enter(0.7); t.enter(0.3); assert.equal(t.journeys().length, 1, 'No repeated restart while visible');
first.finish(); assert.match(t.button.textContent, /Replay/);
t.enter(0.8); assert.equal(t.journeys().length, 1, 'A completed visit plays only once');
t.enter(0); t.enter(0.04); assert.equal(t.journeys().length, 1);
t.enter(0.4); const second = t.journeys()[1]; assert(second, 'Re-entry must replay after completion');
assert.equal(first.playState, 'idle', 'Remove previous finished animation');
assert.equal(t.activeWheels().length, 2, 'Keep only one pair of wheel timelines');
assert.equal(t.activeParts().length, 6, 'Replays remove all previous body and wheel timelines');
t.button.click(); assert.equal(second.playState, 'paused');
assert(t.activeParts().every(a => a.playState === 'paused'), 'Pause the complete cast together');
t.enter(0.6); assert.equal(second.playState, 'paused', 'Scroll within the scene respects manual pause');
t.button.click(); assert.equal(second.playState, 'running');
assert(t.activeParts().every(a => a.playState === 'running'), 'Resume all six tracks together');
t.enter(0); assert.equal(second.playState, 'paused', 'Leaving the scene stops invisible work');
t.enter(0.5); const third = t.journeys()[2]; assert(third);
assert.equal(second.playState, 'idle', 'Re-entry cancels the unfinished previous visit');
assert.equal(third.frames[0].transform, first.frames[0].transform, 'Replay starts at the original position');
t.setHidden(true); assert.equal(third.playState, 'paused');
t.setHidden(false); assert.equal(third.playState, 'running');
assert.equal(t.journeys().length, 3, 'Tab visibility resumes the same visit');
t.button.click(); t.setHidden(true); t.setHidden(false); assert.equal(third.playState, 'paused', 'Tab changes respect user pause');
t.enter(0); t.enter(); assert.equal(t.journeys().length, 4, 'Another full exit and return always starts a new visit');
t.media.matches = true; t.media.listener(); assert.equal(t.activeParts().length, 0, 'Reduced motion cancels the complete timeline');
assert.equal(t.d.querySelector('#vehicle').style.transform, 'translate(1095px, 573px)');
assert.equal(t.d.querySelector('#carrier').style.transform, 'translate(1305px, 728px)');
t.enter(0); t.enter(); assert.equal(t.journeys().length, 4, 'Reduced motion suppresses automatic travel');
t.media.matches = false; t.media.listener(); assert.equal(t.journeys().length, 5);
t.dom.window.close();

const reduced = setup({ reduced: true });
reduced.enter(); reduced.enter(0); reduced.enter(); assert.equal(reduced.journeys().length, 0);
reduced.button.click(); assert.equal(reduced.journeys().length, 0); assert.match(reduced.button.textContent, /next stop/);
reduced.dom.window.close();

for (const visibleOnLoad of [true, false]) {
  const fallback = setup({ observer: false, visibleOnLoad });
  assert.equal(fallback.journeys().length, visibleOnLoad ? 1 : 0, 'Fallback checks actual initial visibility');
  fallback.dom.window.close();
}
console.log('PASS: complete 14s carry/load/travel/arrival timeline, synchronized cast and wheels, full route endpoints, once-per-visit playback, repeated re-entry, pause/replay, tab visibility and reduced motion.');
