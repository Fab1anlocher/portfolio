// Portfolio Fabian Locher
// Die Seite funktioniert ohne dieses Skript als normaler Lebenslauf.
// Mit Skript kommen dazu: die Fenster (Kopien der Lebenslauf-Abschnitte) und das 3D-Arbeitszimmer.

import { buildRoom } from './scene/room.js';
import { createOS } from './os.js';
import { createTV } from './tv.js';

// ---------- Einstellungen ----------
const CONFIG = {
  accent: '#d98a2b',
  transitionMs: 1000,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Die Aufteilung der Seite: Am Computer steht alles Berufliche, das Zimmer erzählt den Rest.
// Deshalb öffnet kein Gegenstand ein Papierfenster. Im Zimmer gibt es nur Kamerafahrten mit einer Bildlegende.
const LABELS = {
  monitor: ['Computer', 'Lebenslauf, Projekte, Kontakt'],
  tv: ['Fernseher', 'Sport und Gaming'],
  photos: ['Fotowand', 'Bilder von unterwegs'],
  burgdorf: ['Fenster', 'Blick auf Burgdorf'],
  mate: ['El Tony Mate', 'Steht fast immer da'],
  chess: ['Schachbrett', 'Ein Zug'],
};
// Sichtbare Wegweiser im Raum. «work» ist der Beruf, «life» das Private.
const HOT = {
  monitor: ['Beruf: Computer starten', 'work'],
  tv: ['Sport und Gaming', 'life'],
  photos: ['Unterwegs', 'life'],
  burgdorf: ['Zuhause', 'life'],
};
// Bildlegenden zu den Nahansichten (Standpunkt -> Titel, Text)
const CAPTIONS = {
  3: ['Unterwegs', 'Ein paar Bilder von Reisen. Zuletzt war ich mit Freunden im Camper im Südwesten der USA und in Kalifornien. Ein Bild auswählen zeigt den Ort, die Pfeiltasten blättern.'],
  5: ['Zuhause', 'Burgdorf. Hier wohne ich, aufgewachsen bin ich ein paar Kilometer weiter im Emmental.'],
};
// Orte für das Rätsel auf der Fotowand (nur Bilder, deren Ort feststeht)
const PLACES = { kyoto: 'Kyoto', sequoia: 'Sequoia-Nationalpark', sf: 'San Francisco', yosemite: 'Yosemite', singapur: 'Singapur', rom: 'Rom', nara: 'Nara', neapel: 'Neapel' };
const QUIZ_ROUNDS = 5;
const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Ein Satz pro Bild der Fotowand, bewusst schlicht gehalten
const PHOTO_TEXT = {
  kyoto: 'Kyoto, spät am Abend.',
  sequoia: 'Sequoia-Nationalpark.',
  sf: 'San Francisco. Die Golden Gate Bridge steckte im Nebel.',
  stadion: 'Mit Freunden an einem Spiel der Nati.',
  yosemite: 'Yosemite, unterhalb des Wasserfalls.',
  singapur: 'Singapur, Gardens by the Bay.',
  rom: 'Rom, das Kolosseum bei Nacht.',
  nara: 'Nara. Die Hirsche dort sind alles andere als scheu.',
  neapel: 'Neapel, hinten der Vesuv.',
  leuchtturm: 'Ein Leuchtturm bei grauem Wetter.',
  roadtrip: 'Unterwegs im Auto.',
};

// ---------- Kleine Helfer ----------
const toastEl = $('#toast');
let toastTimer = 0;
function toast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
}

let audioCtx = null;
function playSlurp() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const len = 0.55, sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 5.5;
    bp.frequency.setValueAtTime(420, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(1750, ctx.currentTime + 0.42);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.34, ctx.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.52);
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start();
  } catch (e) { /* Ton ist optional */ }
}

let scene = null;
let os = null;
let tv = null;

// Kopie eines Lebenslauf-Abschnitts für die Fenster am Computer, ohne doppelte ids
function cloneSection(id) {
  const src = document.getElementById(id);
  const copy = src.cloneNode(true);
  copy.removeAttribute('id');
  copy.removeAttribute('aria-labelledby');
  $$('[id]', copy).forEach((n) => n.removeAttribute('id'));
  return copy;
}

// Knöpfe, die auch in den Kopien der Abschnitte funktionieren müssen
document.addEventListener('click', (e) => {
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    const text = copy.dataset.copy;
    const done = () => toast('E-Mail-Adresse kopiert');
    const fallback = () => {
      // Kopieren nicht erlaubt: Adresse markieren, damit sie von Hand kopiert werden kann
      const mail = copy.parentElement && $('.contact-mail', copy.parentElement);
      if (mail) { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast('Adresse ist markiert, bitte von Hand kopieren');
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (err) { fallback(); }
  }
});

// Kontakt-Knopf der Bühne: mit 3D öffnet er die Nachricht am Computer, ohne 3D springt er zum Abschnitt
const stage = $('#stage');
const caption = $('#caption');
$$('[data-open]', stage).forEach((a) => {
  a.addEventListener('click', (e) => {
    if (!scene) return;
    e.preventDefault();
    scene.enterOS(a.dataset.open);
  });
});
$('#caption-back').addEventListener('click', () => { if (scene) scene.goTo(0); });

// Ortsrätsel auf der Fotowand, in der Art von GeoGuessr: Bild hervorheben, aus drei Orten wählen
const quizBox = $('#quiz');
const quizStart = $('#quiz-start');
const quiz = { on: false, round: 0, score: 0, order: [] };
function quizEnd() {
  quiz.on = false;
  quizBox.hidden = true;
  quizBox.replaceChildren();
  quizStart.hidden = !(scene && scene.view === 3);
  if (scene) scene.quiz = false;
}
function quizButton(label, cls, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn ' + cls;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}
function quizRound() {
  const id = quiz.order[quiz.round];
  const photo = scene.room.photos.find((p) => p.id === id);
  scene.quiz = true;
  scene.photoSticky = photo;
  scene.forcePhoto(photo);
  const others = shuffle(Object.keys(PLACES).filter((k) => k !== id)).slice(0, 2);
  const text = $('.caption-text', caption);
  text.textContent = `Bild ${quiz.round + 1} von ${QUIZ_ROUNDS}: Wo war das?`;
  const answers = document.createElement('div');
  answers.className = 'quiz-answers';
  shuffle([id, ...others]).forEach((k) => answers.appendChild(quizButton(PLACES[k], 'btn-ghost', () => {
    const right = k === id;
    if (right) quiz.score++;
    text.textContent = right ? `Richtig, das ist ${PLACES[id]}.` : `Nicht ganz, das war ${PLACES[id]}.`;
    const last = quiz.round + 1 >= QUIZ_ROUNDS;
    quizBox.replaceChildren(quizButton(last ? 'Auswertung' : 'Nächstes Bild', 'btn-acc', () => {
      quiz.round++;
      if (!last) { quizRound(); return; }
      text.textContent = `${quiz.score} von ${QUIZ_ROUNDS} Orten erkannt.`;
      quizBox.replaceChildren(quizButton('Nochmal', 'btn-acc', startQuiz), quizButton('Rätsel beenden', 'btn-ghost', () => { quizEnd(); scene.forcePhoto(null); }));
      quizBox.firstChild.focus();
    }));
    quizBox.firstChild.focus();
  })));
  quizBox.replaceChildren(answers);
  quizBox.hidden = false;
  answers.firstChild.focus();
}
function startQuiz() {
  if (!scene) return;
  quiz.on = true; quiz.round = 0; quiz.score = 0;
  quiz.order = shuffle(Object.keys(PLACES)).slice(0, QUIZ_ROUNDS);
  quizStart.hidden = true;
  quizRound();
}
quizStart.addEventListener('click', startQuiz);

// Kopfleiste: sichtbar, sobald das Zimmer fast aus dem Bild ist; markiert den Abschnitt, in dem man gerade liest
const bar = $('#bar');
if (bar && 'IntersectionObserver' in window) {
  bar.hidden = false;
  new IntersectionObserver(([e]) => bar.classList.toggle('is-on', !e.isIntersecting), { rootMargin: '-120px 0px 0px 0px' }).observe(stage);
  const links = new Map($$('.bar-links a', bar).map((a) => [a.getAttribute('href').slice(1), a]));
  const seen = new Map();
  links.forEach((a, id) => { const sec = document.getElementById(id); if (sec) sec.dataset.spy = ''; });
  const spy = new IntersectionObserver((list) => {
    list.forEach((e) => seen.set(e.target.id, e.isIntersecting));
    const current = [...links.keys()].find((id) => seen.get(id));
    links.forEach((a, id) => (id === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('[data-spy]').forEach((sec) => spy.observe(sec));
}

// Kontakt als Ticket: wie im Job bekommt jedes Anliegen eine Nummer, die E-Mail ist vorbereitet.
// Ohne JavaScript blendet das CSS den Block aus, die normale E-Mail-Adresse reicht dann.
{
  const no = 'FAB-' + (100 + Math.floor(Math.random() * 900));
  const body = 'Hallo Fabian\r\n\r\nBeschreibung:\r\n\r\n\r\nPriorität: normal\r\n\r\nFreundliche Grüsse\r\n';
  $$('[data-ticket]').forEach((a) => {
    a.href = 'mailto:fabianlocher55@gmail.com?subject=' + encodeURIComponent(no + ': ' + a.dataset.ticket) + '&body=' + encodeURIComponent(body);
  });
}

document.addEventListener('keydown', (e) => {
  if (!scene || stage.dataset.mode) return;
  if (e.key === 'Escape' && (scene.view === 3 || scene.view === 5)) scene.goTo(0);
  // Auf der Fotowand blättern die Pfeiltasten durch die Bilder
  if (scene.view === 3 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); scene.stepPhoto(e.key === 'ArrowRight' ? 1 : -1); }
});

// ---------- 3D-Arbeitszimmer ----------
// Standpunkte: 0 Raum, 1 Schreibtisch, 2 Monitor, 3 Fotowand. minH = Bildwinkel, der in der Breite mindestens sichtbar bleibt.
const VIEWS = [
  { pos: [2.3, 1.78, 2.5], tgt: [-0.25, 0.96, -1.68], fov: 50, minH: 50 },
  null,                                   // früher «Schreibtisch», seit dem Aufräumen nicht mehr nötig
  { pos: [-0.42, 1.095, -0.93], tgt: [-0.42, 1.095, -1.755], fov: 30, minH: 38 },
  { pos: [-0.42, 1.68, -0.95], tgt: [-0.42, 1.68, -2.37], fov: 52, minH: 78 },
];

class Scene {
  constructor(THREE) {
    this.THREE = THREE;
    this.mount = $('#mount');
    this.tip = $('#tip');
    this.tipTitle = $('#tip-title');
    this.tipSub = $('#tip-sub');
    this.hint = $('#hint');
    this.hotLayer = $('#hotspots');
    this.view = 0;
    this.hover = null;
    this.focusLock = false;
    this.mouse = { x: 0, y: 0 };
    this.visible = true;
    this.running = false;
    this.frames = 0; this.fpsT = 0; this.slow = 0;
    this.loop = this.loop.bind(this);
    this.build();
  }

  build() {
    const THREE = this.THREE;
    const mobile = window.innerWidth < 760;
    const shadows = !mobile && !reducedMotion();
    const size = this.size();

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: 'high-performance' });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    renderer.setPixelRatio(this.pixelRatio);
    renderer.setSize(size.w, size.h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.replaceChildren(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x352a20);
    scene.fog = new THREE.Fog(0x3d3124, 8, 17);
    this.scene = scene;
    this.cam = new THREE.PerspectiveCamera(46, size.w / size.h, 0.05, 40);

    scene.add(new THREE.HemisphereLight(0xfff0d8, 0x7d6450, 0.7));
    scene.add(new THREE.AmbientLight(0xffe4c2, 0.48));
    const sun = new THREE.DirectionalLight(0xffd4a0, 1.75);
    sun.position.set(-6.5, 4.2, 1.2);
    sun.target.position.set(0.2, 0.7, -1.6);
    scene.add(sun.target);
    if (shadows) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      const c = sun.shadow.camera;
      c.left = -4.2; c.right = 4.2; c.top = 3.2; c.bottom = -1.4; c.near = 1; c.far = 16;
      sun.shadow.bias = -0.0012;
      sun.shadow.normalBias = 0.02;
    }
    scene.add(sun);
    const lamp = new THREE.PointLight(0xffb35c, 1.1, 3.2, 2);
    lamp.position.set(-0.93, 1.04, -1.9);
    scene.add(lamp);
    const fill = new THREE.PointLight(0xa8c4e0, 0.28, 6, 2);
    fill.position.set(1.6, 2.2, 1.4);
    scene.add(fill);

    this.room = buildRoom(THREE, { shadows });
    scene.add(this.room.root);

    // Der Fernseher im Zimmer zeigt dasselbe Live-Bild wie der Sofa-Modus
    if (tv) {
      this.tvTex = new THREE.CanvasTexture(tv.canvas);
      this.tvTex.colorSpace = THREE.SRGBColorSpace;
      this.room.tv.screenMat.color.set(0xffffff);
      this.room.tv.screenMat.map = this.tvTex;
      this.room.tv.screenMat.needsUpdate = true;
      // Standpunkt direkt vor dem Fernseher
      const m = this.room.tv.mesh;
      m.updateWorldMatrix(true, false);
      const c = m.getWorldPosition(new THREE.Vector3());
      const n = m.getWorldDirection(new THREE.Vector3());
      VIEWS[4] = { pos: c.clone().addScaledVector(n, 1.25).toArray(), tgt: c.toArray(), fov: 30, minH: 40 };
    }
    {
      // Standpunkt vor dem Fenster
      const w = this.room.window.mesh;
      w.updateWorldMatrix(true, false);
      const c = w.getWorldPosition(new THREE.Vector3());
      const n = w.getWorldDirection(new THREE.Vector3());
      c.y += 0.12;
      VIEWS[5] = { pos: c.clone().addScaledVector(n, 1.3).toArray(), tgt: c.toArray(), fov: 66, minH: 64 };
    }
    this.entries = {};
    this.room.clickables.forEach((c) => { this.entries[c.id] = c; });

    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2(-9, -9);
    const v0 = this.pose(0);
    this.camState = {
      pos: new THREE.Vector3().fromArray(v0.pos),
      tgt: new THREE.Vector3().fromArray(v0.tgt),
      fov: v0.fov, minH: v0.minH,
    };
    this.from = null; this.to = null; this.t0 = 0; this.dur = 0;

    this.buildHotspots();

    const el = renderer.domElement;
    el.addEventListener('pointermove', (e) => this.onMove(e));
    el.addEventListener('pointerleave', () => { this.ptr.set(-9, -9); this.setHover(null); });
    // Klick mit eigener Trefferprüfung, damit auch ein Tipp auf dem Handy ohne vorherige Bewegung trifft
    el.addEventListener('click', (e) => {
      this.setPointer(e);
      if (this.view === 3) {                              // auf der Fotowand wählt ein Klick das Bild
        if (this.quiz) return;
        this.photoSticky = this.pickPhoto();
        this.setPhoto(this.photoSticky);
        if (e.pointerType && e.pointerType !== 'mouse') this.ptr.set(-9, -9);
        return;
      }
      const hit = this.pick();
      if (hit && hit.clickable) this.activate(hit.id);
      // Nach einem Tipp bleibt kein Mauszeiger stehen, also auch keine Hervorhebung
      if (e.pointerType && e.pointerType !== 'mouse') { this.ptr.set(-9, -9); this.setHover(null); }
    });

    new ResizeObserver(() => this.resize()).observe(this.mount);
    new IntersectionObserver((list) => {
      this.visible = list[0].isIntersecting;
      this.start();
    }, { threshold: 0.02 }).observe(stage);
    document.addEventListener('visibilitychange', () => this.start());

    this.clock = new THREE.Clock();
    this.resize();
    this.start();
  }

  size() {
    const w = Math.round(this.mount.clientWidth) || 0;
    const h = Math.round(this.mount.clientHeight) || 0;
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  resize() {
    const { w, h } = this.size();
    this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
  }

  start() {
    const should = this.visible && !document.hidden && !this.paused;
    if (should && !this.running) {
      this.running = true;
      this.clock.getDelta();
      this.fpsT = performance.now(); this.frames = 0;
      requestAnimationFrame(this.loop);
    } else if (!should) {
      this.running = false;
    }
  }

  // --- Markierungen und Tastaturziele über den Gegenständen ---
  buildHotspots() {
    this.hots = [];
    this.hotLayer.replaceChildren();
    // Wichtiges zuerst: so erreicht die Tabulatortaste den Computer vor dem Bürostuhl
    const order = ['monitor', 'tv', 'photos', 'burgdorf', 'chess', 'mate'];
    const rank = (c) => { const i = order.indexOf(c.id); return i < 0 ? order.length : i; };
    [...this.room.clickables].sort((a, b) => rank(a) - rank(b)).forEach((c) => {
      const l = LABELS[c.id] || [c.label, c.hint || ''];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hot';
      b.dataset.id = c.id;
      // Der Name für Screenreader beginnt mit dem sichtbaren Text
      b.setAttribute('aria-label', HOT[c.id] ? HOT[c.id][0] + '. ' + l[0] + ': ' + l[1] : l[0] + ': ' + l[1]);
      if (HOT[c.id]) {
        b.classList.add('hot-cv', 'hot-' + HOT[c.id][1]);
        const s = document.createElement('span');
        s.className = 'hot-label';
        // Auf dem Handy reicht die kurze Fassung
        s.textContent = window.innerWidth < 700 ? HOT[c.id][0].replace('Beruf: ', '') : HOT[c.id][0];
        b.appendChild(s);
        b.addEventListener('pointerenter', () => { this.focusLock = true; this.setHover({ id: c.id, entry: c, clickable: true }, b); });
        b.addEventListener('pointerleave', () => { this.focusLock = false; this.setHover(null); });
      }
      b.addEventListener('focus', () => { if (b.matches(':focus-visible')) { this.focusLock = true; this.setHover({ id: c.id, entry: c, clickable: true }, b); } });
      b.addEventListener('blur', () => { this.focusLock = false; this.setHover(null); });
      b.addEventListener('click', () => this.activate(c.id));
      this.hotLayer.appendChild(b);
      this.hots.push({ btn: b, entry: c });
    });
  }

  setPointer(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    return r;
  }

  onMove(e) {
    this.lastInput = performance.now();
    const r = this.setPointer(e);
    if (e.pointerType === 'mouse') {
      this.mouse.x = (e.clientX - r.left) / r.width - 0.5;
      this.mouse.y = (e.clientY - r.top) / r.height - 0.5;
    }
    this.tip.style.left = (e.clientX - r.left) + 'px';
    this.tip.style.top = (e.clientY - r.top - 16) + 'px';
  }

  pick() {
    this.ray.setFromCamera(this.ptr, this.cam);
    const hits = this.ray.intersectObject(this.room.root, true);
    for (let i = 0; i < hits.length; i++) {
      let o = hits[i].object;
      while (o) {
        const c = this.room.clickables.find((x) => x.group === o);
        if (c) return { id: c.id, entry: c, clickable: true };
        const it = this.room.interests.find((x) => x.group === o);
        if (it) return { id: it.id, entry: it, clickable: false };
        o = o.parent;
      }
    }
    return null;
  }

  // Standpunkt je nach Format: im Hochformat rückt die Kamera näher an Schreibtisch und Fernseher
  pose(i) {
    if (i === 0 && this.cam.aspect < 0.8) return { pos: [1.5, 1.62, 0.7], tgt: [-0.62, 1.02, -1.75], fov: 50, minH: 56 };
    return VIEWS[i];
  }

  // Pfeiltasten auf der Fotowand: zum nächsten oder vorherigen Bild
  stepPhoto(dir) {
    if (this.quiz) return;
    const list = this.room.photos;
    const i = this.photoSticky ? list.indexOf(this.photoSticky) : (dir > 0 ? -1 : 0);
    this.photoSticky = list[(i + dir + list.length) % list.length];
    this.ptr.set(-9, -9);
    this.setPhoto(this.photoSticky);
  }

  // Einzelnes Bild der Fotowand unter dem Zeiger
  pickPhoto() {
    this.ray.setFromCamera(this.ptr, this.cam);
    const hits = this.ray.intersectObjects(this.room.photos.map((p) => p.group), true);
    for (let i = 0; i < hits.length; i++) {
      let o = hits[i].object;
      while (o) {
        const p = this.room.photos.find((x) => x.group === o);
        if (p) return p;
        o = o.parent;
      }
    }
    return null;
  }

  // Bild hervorheben, unabhängig vom Zeiger (für das Ortsrätsel)
  forcePhoto(p) {
    const q = this.quiz;
    this.quiz = false;
    this.setPhoto(p);
    this.quiz = q;
    // Im Rätsel tritt das gefragte Bild deutlich hervor
    if (p && q) { p.group.scale.setScalar(1.2); p.group.position.z = 0.06; }
  }

  setPhoto(p) {
    if (p === this.photo || this.quiz) return;
    if (this.photo) { this.photo.group.scale.setScalar(1); this.photo.group.position.z = 0; }
    this.photo = p || null;
    if (p) { p.group.scale.setScalar(1.06); p.group.position.z = 0.02; }
    $('.caption-text', caption).textContent = p ? PHOTO_TEXT[p.id] || '' : CAPTIONS[3][1];
    this.renderer.domElement.style.cursor = p ? 'pointer' : 'default';
  }

  highlight(entry, on) {
    if (!entry) return;
    if (!entry._mats) {
      entry._mats = [];
      entry.group.traverse((o) => {
        if (o.isMesh && o.material && o.material.isMeshLambertMaterial) {
          o.material = o.material.clone();
          entry._mats.push(o.material);
        }
      });
      entry._y = entry.group.position.y;
      this.accent = this.accent || new this.THREE.Color(CONFIG.accent);
    }
    entry._mats.forEach((m) => {
      if (on) m.emissive.copy(this.accent); else m.emissive.setHex(0x000000);
      m.emissiveIntensity = on ? 0.5 : 0;
    });
    entry.group.position.y = entry._y + (on ? 0.012 : 0);
    entry.group.scale.setScalar(on ? 1.03 : 1);
  }

  setHover(h, anchorBtn) {
    const same = (h && this.hover && h.id === this.hover.id) || (!h && !this.hover);
    if (same) return;
    if (this.hover) this.highlight(this.hover.entry, false);
    this.hover = h;
    const canvas = this.renderer.domElement;
    if (h) {
      this.highlight(h.entry, true);
      const l = LABELS[h.id] || [h.entry.label, ''];
      this.tipTitle.textContent = l[0];
      this.tipSub.textContent = l[1];
      if (anchorBtn) {
        this.tip.style.left = anchorBtn.style.left;
        this.tip.style.top = (parseFloat(anchorBtn.style.top) - 20) + 'px';
      }
      // Punkte mit eigener Beschriftung brauchen den Hinweis nicht doppelt
      this.tip.classList.toggle('is-on', !(anchorBtn && anchorBtn.classList.contains('hot-cv')));
      canvas.style.cursor = h.clickable ? 'pointer' : 'default';
    } else {
      this.tip.classList.remove('is-on');
      canvas.style.cursor = 'default';
    }
  }

  interacted() {
    if (this.hint) this.hint.classList.add('is-done');
  }

  goTo(i, instant) {
    this.lastInput = performance.now();
    if (i === 3) this.room.loadFullPhotos();
    const v = this.pose(i);
    if (!v) return;
    const T = this.THREE;
    this.from = { pos: this.camState.pos.clone(), tgt: this.camState.tgt.clone(), fov: this.camState.fov, minH: this.camState.minH };
    this.to = { pos: new T.Vector3().fromArray(v.pos), tgt: new T.Vector3().fromArray(v.tgt), fov: v.fov, minH: v.minH };
    // Im Hochformat braucht die Fotowand mehr Abstand, damit alle Bilder ins Bild passen
    if (i === 3 && this.cam.aspect < 1) this.to.pos.z = -0.15;
    this.dur = instant || reducedMotion() ? 0 : CONFIG.transitionMs;
    this.t0 = performance.now();
    this.view = i;
    stage.dataset.view = String(i);
    if (quiz.on) quizEnd();
    this.photoSticky = null;
    this.setPhoto(null);
    quizStart.hidden = i !== 3;
    // Bildlegende für die Nahansichten
    const cap = CAPTIONS[i];
    caption.hidden = !cap;
    if (cap) { $('.caption-title', caption).textContent = cap[0]; $('.caption-text', caption).textContent = cap[1]; }
  }

  // Ein Gegenstand wurde angeklickt
  activate(id) {
    this.interacted();
    if (id === 'monitor') this.enterOS();
    else if (id === 'tv') this.enterTV();
    else if (id === 'photos') this.goTo(this.view === 3 ? 0 : 3);
    else if (id === 'burgdorf') this.goTo(this.view === 5 ? 0 : 5);
    else if (id === 'chess') { this.room.chess.move(); toast('Schach spiele ich gern. Der Springer zieht nach f3.'); }
    else if (id === 'mate') { playSlurp(); toast('El Tony Mate. Steht bei mir fast immer auf dem Tisch.'); }
  }

  // Lage des 3D-Bildschirms auf der Bühne, in Pixeln
  screenRect(s = this.room.screen) {
    const T = this.THREE;
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    this.cam.updateMatrixWorld();
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
      const v = new T.Vector3((sx * s.width) / 2, (sy * s.height) / 2, 0);
      s.mesh.localToWorld(v);
      v.project(this.cam);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
    });
    return { left: l, top: t, right: r, bottom: b };
  }

  // Kamera fährt in den Monitor, dann wächst die Oberfläche aus dem Bildschirm auf die ganze Bühne
  enterOS(app) {
    if (!os || os.isOpen || this.osBusy) return;
    this.interacted();
    this.osBusy = true;
    this.osReturn = 0;
    this.setHover(null);
    stage.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    this.goTo(2);
    stage.dataset.mode = 'os';
    setTimeout(() => {
      os.open(this.screenRect());
      if (app) setTimeout(() => os.openApp(app), 2200);
      setTimeout(() => { this.paused = true; this.start(); this.osBusy = false; }, 500);
    }, this.dur ? this.dur * 0.82 : 0);
  }

  // Sofa-Modus: Kamera fährt vor den Fernseher, das Bild füllt die Bühne
  enterTV(channel) {
    if (!tv || tv.isOpen || this.osBusy || !VIEWS[4]) return;
    this.osBusy = true;
    this.osReturn = 0;
    this.setHover(null);
    stage.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    this.goTo(4);
    stage.dataset.mode = 'tv';
    setTimeout(() => {
      tv.open(this.screenRect(this.room.tv), channel);
      setTimeout(() => { this.paused = true; this.start(); this.osBusy = false; }, 500);
    }, this.dur ? this.dur * 0.82 : 0);
  }

  exitTV() {
    if (!tv || !tv.isOpen || this.osBusy) return;
    this.osBusy = true;
    this.paused = false;
    this.start();
    tv.close(this.screenRect(this.room.tv), () => {
      stage.dataset.mode = '';
      this.goTo(this.osReturn || 0);
      this.osBusy = false;
      const m = this.hots.find((x) => x.entry.id === 'tv');
      if (m) m.btn.focus({ preventScroll: true });
    });
  }

  exitOS() {
    if (!os || !os.isOpen || this.osBusy) return;
    this.osBusy = true;
    this.paused = false;
    this.start();
    os.close(this.screenRect(), () => {
      stage.dataset.mode = '';
      this.goTo(this.osReturn || 0);
      this.osBusy = false;
      const m = this.hots.find((x) => x.entry.id === 'monitor');
      if (m) m.btn.focus({ preventScroll: true });
    });
  }

  loop() {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const T = this.THREE;
    const now = performance.now();
    // Ruhezustand: ohne Kamerafahrt und ohne Eingabe reichen nach 2,5 s 24 Bilder pro Sekunde, nach 8 s noch 10.
    // Bewegt sich dann nur noch der Fernseher, spart das auf dem Handy Akku und Rechenzeit.
    const quiet = !this.to && !stage.dataset.mode ? now - (this.lastInput || 0) : 0;
    const gap = quiet > 8000 ? 100 : quiet > 2500 ? 41 : 0;
    if (gap && now - (this.lastFrame || 0) < gap) return;
    this.lastFrame = now;
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;
    const cs = this.camState;

    if (this.to) {
      const k = this.dur > 0 ? Math.min(1, (now - this.t0) / this.dur) : 1;
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cs.pos.lerpVectors(this.from.pos, this.to.pos, e);
      cs.tgt.lerpVectors(this.from.tgt, this.to.tgt, e);
      cs.fov = this.from.fov + (this.to.fov - this.from.fov) * e;
      cs.minH = this.from.minH + (this.to.minH - this.from.minH) * e;
      if (k >= 1) this.to = null;
    }

    // Im Hochformat den Bildwinkel öffnen, damit der Schreibtisch im Bild bleibt
    const needV = 2 * Math.atan(Math.tan((cs.minH * Math.PI) / 360) / this.cam.aspect) * (180 / Math.PI);
    const fov = Math.min(88, Math.max(cs.fov, needV));
    const par = reducedMotion() || this.view !== 0 ? 0 : 1;
    this.cam.position.copy(cs.pos);
    if (Math.abs(this.cam.fov - fov) > 0.001) { this.cam.fov = fov; this.cam.updateProjectionMatrix(); }
    const look = this._look || (this._look = new T.Vector3());
    look.copy(cs.tgt);
    look.x += this.mouse.x * 0.16 * par;
    look.y -= this.mouse.y * 0.1 * par;
    this.cam.lookAt(look);

    if (!reducedMotion()) this.room.tick(t, dt);
    // Live-Bild für den Fernseher im Zimmer: 15 Bilder pro Sekunde reichen für die kleine Fläche
    if (this.tvTex && now - (this.tvT || 0) > 66) { this.tvT = now; tv.draw(now); this.tvTex.needsUpdate = true; }

    // Markierungen an die Gegenstände heften
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    const v = this._v || (this._v = new T.Vector3());
    for (const { btn, entry } of this.hots) {
      if (entry.anchor) { v.copy(entry.anchor); entry.group.localToWorld(v); }
      else { entry.group.getWorldPosition(v); v.y += 0.06; }
      v.project(this.cam);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      const on = v.z < 1 && x > 8 && x < w - 8 && y > 8 && y < h - 8;
      btn.hidden = !on;
      if (on) {
        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
        const lab = btn.firstElementChild;
        btn.classList.toggle('is-left', lab ? x + 40 + lab.offsetWidth > w - 8 : false);
      }
    }

    if (this.view === 3 && !stage.dataset.mode) {
      if (this.hover) this.setHover(null);
      if (!this.to) this.setPhoto(this.ptr.x > -2 ? this.pickPhoto() || this.photoSticky : this.photoSticky);
    } else if (!stage.dataset.mode) {
      if (!this.focusLock) this.setHover(this.ptr.x > -2 ? this.pick() : null);
    } else if (this.hover && !this.focusLock) {
      this.setHover(null);
    }

    this.renderer.render(this.scene, this.cam);

    // Bildrate überwachen: bleibt sie tief, wird die Auflösung reduziert
    this.frames++;
    if (now - this.fpsT > 1000) {
      const fps = (this.frames * 1000) / (now - this.fpsT);
      this.frames = 0; this.fpsT = now;
      this.slow = fps < 24 ? this.slow + 1 : 0;
      if (this.slow >= 3 && this.pixelRatio > 1) {
        this.pixelRatio = 1;
        this.renderer.setPixelRatio(1);
        this.resize();
        this.slow = 0;
      }
    }
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

async function boot() {
  if (!stage) return;
  if (!hasWebGL()) { stage.dataset.state = 'static'; return; }     // ohne 3D: ruhige Kopfzeile
  stage.dataset.state = 'loading';
  try {
    // Erst Schriften und Titelbild, dann die 3D-Szene: so steht der Text sofort und Three.js drängelt nicht vor
    if (document.readyState !== 'complete') await new Promise((r) => addEventListener('load', r, { once: true }));
    // Three.js wird erst jetzt nachgeladen, als eigenes Paket und nur mit den Teilen, die die Szene braucht
    const THREE = await import('./scene/three.js');
    tv = createTV({ stage, onExit: () => scene.exitTV() });
    scene = new Scene(THREE);
    os = createOS({ stage, cloneSection, onExit: () => scene.exitOS(), toast, slurp: playSlurp });
    stage.dataset.state = 'ready';
  } catch (err) {
    console.error('Arbeitszimmer konnte nicht geladen werden, die Seite bleibt beim Lebenslauf.', err);
    scene = null;
    stage.dataset.state = 'static';
  }
}

boot();
