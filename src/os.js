// fabianOS: der bedienbare Computer im Arbeitszimmer.
// Fenster mit Lebenslauf-Inhalten sind Kopien der Abschnitte aus index.html, es gibt also nur eine Textquelle.

const ICONS = {
  doc: '<rect x="14" y="6" width="36" height="52" rx="3" fill="#f2ede2"/><path d="M40 6l10 10H40z" fill="#c9bfae"/><path d="M21 28h22M21 36h22M21 44h14" stroke="#8d99a8" stroke-width="3"/>',
  time: '<rect x="10" y="10" width="44" height="46" rx="4" fill="#f2ede2"/><rect x="10" y="10" width="44" height="12" rx="4" fill="#d98a2b"/><path d="M20 32h8M20 42h8M34 32h12M34 42h12" stroke="#8d99a8" stroke-width="3"/>',
  folder: '<path d="M6 18a4 4 0 014-4h14l6 6h24a4 4 0 014 4v24a4 4 0 01-4 4H10a4 4 0 01-4-4z" fill="#d98a2b"/><path d="M6 28h52v20a4 4 0 01-4 4H10a4 4 0 01-4-4z" fill="#e9a54b"/>',
  chart: '<rect x="6" y="8" width="52" height="38" rx="4" fill="#0e1218" stroke="#c7cfd9" stroke-width="3"/><path d="M16 38V30M26 38V20M36 38V26M46 38V16" stroke="#d98a2b" stroke-width="5"/><path d="M24 56h16M32 46v10" stroke="#c7cfd9" stroke-width="3"/>',
  mail: '<rect x="6" y="14" width="52" height="38" rx="4" fill="#f2ede2"/><path d="M8 18l24 18 24-18" fill="none" stroke="#d98a2b" stroke-width="3.5"/>',
  term: '<rect x="6" y="10" width="52" height="44" rx="5" fill="#0b0f16" stroke="#c7cfd9" stroke-width="3"/><path d="M16 24l8 7-8 7" fill="none" stroke="#7fd8a0" stroke-width="3.5"/><path d="M30 40h14" stroke="#c7cfd9" stroke-width="3.5"/>',
};
const icon = (name) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export function createOS({ stage, cloneSection, onExit, toast, slurp }) {
  // Am Computer steht nur Berufliches. Sport, Reisen und Spiele gehören ins Zimmer.
  const APPS = [
    { id: 'ueber', label: 'Über mich', title: 'über-mich.txt', icon: 'doc', sections: ['ueber'], w: 640 },
    { id: 'lebenslauf', label: 'Lebenslauf', title: 'lebenslauf', icon: 'time', sections: ['erfahrung', 'ausbildung'], w: 740 },
    { id: 'projekte', label: 'Projekte', title: 'projekte', icon: 'folder', sections: ['projekte'], w: 860 },
    { id: 'skills', label: 'Skills', title: 'systemmonitor', icon: 'chart', sections: ['skills'], w: 740 },
    { id: 'kontakt', label: 'Kontakt', title: 'neue nachricht', icon: 'mail', sections: ['kontakt'], w: 580 },
    { id: 'terminal', label: 'Terminal', title: 'terminal', icon: 'term', build: buildTerminal, w: 620, dark: true },
  ];
  const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));

  const el = document.createElement('div');
  el.className = 'os';
  el.hidden = true;
  el.innerHTML = `
    <div class="os-wall" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="os-icons" role="group" aria-label="Programme"></div>
    <aside class="os-widget" aria-hidden="true">
      <p class="os-big" data-big></p>
      <p class="os-date" data-date></p>
      <p class="os-hello">Grüessech. Auf diesem Rechner liegt das Berufliche. Sport und Reisen sind im Zimmer.</p>
      <div class="os-sticky"><b>Nicht vergessen</b><span>Jira aufräumen</span><span>Terminal: «ticket» ausprobieren</span></div>
    </aside>
    <div class="os-wins"></div>
    <div class="os-menu" hidden></div>
    <div class="os-bar">
      <button type="button" class="os-start" aria-expanded="false"><span class="os-dot"></span>fabianOS</button>
      <div class="os-tasks"></div>
      <span class="os-clock" aria-hidden="true"></span>
      <button type="button" class="os-exit">Zurück ins Zimmer</button>
    </div>
    <div class="os-boot" aria-hidden="true"><pre></pre></div>`;
  stage.appendChild(el);

  const $ = (s, r = el) => r.querySelector(s);
  const iconsEl = $('.os-icons'), winsEl = $('.os-wins'), tasksEl = $('.os-tasks');
  const menuEl = $('.os-menu'), startBtn = $('.os-start'), bootEl = $('.os-boot');
  const wins = new Map();
  let z = 10, booted = false, clockTimer = 0, isOpen = false;

  // ---------- Schreibtisch-Symbole und Startmenü ----------
  APPS.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'os-icon';
    b.innerHTML = icon(a.icon) + '<span></span>';
    b.lastChild.textContent = a.label;
    b.addEventListener('click', () => openApp(a.id));
    iconsEl.appendChild(b);

    const m = document.createElement('button');
    m.type = 'button';
    m.textContent = a.label;
    m.addEventListener('click', () => { toggleMenu(false); openApp(a.id); });
    menuEl.appendChild(m);
  });
  const off = document.createElement('button');
  off.type = 'button';
  off.className = 'os-menu-off';
  off.textContent = 'Herunterfahren';
  off.addEventListener('click', () => { toggleMenu(false); onExit(); });
  menuEl.appendChild(off);

  function toggleMenu(on) {
    const show = on === undefined ? menuEl.hidden : on;
    menuEl.hidden = !show;
    startBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
  }
  startBtn.addEventListener('click', () => toggleMenu());
  $('.os-exit').addEventListener('click', () => onExit());
  el.addEventListener('pointerdown', (e) => { if (!e.target.closest('.os-menu, .os-start')) toggleMenu(false); });
  // Escape schliesst erst das Menü, dann das vorderste Fenster, zuletzt den Computer
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isOpen || document.querySelector('dialog[open]')) return;
    if (!menuEl.hidden) { toggleMenu(false); return; }
    const top = topWin();
    if (top) closeWin(top.id); else onExit();
  });

  // ---------- Fenster ----------
  function topWin() {
    let best = null;
    wins.forEach((w) => { if (!best || Number(w.el.style.zIndex) > Number(best.el.style.zIndex)) best = w; });
    return best;
  }

  function focusWin(id) {
    const w = wins.get(id);
    if (!w) return;
    w.el.style.zIndex = String(++z);
    wins.forEach((x) => {
      x.el.classList.toggle('is-front', x === w);
      x.task.setAttribute('aria-pressed', x === w ? 'true' : 'false');
    });
  }

  function closeWin(id) {
    const w = wins.get(id);
    if (!w) return;
    if (w.cleanup) w.cleanup();
    w.el.remove();
    w.task.remove();
    wins.delete(id);
    const top = topWin();
    if (top) { focusWin(top.id); top.el.focus({ preventScroll: true }); }
    else focusFirst();
  }

  function openApp(id) {
    const app = byId[id];
    if (!app) return false;
    if (wins.has(id)) { focusWin(id); wins.get(id).el.focus({ preventScroll: true }); return true; }

    const w = document.createElement('section');
    w.className = 'win' + (app.dark ? ' win-dark' : '');
    w.tabIndex = -1;
    w.setAttribute('aria-label', app.label);
    w.innerHTML = `<header class="win-bar"><span class="win-grip" aria-hidden="true"><i></i><i></i></span><span class="win-title"></span><button type="button" class="win-x" aria-label="Fenster schliessen">×</button></header><div class="win-body" tabindex="0"></div>`;
    $('.win-title', w).textContent = app.title;
    const body = $('.win-body', w);

    // Fenster gestaffelt platzieren, damit mehrere sichtbar bleiben
    const n = wins.size;
    const dw = winsEl.clientWidth, dh = winsEl.clientHeight;
    const width = Math.min(app.w, dw - 24);
    w.style.width = width + 'px';
    w.style.left = Math.max(12, Math.min(dw - width - 12, (dw - width) / 2 + (n % 4) * 28 - 28)) + 'px';
    w.style.top = (18 + (n % 4) * 26) + 'px';
    w.style.maxHeight = Math.max(240, dh - 30 - (n % 4) * 26) + 'px';

    const task = document.createElement('button');
    task.type = 'button';
    task.className = 'os-task';
    task.textContent = app.label;
    task.addEventListener('click', () => { focusWin(id); w.focus({ preventScroll: true }); });
    tasksEl.appendChild(task);

    const rec = { id, el: w, task, cleanup: null };
    wins.set(id, rec);
    if (app.sections) app.sections.forEach((id) => body.appendChild(cloneSection(id)));
    else rec.cleanup = app.build(body, w) || null;

    $('.win-x', w).addEventListener('click', () => closeWin(id));
    w.addEventListener('pointerdown', () => focusWin(id));
    drag(w, $('.win-bar', w));
    winsEl.appendChild(w);
    focusWin(id);
    const first = w.querySelector('[data-autofocus]');
    (first || w).focus({ preventScroll: true });
    return true;
  }

  function drag(win, bar) {
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || getComputedStyle(win).position !== 'absolute') return;
      const sx = e.clientX, sy = e.clientY, ox = win.offsetLeft, oy = win.offsetTop;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const maxX = winsEl.clientWidth - 80, maxY = winsEl.clientHeight - 44;
        win.style.left = Math.max(80 - win.offsetWidth, Math.min(maxX, ox + ev.clientX - sx)) + 'px';
        win.style.top = Math.max(0, Math.min(maxY, oy + ev.clientY - sy)) + 'px';
      };
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  }

  // ---------- Terminal ----------
  function buildTerminal(body) {
    body.classList.add('term');
    body.innerHTML = `<div class="term-out" aria-live="polite"></div><form class="term-form"><label for="term-in">fabian@burgdorf:~$</label><input id="term-in" data-autofocus autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Befehl eingeben"></form>`;
    const out = $('.term-out', body), form = $('.term-form', body), input = $('input', body);
    const history = [];
    let hi = 0;
    const print = (text, cls) => {
      const p = document.createElement('p');
      if (cls) p.className = cls;
      p.textContent = text;
      out.appendChild(p);
      body.scrollTop = body.scrollHeight;
    };
    const FILES = { 'über-mich.txt': 'ueber', 'ueber-mich.txt': 'ueber', 'lebenslauf': 'lebenslauf', 'werdegang': 'lebenslauf', 'ausbildung': 'lebenslauf', 'projekte': 'projekte', 'skills.sys': 'skills', 'skills': 'skills', 'kontakt.eml': 'kontakt', 'kontakt': 'kontakt' };
    const run = (raw) => {
      const line = raw.trim();
      print('fabian@burgdorf:~$ ' + line, 'term-cmd');
      if (!line) return;
      const [cmd, ...rest] = line.toLowerCase().split(/\s+/);
      const arg = rest.join(' ').replace(/\/$/, '');
      if (cmd === 'help' || cmd === 'hilfe') {
        ['help            diese Liste', 'whoami          kurz, wer hier arbeitet', 'ls              Dateien anzeigen', 'open <datei>    Datei öffnen, zum Beispiel: open projekte', 'ticket          ein Ticket an mich erfassen', 'clear           aufräumen', 'exit            zurück ins Zimmer'].forEach((l) => print(l));
      } else if (cmd === 'whoami') {
        print('Fabian Locher. Business Engineer bei der Finform AG in Bern, daneben im Master Wirtschaftsinformatik an der BFH.');
      } else if (cmd === 'ls' || cmd === 'dir') {
        print('über-mich.txt   lebenslauf/   projekte/   skills.sys   kontakt.eml');
      } else if (cmd === 'open' || cmd === 'cat' || cmd === 'cd' || cmd === 'start') {
        const id = FILES[arg];
        if (id) { print('Öffne ' + arg + ' …'); setTimeout(() => openApp(id), 250); }
        else print(arg ? 'Nicht gefunden: ' + arg + '. «ls» zeigt, was da ist.' : 'Welche Datei? Beispiel: open projekte');
      } else if (FILES[cmd]) {
        print('Öffne ' + cmd + ' …'); setTimeout(() => openApp(FILES[cmd]), 250);
      } else if (cmd === 'ticket') {
        // Tickets sind mein Alltag, also läuft auch die Kontaktaufnahme darüber
        print('FAB-1 erfasst: «Fabian kennenlernen»', 'term-ok');
        print('Typ: Anfrage · Status: Offen · Zugewiesen an: Fabian Locher');
        setTimeout(() => print('Öffne Kontakt …'), 500);
        setTimeout(() => openApp('kontakt'), 1000);
      } else if (cmd === 'clear' || cmd === 'cls') {
        out.replaceChildren();
      } else if (cmd === 'exit') {
        onExit();
      } else if (cmd === 'sudo') {
        print('Admin-Rechte braucht es hier nicht.');
      } else {
        print('Befehl nicht gefunden: ' + cmd + '. «help» zeigt die Befehle.');
      }
    };
    print('fabianOS Terminal. «help» zeigt die Befehle.');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value;
      if (v.trim()) { history.push(v); hi = history.length; }
      input.value = '';
      run(v);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = history[hi]; }
      if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; }
    });
    body.addEventListener('click', (e) => { if (!getSelection().toString() && e.target.tagName !== 'INPUT') input.focus({ preventScroll: true }); });
  }

  // ---------- Ein- und Ausschalten ----------
  function chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = chime.ctx || (chime.ctx = new Ctx());
      if (ctx.state === 'suspended') ctx.resume();
      [[523.25, 0], [783.99, 0.14]].forEach(([f, t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.7);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.75);
      });
    } catch (e) { /* Ton ist optional */ }
  }

  function boot() {
    const pre = $('pre', bootEl);
    const lines = ['fabianOS · Burgdorf', '', 'Lade Lebenslauf ....... ok', 'Lade Projekte ......... ok', '', 'Bereit.'];
    const quick = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pre.textContent = '';
    bootEl.classList.add('is-on');
    lines.forEach((l, i) => setTimeout(() => { pre.textContent += l + '\n'; }, quick ? 0 : 140 * i));
    setTimeout(() => { bootEl.classList.remove('is-on'); chime(); focusFirst(); }, quick ? 300 : 140 * lines.length + 350);
  }

  function focusFirst() {
    const b = iconsEl.querySelector('button');
    if (b && isOpen) b.focus({ preventScroll: true });
  }

  function tickClock() {
    const now = new Date();
    const hm = now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    $('.os-clock').textContent = hm;
    $('[data-big]').textContent = hm;
    $('[data-date]').textContent = now.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const clip = (r) => {
    if (!r) return 'inset(0 round 0)';
    const w = stage.clientWidth, h = stage.clientHeight;
    return `inset(${Math.max(0, r.top)}px ${Math.max(0, w - r.right)}px ${Math.max(0, h - r.bottom)}px ${Math.max(0, r.left)}px round 6px)`;
  };

  return {
    get isOpen() { return isOpen; },
    openApp,
    // rect: Lage des 3D-Bildschirms auf der Bühne; von dort wächst die Oberfläche auf
    open(rect) {
      isOpen = true;
      el.hidden = false;
      el.style.transition = 'none';
      el.style.clipPath = clip(rect);
      el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = '';
      el.style.clipPath = clip(null);
      el.style.opacity = '1';
      tickClock();
      clockTimer = setInterval(tickClock, 15000);
      if (!booted) { booted = true; boot(); } else setTimeout(focusFirst, 300);
    },
    close(rect, done) {
      isOpen = false;
      clearInterval(clockTimer);
      toggleMenu(false);
      el.style.clipPath = clip(rect);
      el.style.opacity = '0';
      setTimeout(() => { el.hidden = true; if (done) done(); }, 420);
    },
  };
}
