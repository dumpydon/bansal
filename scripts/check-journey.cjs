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
  return {
    dom, w, d, button, media, journeys, activeWheels,
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
t.enter(); const first = t.journeys()[0]; assert(first); assert.equal(first.options.duration, 3900);
assert.equal(first.frames[0].transform, 'translate(505px, 573px)');
t.enter(0.7); t.enter(0.3); assert.equal(t.journeys().length, 1, 'No repeated restart while visible');
first.finish(); assert.match(t.button.textContent, /Replay/);
t.enter(0.8); assert.equal(t.journeys().length, 1, 'A completed visit plays only once');
t.enter(0); t.enter(0.04); assert.equal(t.journeys().length, 1);
t.enter(0.4); const second = t.journeys()[1]; assert(second, 'Re-entry must replay after completion');
assert.equal(first.playState, 'idle', 'Remove previous finished animation');
assert.equal(t.activeWheels().length, 2, 'Keep only one pair of wheel timelines');
t.button.click(); assert.equal(second.playState, 'paused');
assert(t.activeWheels().every(a => a.playState === 'paused'));
t.enter(0.6); assert.equal(second.playState, 'paused', 'Scroll within the scene respects manual pause');
t.button.click(); assert.equal(second.playState, 'running');
assert(t.activeWheels().every(a => a.playState === 'running'));
t.enter(0); assert.equal(second.playState, 'paused', 'Leaving the scene stops invisible work');
t.enter(0.5); const third = t.journeys()[2]; assert(third);
assert.equal(second.playState, 'idle', 'Re-entry cancels the unfinished previous visit');
assert.equal(third.frames[0].transform, first.frames[0].transform, 'Replay starts at the original position');
t.setHidden(true); assert.equal(third.playState, 'paused');
t.setHidden(false); assert.equal(third.playState, 'running');
assert.equal(t.journeys().length, 3, 'Tab visibility resumes the same visit');
t.button.click(); t.setHidden(true); t.setHidden(false); assert.equal(third.playState, 'paused', 'Tab changes respect user pause');
t.enter(0); t.enter(); assert.equal(t.journeys().length, 4, 'Another full exit and return always starts a new visit');
t.media.matches = true; t.media.listener(); assert(t.journeys().every(a => a.playState === 'idle'));
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
console.log('PASS: hero plays once per visit, waits offscreen, restarts after every exit, cleans up wheel timelines, retains manual pause/replay and supports reduced motion.');
