const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../dist/theme.js'), 'utf8');
const originalTimezone = process.env.TZ;
process.env.TZ = 'America/Los_Angeles';

function setup({ now = '2026-10-23T06:30:00Z', saved, deniedStorage = false, brokenIntl = false } = {}) {
  const dom = new JSDOM(`<!doctype html><html><head><meta name="theme-color" content="#fbf3e5"></head><body>
    <button id="sun" data-theme-toggle aria-controls="light-panel">Change light</button>
    <button id="header-light" data-theme-toggle aria-controls="light-panel">Change light</button>
    <div id="light-panel" data-theme-panel hidden role="group" aria-label="City light">
      <button data-theme-choice="auto">Auto</button><button data-theme-choice="day">Day</button>
      <button data-theme-choice="evening">Evening</button><button data-theme-choice="night">Night</button>
    </div><span data-theme-label></span><span data-theme-status></span><button id="elsewhere">Elsewhere</button>
    </body></html>`, { url: 'https://bansal.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document, NativeDate = w.Date;
  let time = NativeDate.parse(now), timerId = 0;
  const timers = new Map();
  w.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [time])); }
    static now() { return time; }
  };
  w.setTimeout = (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; };
  w.clearTimeout = id => timers.delete(id);
  if (saved !== undefined) w.localStorage.setItem('bansal-theme-mode', saved);
  if (deniedStorage) Object.defineProperty(w, 'localStorage', { get() { throw new Error('Storage denied'); } });
  if (brokenIntl) w.Intl.DateTimeFormat = function () { throw new Error('Timezone data unavailable'); };
  Object.defineProperty(d, 'readyState', { configurable: true, value: 'loading' });
  w.eval(source);
  return {
    dom, w, d, timers, api: w.BansalTheme,
    ready() { d.dispatchEvent(new w.Event('DOMContentLoaded')); },
    setTime(instant) { time = NativeDate.parse(instant); },
    tick() { const [id, timer] = [...timers.entries()][0]; timers.delete(id); timer.callback(); },
    choice(mode) { return d.querySelector(`[data-theme-choice="${mode}"]`); },
    close() { w.close(); }
  };
}

try {
  const t = setup({ now: '2026-10-23T11:29:42Z' });
  assert.equal(t.d.documentElement.dataset.theme, 'day', 'Apply theme synchronously before DOM readiness');
  assert.equal(t.d.documentElement.dataset.themeMode, 'auto');
  assert.equal(t.d.querySelector('meta[name="theme-color"]').content, '#fbf3e5');
  assert.equal(t.api.getState().theme, 'day');
  assert.equal([...t.timers.values()][0].delay, 18000, 'First clock tick aligns with the next minute');
  const boundaryCases = [
    ['2026-10-22T23:29:59.999Z', 'night'], // 04:59:59 IST
    ['2026-10-22T23:30:00Z', 'day'],       // 05:00 IST
    ['2026-10-23T11:29:59.999Z', 'day'],
    ['2026-10-23T11:30:00Z', 'evening'],   // 17:00 IST
    ['2026-10-23T12:29:59.999Z', 'evening'],
    ['2026-10-23T12:30:00Z', 'night'],     // 18:00 IST
    ['2026-10-23T18:30:00Z', 'night'],     // Midnight IST
    ['2026-12-31T18:30:00Z', 'night'],
    ['2028-02-29T23:30:00Z', 'day']
  ];
  for (const [instant, theme] of boundaryCases) {
    assert.equal(t.api.themeForDate(instant), theme, `${instant}: Use IST even with the host in Los Angeles`);
  }
  t.ready();
  assert.equal(t.choice('auto').getAttribute('aria-pressed'), 'true');
  assert.equal(t.choice('night').getAttribute('aria-pressed'), 'false');
  assert.equal(t.d.querySelector('[data-theme-status]').textContent, 'Auto · Jaipur time');
  assert.equal(t.d.querySelector('[data-theme-label]').textContent, 'Jaipur by day');
  const sun = t.d.getElementById('sun'), header = t.d.getElementById('header-light'), panel = t.d.getElementById('light-panel');
  sun.click();
  assert.equal(panel.hidden, false);
  assert.equal(sun.getAttribute('aria-expanded'), 'true');
  assert.equal(t.d.activeElement, t.choice('auto'), 'Opening the selector focuses the current choice');
  t.choice('night').click();
  assert.equal(t.api.getState().mode, 'night');
  assert.equal(t.api.getState().theme, 'night');
  assert.equal(t.d.querySelector('meta[name="theme-color"]').content, '#171d2b', 'Theme choices update browser chrome immediately');
  assert.equal(t.w.localStorage.getItem('bansal-theme-mode'), 'night');
  assert.equal(t.d.querySelector('[data-theme-status]').textContent, 'Manual · Night');
  assert.equal(t.d.querySelector('[data-theme-label]').textContent, 'Jaipur at night');
  assert.equal(panel.hidden, true);
  assert.equal(sun.getAttribute('aria-expanded'), 'false');
  assert.equal(t.d.activeElement, sun, 'Selecting a theme returns focus to its trigger');
  assert.match(sun.getAttribute('aria-label'), /Jaipur at night/);
  header.click();
  assert.equal(t.d.activeElement, t.choice('night'));
  t.d.dispatchEvent(new t.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(panel.hidden, true);
  assert.equal(t.d.activeElement, header, 'Escape restores focus to the correct trigger');
  sun.click(); t.d.getElementById('elsewhere').click(); assert.equal(panel.hidden, true, 'Outside click dismisses the selector');
  sun.click(); t.d.getElementById('elsewhere').focus(); assert.equal(panel.hidden, true, 'Keyboard navigation can leave the selector');
  sun.click(); sun.click(); assert.equal(panel.hidden, true, 'Clicking an open trigger closes it');

  t.setTime('2026-10-23T11:30:00Z'); t.tick();
  assert.equal(t.api.getState().theme, 'night', 'Clock ticks preserve a manual choice');
  t.api.setMode('auto');
  assert.equal(t.api.getState().theme, 'evening', 'Returning to Auto immediately uses the current Jaipur clock');
  assert.equal(t.w.localStorage.getItem('bansal-theme-mode'), 'auto');
  t.setTime('2026-10-23T12:30:00Z'); t.tick();
  assert.equal(t.api.getState().theme, 'night', 'An open page switches at 18:00 without reload');
  assert.equal(t.timers.size, 1, 'Only one scheduled clock update remains');
  t.setTime('2026-10-23T23:30:00Z');
  Object.defineProperty(t.d, 'hidden', { configurable: true, value: false });
  t.d.dispatchEvent(new t.w.Event('visibilitychange'));
  assert.equal(t.api.getState().theme, 'day', 'Returning after a suspended tab catches up immediately');
  t.setTime('2026-10-24T12:30:00Z'); t.w.dispatchEvent(new t.w.Event('pageshow'));
  assert.equal(t.api.getState().theme, 'night', 'Back-forward cache restores current light');
  assert.equal(t.timers.size, 1);
  assert.equal(t.api.setMode('invalid'), false);
  assert.equal(t.api.getState().mode, 'auto');
  t.w.dispatchEvent(new t.w.StorageEvent('storage', { key: 'bansal-theme-mode', newValue: 'evening' }));
  assert.equal(t.api.getState().theme, 'evening', 'Manual selections synchronize across tabs');
  t.w.dispatchEvent(new t.w.StorageEvent('storage', { key: 'bansal-theme-mode', newValue: null }));
  assert.equal(t.api.getState().mode, 'auto', 'Removing the preference restores Auto');
  t.close();

  const persisted = setup({ saved: 'evening', now: '2026-10-23T00:00:00Z' });
  assert.equal(persisted.d.documentElement.dataset.theme, 'evening', 'Reload honors a saved choice before first paint');
  assert.equal(persisted.d.querySelector('meta[name="theme-color"]').content, '#dfcdd3', 'Browser chrome also updates before DOM readiness');
  persisted.close();
  const invalid = setup({ saved: 'sepia' });
  assert.equal(invalid.api.getState().mode, 'auto', 'Unknown stored values safely use Auto'); invalid.close();
  const blocked = setup({ deniedStorage: true });
  blocked.ready(); assert.equal(blocked.api.getState().mode, 'auto');
  assert.equal(blocked.api.setMode('night'), true);
  assert.equal(blocked.api.getState().theme, 'night', 'Storage errors do not disable this visit’s selection'); blocked.close();
  const fallback = setup({ brokenIntl: true });
  for (const [instant, theme] of boundaryCases) assert.equal(fallback.api.themeForDate(instant), theme, 'IST fallback is independent of visitor timezone');
  fallback.close();
  // Exercise the real navigation listener alongside the theme panel. On a phone,
  // .navlinks loses display when closed, so returning focus there must keep it open.
  const actual = new JSDOM(fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8'), {
    url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const aw = actual.window, ad = aw.document;
  const themeScript = ad.querySelector('script[src^="theme.js"]');
  assert(themeScript && !themeScript.defer && !themeScript.async, 'Theme must initialize synchronously');
  assert(ad.querySelector('meta[name="theme-color"]').compareDocumentPosition(themeScript) & 4,
    'Browser colour metadata must be available before the theme script runs');
  for (const filename of ['theme.css', 'theme-page.css']) {
    assert(ad.querySelector(`link[href^="${filename}"]`), `${filename} must be loaded by the real page`);
  }

  aw.matchMedia = query => ({ matches: query.includes('max-width'), addEventListener() {} });
  aw.IntersectionObserver = class { observe() {} unobserve() {} };
  aw.eval(source);
  aw.eval(fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8'));
  ad.dispatchEvent(new aw.Event('DOMContentLoaded'));
  const menu = ad.querySelector('.menu'), navigation = ad.querySelector('#navigation');
  const appearance = ad.querySelector('.appearance-toggle'), actualPanel = ad.querySelector('[data-theme-panel]');
  menu.click(); appearance.click(); ad.querySelector('[data-theme-choice="night"]').click();
  assert(navigation.classList.contains('open'), 'Choosing a theme keeps the mobile return-focus target visible');
  assert.equal(ad.activeElement, appearance);
  assert.equal(actualPanel.hidden, true);
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  appearance.click();
  ad.dispatchEvent(new aw.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(actualPanel.hidden, true, 'Escape also dismisses appearance settings while the mobile menu is open');
  assert.equal(navigation.classList.contains('open'), false);
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(ad.activeElement, menu, 'Escape returns focus to the visible menu button');
  aw.close();
  console.log('Theme checks passed: Jaipur clock boundaries, pre-paint state, manual/Auto persistence, live updates, storage fallback and accessible controls.');
} finally {
  if (originalTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimezone;
}
