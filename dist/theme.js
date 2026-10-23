/* Jaipur's light follows its own clock, wherever a visitor happens to be. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'bansal-theme-mode';
  const modes = ['auto', 'day', 'evening', 'night'];
  const names = { day: 'Day', evening: 'Evening', night: 'Night' };
  const labels = { day: 'Jaipur by day', evening: 'Jaipur at dusk', night: 'Jaipur at night' };
  let mode = 'auto', theme, clockTimer, activeTrigger;
  let bound = false;
  let jaipurClock;
  try {
    jaipurClock = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
  } catch (_) { /* The fixed IST offset also works in browsers without timezone data. */ }

  function themeForDate(date = new Date()) {
    const instant = date instanceof Date ? date : new Date(date);
    if (!Number.isFinite(instant.getTime())) return 'day';
    let minutes;
    try {
      const parts = jaipurClock.formatToParts(instant);
      minutes = (Number(parts.find(part => part.type === 'hour').value) % 24) * 60
        + Number(parts.find(part => part.type === 'minute').value);
    } catch (_) {
      const ist = new Date(instant.getTime() + 330 * 60000);
      minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    }
    if (minutes >= 300 && minutes < 1020) return 'day';
    if (minutes >= 1020 && minutes < 1080) return 'evening';
    return 'night';
  }

  try {
    const saved = localStorage.getItem(storageKey);
    if (modes.includes(saved)) mode = saved;
  } catch (_) { /* Private browsing or denied storage must not prevent automatic light. */ }

  function updateControls() {
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === mode));
    });
    document.querySelectorAll('[data-theme-label]').forEach(label => { label.textContent = labels[theme]; });
    document.querySelectorAll('[data-theme-status]').forEach(label => {
      label.textContent = mode === 'auto' ? 'Auto · Jaipur time' : `Manual · ${names[theme]}`;
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', `${labels[theme]}. Change the city light`);
    });
  }

  function apply() {
    const nextTheme = mode === 'auto' ? themeForDate() : mode;
    const changed = theme !== nextTheme || root.dataset.themeMode !== mode;
    theme = nextTheme;
    root.dataset.theme = theme;
    root.dataset.themeMode = mode;
    root.style.colorScheme = theme === 'night' ? 'dark' : 'light';
    const browserColor = document.querySelector('meta[name="theme-color"]');
    if (browserColor) browserColor.content = { day: '#fbf3e5', evening: '#dfcdd3', night: '#171d2b' }[theme];
    if (bound) updateControls();
    if (changed) document.dispatchEvent(new CustomEvent('bansal:themechange', { detail: { mode, theme } }));
  }

  function setMode(nextMode) {
    if (!modes.includes(nextMode)) return false;
    mode = nextMode;
    try { localStorage.setItem(storageKey, mode); } catch (_) { /* Keep this visit's selection. */ }
    apply();
    return true;
  }

  function scheduleClock() {
    clearTimeout(clockTimer);
    // Align with the next minute so 17:00 / 18:00 / 05:00 are not delayed by page-load time.
    clockTimer = setTimeout(() => {
      apply();
      scheduleClock();
    }, 60000 - (Date.now() % 60000));
  }

  function closePanels(returnFocus = false) {
    document.querySelectorAll('[data-theme-panel]').forEach(panel => { panel.hidden = true; });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (returnFocus && activeTrigger) activeTrigger.focus();
    activeTrigger = null;
  }

  function bindControls() {
    if (bound) return;
    bound = true;
    closePanels();
    updateControls();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('aria-controls');
        const panel = (target && document.getElementById(target)) || document.querySelector('[data-theme-panel]');
        if (!panel) return;
        const wasOpen = !panel.hidden && activeTrigger === button;
        closePanels();
        if (wasOpen) return;
        activeTrigger = button;
        panel.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        const selected = panel.querySelector('[data-theme-choice][aria-pressed="true"]') || panel.querySelector('[data-theme-choice]');
        selected?.focus();
      });
    });
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => {
        setMode(button.dataset.themeChoice);
        closePanels(true);
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && activeTrigger) {
        event.preventDefault();
        closePanels(true);
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest?.('[data-theme-panel], [data-theme-toggle]')) closePanels();
    });
    document.addEventListener('focusin', event => {
      if (activeTrigger && !event.target.closest?.('[data-theme-panel], [data-theme-toggle]')) closePanels();
    });
  }

  // This synchronous head script applies the palette before the body is painted.
  apply();
  scheduleClock();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindControls, { once: true });
  else bindControls();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { apply(); scheduleClock(); }
  });
  window.addEventListener('pageshow', () => { apply(); scheduleClock(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    mode = modes.includes(event.newValue) ? event.newValue : 'auto';
    apply();
  });
  window.BansalTheme = Object.freeze({ setMode, themeForDate, getState: () => ({ mode, theme }) });
})();
