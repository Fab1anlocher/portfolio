// Der Fernseher: fünf Programme, live auf eine Leinwand gezeichnet.
// Dieselbe Leinwand läuft klein auf dem 3D-Fernseher im Zimmer und gross im Sofa-Modus.
// Programm 5 ist die Konsole mit einem spielbaren Field-Goal-Kick.

const W = 640, H = 360;
const MONO = '500 13px "JetBrains Mono", ui-monospace, monospace';
const rnd = (seed) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const clock = (sec) => Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');

function bug(g, left, right) {
  g.font = MONO; g.textBaseline = 'middle'; g.textAlign = 'left';
  const wl = g.measureText(left).width + 22, wr = g.measureText(right).width + 22;
  g.fillStyle = 'rgba(8,11,16,.88)'; g.fillRect(16, 14, wl, 26);
  g.fillStyle = '#d98a2b'; g.fillRect(16 + wl, 14, wr, 26);
  g.fillStyle = '#f2f5f9'; g.fillText(left, 27, 28);
  g.fillStyle = '#1d1712'; g.fillText(right, 27 + wl, 28);
  g.fillStyle = '#e5484d'; g.beginPath(); g.arc(W - 62, 27, 5, 0, 7); g.fill();
  g.fillStyle = '#f2f5f9'; g.fillText('LIVE', W - 50, 28);
}
const dot = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };

// ---------- 1 · American Football: ein Angriff nach dem anderen ----------
function football(g, t) {
  const playT = 6, n = Math.floor(t / playT), k = (t % playT) / playT;
  const down = (n % 4) + 1, los = 150 + ((n * 67) % 300);       // Line of Scrimmage in Pixeln
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#2f7d3f' : '#2a7138'; g.fillRect(i * 54 - 4, 0, 54, H); }
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2;
  for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * 54 - 4, 50); g.lineTo(i * 54 - 4, H - 44); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; g.font = '600 20px system-ui, sans-serif'; g.textAlign = 'center';
  [10, 20, 30, 40, 50, 40, 30, 20, 10].forEach((v, i) => g.fillText(String(v), (i + 2) * 54 - 4, H - 62));
  g.fillStyle = '#3d6fd1'; g.fillRect(los - 1.5, 50, 3, H - 94);
  g.fillStyle = '#f2c230'; g.fillRect(los + 108 - 1.5, 50, 3, H - 94);   // First-Down-Linie
  const snap = clamp01((k - 0.18) / 0.82);
  const tgt = 1 + Math.floor(rnd(n) * 3);                                   // welcher Receiver den Ball bekommt
  const rec = [0, 1, 2, 3].map((i) => {
    const y0 = 80 + i * 62, depth = 70 + rnd(n * 7 + i) * 150, cut = (rnd(n * 3 + i) - 0.5) * 90;
    const p = clamp01(snap * 1.5);
    return [los + depth * p, y0 + cut * clamp01(p * 2 - 1)];
  });
  const qb = [los - 22 - 26 * clamp01(snap * 3), 180];
  for (let i = 0; i < 5; i++) {                                             // die beiden Linien
    const y = 120 + i * 30, push = Math.sin(t * 9 + i) * 2 * (snap > 0 ? 1 : 0);
    dot(g, los - 9 + push, y, 7, '#f2f5f9'); dot(g, los + 9 + push, y, 7, '#c2413a');
  }
  rec.forEach(([x, y], i) => { dot(g, x, y, 7, '#f2f5f9'); dot(g, x + 16 + Math.sin(t * 3 + i) * 5, y + 9, 7, '#c2413a'); });
  dot(g, qb[0], qb[1], 7, '#f2f5f9');
  const th = clamp01((snap - 0.38) / 0.34), [rx, ry] = rec[tgt];
  const bx = snap < 0.38 ? qb[0] + 6 : lerp(qb[0], rx, th), by = snap < 0.38 ? qb[1] : lerp(qb[1], ry, th) - Math.sin(th * Math.PI) * 46;
  g.fillStyle = '#7a4a22'; g.beginPath(); g.ellipse(bx, by, 6 + Math.sin(th * Math.PI) * 3, 4, 0.5, 0, 7); g.fill();
  const yards = Math.round((rx - los) / 5.4);
  bug(g, 'BURGDORF 21 : 17 BERN', down + '. & 10 · Q4 ' + clock(131 - (t % 131)));
  if (snap > 0.8) { g.font = '600 22px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(yards >= 20 ? 'FIRST DOWN  +' + yards : '+' + yards + ' YARDS', W / 2, 74); }
}

// ---------- 2 · Bundesliga-Konferenz mit Kickbase-Punkten ----------
function bundesliga(g, t) {
  const PW = 452;
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#2e8a45' : '#297c3e'; g.fillRect(i * PW / 8, 0, PW / 8 + 1, H); }
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2;
  g.strokeRect(18, 56, PW - 36, H - 104); g.beginPath(); g.moveTo(PW / 2, 56); g.lineTo(PW / 2, H - 48); g.stroke();
  g.beginPath(); g.arc(PW / 2, 180, 40, 0, 7); g.stroke();
  g.strokeRect(18, 120, 56, 120); g.strokeRect(PW - 74, 120, 56, 120);
  const form = [[40, 180], [110, 96], [110, 152], [110, 208], [110, 264], [190, 120], [190, 180], [190, 240], [270, 100], [280, 180], [270, 260]];
  const sway = (i, s) => [Math.sin(t * 0.7 + i * 1.7) * 14 * s, Math.cos(t * 0.9 + i * 2.3) * 12];
  const A = form.map(([x, y], i) => { const [dx, dy] = sway(i, 1); return [x + 60 + dx + Math.sin(t * 0.25) * 30, y + dy]; });
  const B = form.map(([x, y], i) => { const [dx, dy] = sway(i + 20, -1); return [PW - x - 20 + dx + Math.sin(t * 0.25) * 30, y + dy]; });
  B.forEach(([x, y]) => dot(g, x, y, 7, '#f5d000'));
  A.forEach(([x, y]) => dot(g, x, y, 7, '#d2232a'));
  const seq = [6, 9, 8, 5, 10, 9, 7, 6], step = t / 0.9, i0 = Math.floor(step) % seq.length, kk = step % 1;
  const [ax, ay] = A[seq[i0]], [bx2, by2] = A[seq[(i0 + 1) % seq.length]];
  dot(g, lerp(ax, bx2, kk), lerp(ay, by2, kk) - Math.sin(kk * Math.PI) * 6, 4.5, '#fff');
  // Seitenleiste: was die eigenen Spieler gerade einbringen
  g.fillStyle = '#0d1119'; g.fillRect(PW, 0, W - PW, H);
  g.font = MONO; g.textAlign = 'left'; g.fillStyle = '#d98a2b'; g.fillText('KICKBASE · LIVE', PW + 14, 72);
  [['Sturm', 4.1], ['Zehner', 2.7], ['Sechser', 1.9], ['Aussenbahn', 3.3], ['Tor', 0.8]].forEach(([pos, rate], i) => {
    const y = 104 + i * 40, pts = Math.floor(40 + ((t * rate * 3 + i * 31) % 190));
    g.fillStyle = '#93a4bb'; g.fillText(pos, PW + 14, y);
    g.fillStyle = '#f2f5f9'; g.textAlign = 'right'; g.fillText(String(pts), W - 14, y); g.textAlign = 'left';
    g.fillStyle = '#1e2838'; g.fillRect(PW + 14, y + 10, W - PW - 28, 4);
    g.fillStyle = '#3fb37a'; g.fillRect(PW + 14, y + 10, (W - PW - 28) * (pts / 230), 4);
  });
  g.fillStyle = '#93a4bb'; g.fillText('Spieltag gesamt', PW + 14, 312);
  g.fillStyle = '#f2f5f9'; g.textAlign = 'right'; g.fillText(String(1040 + Math.floor((t * 7) % 400)), W - 14, 312);
  bug(g, 'SCF 1 : 1 FCB', 'KONFERENZ · ' + (60 + Math.floor((t / 4) % 30)) + '.');
}

// ---------- 3 · Schwingen: Schlussgang im Sägemehl ----------
function schwingen(g, t) {
  g.fillStyle = '#3f8a48'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) dot(g, rnd(i) * W, rnd(i + 50) * H, 5 + rnd(i + 9) * 4, i % 3 ? '#d7dde4' : '#b9a27a');  // Publikum
  g.fillStyle = '#3f8a48'; g.beginPath(); g.arc(W / 2, 195, 172, 0, 7); g.fill();
  g.fillStyle = '#d9b77c'; g.beginPath(); g.arc(W / 2, 195, 138, 0, 7); g.fill();
  g.fillStyle = '#cda968'; for (let i = 0; i < 60; i++) dot(g, W / 2 + (rnd(i + 3) - 0.5) * 230, 195 + (rnd(i + 77) - 0.5) * 230, 2, '#c59f5c');
  const cyc = t % 9, a = t * 0.9, throwK = clamp01((cyc - 7) / 0.7), d = 17 - throwK * 6;
  const cx = W / 2 + Math.sin(t * 0.4) * 30, cy = 195 + Math.cos(t * 0.5) * 22;
  const p1 = [cx + Math.cos(a) * d, cy + Math.sin(a) * d], p2 = [cx - Math.cos(a) * d, cy - Math.sin(a) * d];
  g.lineCap = 'round'; g.lineWidth = 9; g.strokeStyle = '#e9d9c3';
  g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke();                      // Griff an die Zwilchhose
  g.save(); g.translate(p2[0], p2[1]); g.scale(1 + throwK * 0.5, 1 - throwK * 0.35); dot(g, 0, 0, 15, '#7b5a3c'); g.restore();
  dot(g, p1[0], p1[1], 15, '#2f4f8a'); dot(g, p1[0], p1[1], 7, '#e0b48f'); dot(g, p2[0], p2[1], 7, '#e0b48f');
  if (throwK > 0.9) { g.font = '600 24px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#1d1712'; g.fillText('Plattwurf!', W / 2, 92); }
  bug(g, 'SCHLUSSGANG', '6. Gang · ' + clock(cyc * 60 / 9 * 8));
  modelBoard(g);
}

// Einblendung wie im Fernsehen, mit echten Zahlen aus dem eigenen Projekt Schwingen ML:
// Trefferquote auf allen Gängen der Saison 2026, die das Modell beim Training nicht gesehen hat.
const MODEL = [['Schwingen ML', 70.3, '#d98a2b'], ['Elo-Prognose', 66.2, '#8b96a3']];
function modelBoard(g) {
  const x = 112, y = 270, w = W - 224, h = 76, bar = w - 196;
  g.fillStyle = 'rgba(8,11,16,.88)'; g.fillRect(x, y, w, h);
  g.font = MONO; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = '#b8c2cd'; g.fillText('TREFFER SAISON 2026 · 37’747 GÄNGE', x + 14, y + 16);
  MODEL.forEach(([name, pct, c], i) => {
    const ry = y + 38 + i * 22;
    g.fillStyle = '#f2f5f9'; g.textAlign = 'left'; g.fillText(name, x + 14, ry);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 130, ry - 6, bar, 12);
    g.fillStyle = c; g.fillRect(x + 130, ry - 6, bar * pct / 100, 12);
    g.fillStyle = '#f2f5f9'; g.textAlign = 'right'; g.fillText(pct.toFixed(1).replace('.', ',') + ' %', x + w - 14, ry);
  });
}

// ---------- 4 · Ski Alpin ----------
function ski(g, t) {
  g.fillStyle = '#eef3f8'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#dbe5ef'; g.beginPath(); g.moveTo(0, 0); g.lineTo(130, 0); g.lineTo(40, H); g.lineTo(0, H); g.fill();
  g.beginPath(); g.moveTo(W, 0); g.lineTo(W - 110, 0); g.lineTo(W - 30, H); g.lineTo(W, H); g.fill();
  for (let i = 0; i < 8; i++) { const y = ((i * 60 + t * 60) % 480) - 60; dot(g, 60 + rnd(i) * 30, y, 14, '#3d6b4a'); dot(g, W - 70 + rnd(i + 5) * 30, y + 30, 14, '#3d6b4a'); }
  const speed = 170;
  for (let i = 0; i < 7; i++) {
    const y = ((i * 76 * Math.PI / 3 + t * speed) % (H + 80)) - 40, world = y - t * speed;
    const x = W / 2 + Math.sin(world / 76 + Math.PI) * 150, c = Math.abs(Math.round(world / (76 * Math.PI / 3))) % 2 ? '#d2232a' : '#2f5fd0';
    g.fillStyle = c; g.fillRect(x - 2, y - 26, 4, 26); g.fillRect(x - 2, y - 26, 22, 12);
  }
  g.strokeStyle = 'rgba(120,150,180,.5)'; g.lineWidth = 3; g.beginPath();
  for (let y = 0; y <= 150; y += 6) g[y ? 'lineTo' : 'moveTo'](W / 2 + Math.sin((y - t * speed) / 76 + Math.PI) * 120, y);
  g.stroke();
  const x = W / 2 + Math.sin((150 - t * speed) / 76 + Math.PI) * 120, lean = Math.cos((150 - t * speed) / 76 + Math.PI) * 0.5;
  g.save(); g.translate(x, 150); g.rotate(lean);
  g.fillStyle = '#1d1712'; g.fillRect(-9, 6, 4, 24); g.fillRect(5, 6, 4, 24);
  dot(g, 0, 0, 10, '#d2232a'); dot(g, 0, -12, 6, '#f2f5f9'); g.restore();
  const split = Math.sin(Math.floor(t / 4) * 2.4) * 0.6, good = split < 0;
  g.fillStyle = good ? '#1f9d55' : '#d2232a'; g.fillRect(W - 150, 54, 134, 30);
  g.fillStyle = '#fff'; g.font = MONO; g.textAlign = 'center'; g.fillText((good ? '−' : '+') + Math.abs(split).toFixed(2) + ' s', W - 83, 70);
  bug(g, 'SKI ALPIN · RIESENSLALOM', '2. Lauf');
}

// ---------- 5 · Konsole: Field-Goal-Kick ----------
function makeKick() {
  const s = { state: 'ready', made: 0, lives: 3, best: 0, t0: 0, aim: 0, wind: 0, flight: null, msg: '' };
  const newWind = () => { s.wind = Math.round((Math.random() * 2 - 1) * (4 + s.made * 1.2)); };
  const dist = () => 25 + s.made * 5;
  const half = () => Math.max(26, 74 - s.made * 6);           // halbe Torbreite in Pixeln
  newWind();
  return {
    press(now) {
      if (s.state === 'over') { s.made = 0; s.lives = 3; s.state = 'ready'; newWind(); return 'start'; }
      if (s.state !== 'ready') return null;
      const x = s.aim * 190 + s.wind * 7;
      s.flight = { t0: now, x, good: Math.abs(x) < half() - 4 };
      s.state = 'fly';
      return 'kick';
    },
    draw(g, t, now) {
      const sky = g.createLinearGradient(0, 0, 0, 200); sky.addColorStop(0, '#0d1b33'); sky.addColorStop(1, '#274a7a');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) dot(g, rnd(i) * W, 96 + rnd(i + 30) * 70, 3, ['#e5484d', '#f2c230', '#f2f5f9', '#3d6fd1'][i % 4]);   // Tribüne
      g.fillStyle = '#2a7138'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 190); g.lineTo(W, 190); g.lineTo(W, H); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const y = 200 + i * i * 9; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      const hw = half(), cx = W / 2;
      g.strokeStyle = '#f2c230'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx, 190); g.lineTo(cx, 150); g.moveTo(cx - hw, 150); g.lineTo(cx + hw, 150); g.moveTo(cx - hw, 150); g.lineTo(cx - hw, 60); g.moveTo(cx + hw, 150); g.lineTo(cx + hw, 60); g.stroke();
      if (s.state === 'ready') s.aim = Math.sin(t * (2.2 + s.made * 0.25));
      // Zielanzeige
      g.fillStyle = 'rgba(8,11,16,.8)'; g.fillRect(cx - 200, 318, 400, 14);
      g.fillStyle = '#3fb37a'; g.fillRect(cx - hw, 318, hw * 2, 14);
      g.fillStyle = '#fff'; g.fillRect(cx + s.aim * 190 - 2, 312, 4, 26);
      let bx = cx, by = 292, r = 9;
      if (s.state === 'fly') {
        const k = clamp01((now - s.flight.t0) / 1100);
        bx = cx + s.flight.x * k; by = lerp(292, 96, k) - Math.sin(k * Math.PI) * 50; r = lerp(9, 3.5, k);
        if (k >= 1) {
          if (s.flight.good) { s.made++; s.msg = 'GOOD!'; } else { s.lives--; s.msg = 'Daneben'; }
          s.best = Math.max(s.best, s.made);
          s.state = s.lives <= 0 ? 'over' : 'result'; s.t0 = now; this.result = s.flight.good ? 'good' : 'miss';
        }
      } else if (s.state === 'result' && now - s.t0 > 1100) { s.state = 'ready'; newWind(); }
      if (s.state !== 'result' && s.state !== 'over') { g.fillStyle = '#7a4a22'; g.beginPath(); g.ellipse(bx, by, r * 0.72, r, 0, 0, 7); g.fill(); }
      g.textAlign = 'center';
      if (s.state === 'result' || s.state === 'over') {
        g.font = '600 40px system-ui, sans-serif'; g.fillStyle = s.msg === 'GOOD!' ? '#f2c230' : '#f2f5f9';
        g.fillText(s.state === 'over' ? 'Game over' : s.msg, cx, 236);
        if (s.state === 'over') { g.font = '16px system-ui, sans-serif'; g.fillText(s.made + ' Treffer · A drücken für eine neue Runde', cx, 270); }
      }
      g.font = MONO; g.fillStyle = '#f2f5f9';
      g.fillText('Wind ' + (s.wind === 0 ? '0' : (s.wind > 0 ? '→ ' : '← ') + Math.abs(s.wind)), cx, 348);
      bug(g, 'FIELD GOAL · ' + dist() + ' YDS', 'Treffer ' + s.made + ' · Versuche ' + '●'.repeat(Math.max(0, s.lives)) + ' · Rekord ' + s.best);
    },
  };
}

export const CHANNELS = [
  { no: 1, name: 'Football-Nacht', tag: 'American Football', line: 'Sonntagabend läuft bei mir oft American Football.', draw: football },
  { no: 2, name: 'Konferenz', tag: 'Bundesliga', line: 'Mitglied beim SC Freiburg und beim FC Bayern, ab und zu auch im Stadion.',
    note: 'Rechts läuft Kickbase mit, ein Bundesliga-Manager mit echten Spielern. Deshalb schaue ich mehr Bundesliga, als ich müsste.', draw: bundesliga },
  { no: 3, name: 'Schlussgang', tag: 'Schwingen', line: 'Schwingen schaue ich nicht nur, ich rechne es auch nach.', link: ['Projekt Schwingen ML ansehen', 'https://schwingen-ml.vercel.app/'], draw: schwingen },
  { no: 4, name: 'Riesenslalom', tag: 'Ski Alpin', line: 'Im Winter kommt Ski Alpin dazu.', draw: ski },
  { no: 5, name: 'Konsole', tag: 'Gaming', line: 'Zwischendurch wird gezockt, etwa GeoGuessr und bald GTA 6. Hier gibt es Field Goals, nach drei Fehlversuchen ist Schluss.', game: true },
];

export function createTV({ stage, onExit }) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  const kick = makeKick();
  let ch = 0, flick = 0, isOpen = false, raf = 0, actx = null;

  const el = document.createElement('div');
  el.className = 'tv';
  el.hidden = true;
  el.innerHTML = `
    <div class="tv-set">
      <div class="tv-screen"></div>
      <div class="tv-info" aria-live="polite"><p class="tv-ch"></p><p class="tv-line"></p><p class="tv-note" hidden></p><a class="tv-link" href="https://schwingen-ml.vercel.app/" target="_blank" rel="noopener" hidden></a></div>
    </div>
    <div class="tv-remote" role="group" aria-label="Fernbedienung">
      <button type="button" class="rm-power" data-rm="off" aria-label="Aus: Fernseher ausschalten und zurück ins Zimmer">Aus</button>
      <div class="rm-nums"></div>
      <div class="rm-ch"><button type="button" data-rm="up" aria-label="Programm weiter">▲</button><span>Programm</span><button type="button" data-rm="down" aria-label="Programm zurück">▼</button></div>
      <button type="button" class="rm-a" data-rm="a" aria-label="A: Ball kicken">A</button>
      <p class="rm-help">Tasten 1 bis 5, Pfeile, Leertaste</p>
    </div>`;
  stage.appendChild(el);
  const $ = (s) => el.querySelector(s);
  $('.tv-screen').appendChild(canvas);
  const nums = $('.rm-nums');
  CHANNELS.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(c.no);
    b.setAttribute('aria-label', 'Programm ' + c.no + ': ' + c.tag);
    b.addEventListener('click', () => setChannel(i));
    nums.appendChild(b);
  });

  function beep(freq, len, type) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx || !isOpen) return;
      actx = actx || new Ctx();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), a = actx.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      a.gain.setValueAtTime(0.04, actx.currentTime);
      a.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + len);
      o.connect(a); a.connect(actx.destination); o.start(); o.stop(actx.currentTime + len);
    } catch (e) { /* Ton ist optional */ }
  }

  function showInfo() {
    const c = CHANNELS[ch];
    $('.tv-ch').textContent = c.no + ' · ' + c.tag + ' · ' + c.name;
    $('.tv-line').textContent = c.line;
    const note = $('.tv-note');
    note.hidden = !c.note;
    note.textContent = c.note || '';
    const a = $('.tv-link');
    a.hidden = !c.link;
    if (c.link) { a.textContent = c.link[0] + ' ↗'; a.href = c.link[1]; }
    nums.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', i === ch ? 'true' : 'false'));
    el.dataset.game = c.game ? '1' : '';
  }

  function setChannel(i) {
    ch = (i + CHANNELS.length) % CHANNELS.length;
    flick = performance.now() + 220;
    beep(180, 0.06);
    showInfo();
    // Auf der Konsole liegt der Finger auf der A-Taste
    if (isOpen && CHANNELS[ch].game) $('.rm-a').focus({ preventScroll: true });
  }

  function press() {
    if (!CHANNELS[ch].game) { setChannel(4); return; }
    const r = kick.press(performance.now());
    if (r === 'kick') beep(110, 0.12, 'triangle');
  }

  function draw(now) {
    const t = now / 1000;
    if (now < flick) {                                      // kurzes Rauschen beim Umschalten
      const img = g.createImageData(W / 4, H / 4);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(canvas, 0, 0, W / 4, H / 4, 0, 0, W, H); g.imageSmoothingEnabled = true;
      return;
    }
    const c = CHANNELS[ch];
    if (c.game) {
      kick.draw(g, t, now);
      if (kick.result) { beep(kick.result === 'good' ? 880 : 140, 0.25, kick.result === 'good' ? 'sine' : 'sawtooth'); kick.result = null; }
    } else c.draw(g, t);
  }

  const loop = (now) => { if (!isOpen) return; raf = requestAnimationFrame(loop); draw(now); };

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm]');
    if (b) {
      const k = b.dataset.rm;
      if (k === 'off') onExit(); else if (k === 'up') setChannel(ch + 1); else if (k === 'down') setChannel(ch - 1); else press();
    } else if (e.target === canvas && CHANNELS[ch].game) press();
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { onExit(); return; }
    if (e.key >= '1' && e.key <= '5') { setChannel(Number(e.key) - 1); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { setChannel(ch + 1); e.preventDefault(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { setChannel(ch - 1); e.preventDefault(); }
    else if (e.key === ' ' && !e.target.closest('button')) { press(); e.preventDefault(); }
  });

  const clip = (r) => {
    if (!r) return 'inset(0 round 0)';
    const w = stage.clientWidth, h = stage.clientHeight;
    return `inset(${Math.max(0, r.top)}px ${Math.max(0, w - r.right)}px ${Math.max(0, h - r.bottom)}px ${Math.max(0, r.left)}px round 4px)`;
  };
  showInfo();
  draw(performance.now());

  return {
    canvas,
    draw,                                     // vom Zimmer aufgerufen, solange der Fernseher klein im Raum läuft
    get isOpen() { return isOpen; },
    open(rect, channel) {
      isOpen = true;
      el.hidden = false;
      el.style.transition = 'none'; el.style.clipPath = clip(rect); el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = ''; el.style.clipPath = clip(null); el.style.opacity = '1';
      if (channel !== undefined) setChannel(channel); else showInfo();
      raf = requestAnimationFrame(loop);
      setTimeout(() => { if (isOpen) $(CHANNELS[ch].game ? '.rm-a' : '.rm-ch button').focus({ preventScroll: true }); }, 350);
    },
    close(rect, done) {
      isOpen = false;
      cancelAnimationFrame(raf);
      el.style.clipPath = clip(rect); el.style.opacity = '0';
      setTimeout(() => { el.hidden = true; if (done) done(); }, 420);
    },
  };
}
