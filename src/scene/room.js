// Low-Poly-Arbeitszimmer, vollständig aus Primitiven gebaut.
// buildRoom(THREE, {shadows}) -> { root, clickables, interests, chair, tv, screen, window, photos, tick }

const C = {
  wall: 0xece0c8, wallShade: 0xdfd0b4, floor: 0xc4a888, floorDark: 0x9c8064,
  rug: 0x8a9c94, ceiling: 0xf8efe0,
  deskTop: 0xd9c4a4, deskLeg: 0x44484e, cabinet: 0x3d444c,
  crt: 0xd8cdb8, crtDark: 0xbfb29a, plastic: 0x3a3733, dark: 0x1a1d22,
  paper: 0xf6efe2, paperEdge: 0xdfd4bf, skin: 0xe0a983, hair: 0x3a2b22,
  shirt: 0x5d6f7a, jeans: 0x3f4a58, cup: 0xd9d3c6, metal: 0x9aa0a6,
  sky: 0xf7d9a6, hillFar: 0x8fa07c, hillNear: 0x6c7f5f, frame: 0x6b4b32,
  photo1: 0xc9a37a, photo2: 0x8ba3a8, photo3: 0xc98f7a, photo4: 0x9aa87f,
  green: 0x4e7a44,
};

function lam(color, extra) {
  return new THREE_REF.MeshLambertMaterial(Object.assign({ color, flatShading: true }, extra || {}));
}
let THREE_REF = null;

function box(w, h, d, mat, x, y, z) {
  const m = new THREE_REF.Mesh(new THREE_REF.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, seg, mat, x, y, z) {
  const m = new THREE_REF.Mesh(new THREE_REF.CylinderGeometry(rt, rb, h, seg, 1, false), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function plane(w, h, mat, x, y, z) {
  const m = new THREE_REF.Mesh(new THREE_REF.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  return m;
}

function roundedShape(w, h, r) {
  const s = new THREE_REF.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundedSolid(w, h, depth, r, mat) {
  const geo = new THREE_REF.ExtrudeGeometry(roundedShape(w, h, r), {
    depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 8,
  });
  const m = new THREE_REF.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function desktopTexture() {
  const c = document.createElement('canvas');
  // Dreifache Auflösung, damit der Bildschirm auch aus der Nähe scharf bleibt
  c.width = 960; c.height = 540;
  const g = c.getContext('2d');
  g.scale(3, 3);
  const bg = g.createRadialGradient(160, 74, 20, 160, 90, 210);
  bg.addColorStop(0, '#1b2130'); bg.addColorStop(1, '#101420');
  g.fillStyle = bg; g.fillRect(0, 0, 320, 180);
  // Menuleiste
  g.fillStyle = '#0d1119'; g.fillRect(0, 0, 320, 15);
  g.fillStyle = '#93a4bb'; g.font = '9px monospace';
  g.fillText('FABIAN LOCHER · BUSINESS ENGINEER', 8, 11);
  g.fillText('16:42', 288, 11);
  // vier Symbole
  const icons = [[40, 44], [120, 44], [40, 108], [120, 108]];
  icons.forEach(([x, y], i) => {
    g.fillStyle = i === 0 ? '#f2ede2' : '#d98a2b';
    g.fillRect(x, y, 30, 24);
    g.fillStyle = '#0f1420';
    g.fillRect(x, y + 24, 30, 3);
  });
  g.fillStyle = '#c7cfd9'; g.font = '8px monospace';
  g.fillText('über mich', 30, 82); g.fillText('projekte', 116, 82);
  g.fillText('skills', 44, 146); g.fillText('sprachen', 114, 146);
  // Fenster rechts
  g.fillStyle = '#f4ece0'; g.fillRect(178, 34, 128, 116);
  g.fillStyle = '#e8ddca'; g.fillRect(178, 34, 128, 14);
  g.fillStyle = '#b9a98e'; g.fillRect(183, 39, 5, 5); g.fillRect(191, 39, 5, 5);
  g.fillStyle = '#8a7a63';
  for (let i = 0; i < 7; i++) g.fillRect(186, 58 + i * 12, i % 3 === 2 ? 70 : 110, 4);
  g.fillStyle = '#d98a2b'; g.fillRect(186, 130, 40, 9);
  // Zeilenraster
  g.fillStyle = 'rgba(255,255,255,.03)';
  for (let y = 0; y < 180; y += 3) g.fillRect(0, y, 320, 1);
  const t = new THREE_REF.CanvasTexture(c);
  t.colorSpace = THREE_REF.SRGBColorSpace;
  return t;
}

function skyTexture() {
  // Blick auf Burgdorf am frühen Abend: Alpen, Emmentaler Hügel, Schloss auf dem Sandsteinfelsen, Altstadt, Emme.
  const c = document.createElement('canvas');
  c.width = 1280; c.height = 1056;
  const g = c.getContext('2d');
  g.scale(5, 5.388);
  const W = 256, H = 196;
  const poly = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
  const hill = (pts, fill) => {
    g.fillStyle = fill; g.beginPath(); g.moveTo(-10, H + 4); g.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; g.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2); }
    const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); g.lineTo(W + 10, H + 4); g.closePath(); g.fill();
  };

  // Himmel
  const sky = g.createLinearGradient(0, 0, 0, 120);
  sky.addColorStop(0, '#86aacb'); sky.addColorStop(0.45, '#c9cfd0'); sky.addColorStop(0.8, '#f3d9ae'); sky.addColorStop(1, '#f6c98a');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sun = g.createRadialGradient(40, 96, 2, 40, 96, 90);
  sun.addColorStop(0, 'rgba(255,236,190,.95)'); sun.addColorStop(0.25, 'rgba(255,220,160,.45)'); sun.addColorStop(1, 'rgba(255,220,160,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, 140);
  g.fillStyle = 'rgba(255,250,240,.55)';
  [[150, 30, 34, 5], [176, 36, 26, 4], [84, 22, 22, 3.5], [226, 54, 24, 3.5]].forEach(([x, y, rx, ry]) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); });

  // Berner Alpen im Dunst, rechts Eiger, Mönch und Jungfrau
  poly([[-10, 104], [10, 92], [26, 97], [44, 86], [60, 94], [82, 84], [100, 93], [124, 88], [146, 80], [158, 86], [172, 72], [186, 82], [198, 68], [212, 80], [226, 66], [244, 82], [266, 76], [266, 112], [-10, 112]], '#a9bccd');
  poly([[166, 78], [172, 72], [178, 79], [174, 80]], '#eef2f4'); poly([[192, 74], [198, 68], [205, 76], [199, 77]], '#eef2f4'); poly([[219, 73], [226, 66], [234, 75], [227, 76]], '#eef2f4');
  g.fillStyle = 'rgba(246,214,170,.35)'; g.fillRect(0, 84, W, 30);

  // Hügelzüge des Emmentals, von hinten nach vorne dunkler
  hill([[-10, 110], [40, 98], [96, 108], [150, 100], [210, 108], [266, 102]], '#93a98c');
  hill([[-10, 122], [30, 112], [84, 120], [140, 114], [200, 122], [266, 116]], '#7c9675');
  [[18, 113], [26, 112], [34, 113], [150, 114], [158, 113], [228, 118], [236, 117]].forEach(([x, y]) => poly([[x - 3, y + 3], [x, y - 5], [x + 3, y + 3]], '#5f7a5a'));

  // Schlossfelsen aus Sandstein mit bewaldetem Fuss
  hill([[60, 150], [100, 132], [124, 106], [150, 100], [196, 102], [214, 120], [236, 142], [266, 150]], '#6c8a63');
  poly([[118, 126], [124, 104], [152, 99], [198, 101], [208, 124], [196, 130], [150, 132]], '#d2b98d');
  poly([[118, 126], [124, 104], [136, 102], [132, 128]], '#bfa477');
  g.strokeStyle = 'rgba(150,120,80,.35)'; g.lineWidth = 0.6;
  [[140, 108, 138, 128], [160, 106, 162, 130], [182, 106, 186, 128]].forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });

  // Schloss Burgdorf: Ringmauer, Bergfried, Palas, Torturm
  const stone = '#e9dfca', shade = '#cfc2a6', roof = '#8a4636', roofDark = '#6f3729', glass = '#5a5142';
  g.fillStyle = shade; g.fillRect(126, 96, 72, 7);
  for (let x = 126; x < 198; x += 6) { g.fillStyle = stone; g.fillRect(x, 94, 3.5, 3); }
  // Palas (Langbau)
  g.fillStyle = stone; g.fillRect(150, 78, 36, 22); g.fillStyle = shade; g.fillRect(150, 78, 5, 22);
  poly([[147, 78], [156, 66], [180, 66], [189, 78]], roof); poly([[147, 78], [156, 66], [160, 66], [153, 78]], roofDark);
  // Bergfried
  g.fillStyle = stone; g.fillRect(130, 62, 17, 40); g.fillStyle = shade; g.fillRect(130, 62, 5, 40);
  poly([[127, 62], [138.5, 44], [150, 62]], roof); poly([[127, 62], [138.5, 44], [136, 62]], roofDark);
  g.fillStyle = roofDark; g.fillRect(138, 40, 1, 5);
  // Torturm rechts
  g.fillStyle = stone; g.fillRect(186, 74, 12, 28); g.fillStyle = shade; g.fillRect(186, 74, 3.5, 28);
  poly([[184, 74], [192, 62], [200, 74]], roof);
  g.fillStyle = glass;
  [[137, 68], [137, 78], [137, 88], [159, 84], [166, 84], [173, 84], [180, 84], [191, 80], [191, 90]].forEach(([x, y]) => g.fillRect(x, y, 2.4, 5));
  [[160, 84], [174, 84]].forEach(([x, y]) => { g.fillStyle = '#f7d89a'; g.fillRect(x - 1, y, 2.4, 5); });   // zwei Fenster mit Licht

  // Altstadt am Hang und Stadtkirche links
  hill([[-10, 150], [30, 138], [80, 146], [130, 140], [190, 148], [266, 142]], '#5f7d58');
  g.fillStyle = '#ebe2cf'; g.fillRect(48, 118, 8, 24); poly([[46, 118], [52, 100], [58, 118]], '#59685a');
  g.fillStyle = '#e4dac5'; g.fillRect(56, 130, 22, 12); poly([[54, 130], [67, 123], [80, 130]], roof);
  [[14, 144, 14, 10], [30, 141, 12, 11], [84, 146, 15, 10], [101, 143, 12, 11], [116, 147, 16, 10], [136, 144, 13, 11], [152, 148, 15, 10], [170, 145, 12, 11], [186, 149, 16, 10], [206, 146, 13, 11], [224, 149, 15, 10], [242, 146, 12, 11]].forEach(([x, y, w, h], i) => {
    g.fillStyle = i % 2 ? '#e6dcc8' : '#d9cdb5'; g.fillRect(x, y - h, w, h);
    poly([[x - 1.5, y - h], [x + w / 2, y - h - 5.5], [x + w + 1.5, y - h]], i % 3 ? roof : roofDark);
    g.fillStyle = 'rgba(80,72,58,.65)'; g.fillRect(x + 2.5, y - h + 3.5, 2, 3.5); g.fillRect(x + w - 5, y - h + 3.5, 2, 3.5);
  });

  // Emme mit Uferbäumen, davor Wiese
  hill([[-10, 162], [60, 154], [130, 160], [200, 154], [266, 160]], '#4f6b4a');
  g.strokeStyle = '#a9c4cf'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-10, 172); g.bezierCurveTo(50, 160, 110, 178, 170, 168); g.bezierCurveTo(210, 162, 240, 170, 266, 166); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, 171); g.bezierCurveTo(50, 159, 110, 177, 170, 167); g.stroke();
  [[20, 164, 7], [44, 160, 9], [92, 166, 8], [142, 164, 10], [196, 160, 8], [232, 162, 9]].forEach(([x, y, r]) => { g.fillStyle = '#3f5a3c'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#496846'; g.beginPath(); g.arc(x - 2, y - 2, r * 0.6, 0, Math.PI * 2); g.fill(); });
  hill([[-10, 184], [70, 176], [150, 184], [266, 178]], '#44603f');

  // Abendlicht von links
  const warm = g.createLinearGradient(0, 0, W, 0);
  warm.addColorStop(0, 'rgba(255,214,150,.22)'); warm.addColorStop(1, 'rgba(60,80,100,.12)');
  g.fillStyle = warm; g.fillRect(0, 0, W, H);

  const t = new THREE_REF.CanvasTexture(c);
  t.colorSpace = THREE_REF.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function buildRoom(THREE, opts) {
  THREE_REF = THREE;
  const shadows = !opts || opts.shadows !== false;
  const root = new THREE.Group();
  const clickables = [];
  const interests = [];

  const M = {
    wall: lam(C.wall), wallShade: lam(C.wallShade), floor: lam(C.floor),
    rug: lam(C.rug), ceiling: lam(C.ceiling), deskTop: lam(C.deskTop),
    deskLeg: lam(C.deskLeg), cabinet: lam(C.cabinet), crt: lam(C.crt),
    crtDark: lam(C.crtDark), plastic: lam(C.plastic), dark: lam(C.dark),
    paper: lam(C.paper), paperEdge: lam(C.paperEdge), skin: lam(C.skin),
    hair: lam(C.hair), shirt: lam(C.shirt), jeans: lam(C.jeans), cup: lam(C.cup),
    metal: lam(C.metal), frame: lam(C.frame),
    hillFar: lam(C.hillFar), hillNear: lam(C.hillNear),
  };

  // ---------- Hülle ----------
  const floor = plane(5.2, 4.2, M.floor, 0, 0, -0.3);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  const rug = plane(2.5, 1.8, M.rug, 0.05, 0.002, -0.55);
  rug.rotation.x = -Math.PI / 2; rug.receiveShadow = true;
  root.add(rug);

  const back = plane(5.2, 2.55, M.wall, 0, 1.275, -2.4);
  back.receiveShadow = true; root.add(back);
  const left = plane(4.2, 2.55, M.wallShade, -2.6, 1.275, -0.3);
  left.rotation.y = Math.PI / 2; left.receiveShadow = true; root.add(left);
  const right = plane(4.2, 2.55, M.wallShade, 2.6, 1.275, -0.3);
  right.rotation.y = -Math.PI / 2; right.receiveShadow = true; root.add(right);
  const ceil = plane(5.2, 4.2, M.ceiling, 0, 2.55, -0.3);
  ceil.rotation.x = Math.PI / 2; root.add(ceil);
  // Sockelleiste
  root.add(box(5.2, 0.1, 0.03, M.paperEdge, 0, 0.05, -2.38));

  // ---------- Fenster links (Hauptlicht) ----------
  // Sprossenfenster. Glas bei lokal z>0, damit die Wand (x=-3) es nicht verdeckt.
  const win = new THREE.Group();
  win.position.set(-2.57, 1.45, -0.75);
  win.rotation.y = Math.PI / 2;
  const white = lam(0xf2ece2);
  const shadowFr = lam(0xdcd2c0);
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture() });
  const winView = plane(1.72, 1.42, skyMat, 0, 0, 0.004);
  win.add(winView);
  win.add(box(2.0, 0.14, 0.16, shadowFr, 0, 0.78, -0.06));
  win.add(box(2.0, 0.14, 0.16, shadowFr, 0, -0.78, -0.06));
  win.add(box(0.14, 1.7, 0.16, shadowFr, -0.93, 0, -0.06));
  win.add(box(0.14, 1.7, 0.16, shadowFr, 0.93, 0, -0.06));
  win.add(box(1.98, 0.1, 0.1, white, 0, 0.76, 0.03));
  win.add(box(1.98, 0.1, 0.1, white, 0, -0.76, 0.03));
  win.add(box(0.1, 1.62, 0.1, white, -0.94, 0, 0.03));
  win.add(box(0.1, 1.62, 0.1, white, 0.94, 0, 0.03));
  win.add(box(0.07, 1.52, 0.08, white, 0, 0, 0.038));
  win.add(box(1.86, 0.05, 0.07, white, 0, 0.44, 0.036));
  win.add(box(1.86, 0.05, 0.07, white, 0, -0.36, 0.036));
  win.add(box(2.08, 0.07, 0.3, white, 0, -0.83, 0.11));
  win.add(box(2.02, 0.03, 0.05, shadowFr, 0, -0.79, 0.25));
  win.add(box(0.035, 0.16, 0.035, lam(0xb8bcc0), 0.07, -0.12, 0.075));
  const winHit = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.6, 0.12), new THREE.MeshBasicMaterial({ visible: false }));
  winHit.position.set(0, 0, 0.02);
  win.add(winHit);
  win.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  root.add(win);
  clickables.push({ id: 'burgdorf', label: 'Fenster', hint: 'Aussicht', group: win, anchor: new THREE.Vector3(-0.45, 0.5, 0.2), main: true });

  // ---------- Schreibtisch ----------
  const desk = new THREE.Group();
  desk.position.set(0, 0, -1.78);
  desk.add(box(2.1, 0.05, 0.78, M.deskTop, 0, 0.74, 0));
  [[-1.0, -0.33], [-1.0, 0.33], [1.0, -0.33], [1.0, 0.33]].forEach(([x, z]) => {
    desk.add(box(0.06, 0.72, 0.06, M.deskLeg, x, 0.36, z));
  });
  desk.add(box(0.5, 0.5, 0.62, M.cabinet, 0.72, 0.4, 0));
  desk.add(box(0.3, 0.014, 0.018, M.metal, 0.72, 0.5, 0.312));
  desk.add(box(0.3, 0.014, 0.018, M.metal, 0.72, 0.32, 0.312));
  root.add(desk);

  // ---------- Bürostuhl (klickbar, dreht sich) ----------
  const chair = new THREE.Group();
  chair.position.set(-0.34, 0, -1.02);
  // Fusskreuz und Säule stehen fest
  chair.add(cyl(0.042, 0.048, 0.34, 12, M.metal, 0, 0.19, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const leg = box(0.3, 0.028, 0.05, M.plastic, Math.sin(a) * 0.15, 0.045, Math.cos(a) * 0.15);
    leg.rotation.y = a;
    chair.add(leg);
    const cast = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), lam(0x1f2226));
    cast.position.set(Math.sin(a) * 0.29, 0.028, Math.cos(a) * 0.29);
    cast.scale.set(1, 0.9, 0.6);
    cast.castShadow = true;
    chair.add(cast);
  }
  // Alles ab der Sitzfläche dreht
  const seat = new THREE.Group();
  seat.position.set(0, 0, 0);
  seat.add(cyl(0.075, 0.075, 0.05, 14, M.plastic, 0, 0.375, 0));
  const cushion = roundedSolid(0.44, 0.42, 0.07, 0.09, M.plastic);
  cushion.rotation.x = -Math.PI / 2;
  cushion.position.set(0, 0.4, 0);
  seat.add(cushion);
  const backrest = roundedSolid(0.42, 0.5, 0.06, 0.1, M.plastic);
  backrest.position.set(0, 0.72, 0.2);
  backrest.rotation.x = -0.14;
  seat.add(backrest);
  seat.add(box(0.05, 0.24, 0.05, M.plastic, 0, 0.6, 0.21));
  [-1, 1].forEach((sd) => {
    seat.add(box(0.04, 0.16, 0.04, M.plastic, sd * 0.23, 0.52, 0.05));
    const rest = roundedSolid(0.07, 0.24, 0.035, 0.03, lam(0x2a2d33));
    rest.rotation.x = -Math.PI / 2;
    rest.position.set(sd * 0.23, 0.6, 0.0);
    seat.add(rest);
  });
  chair.add(seat);
  const chairHit = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1.0, 0.56), new THREE.MeshBasicMaterial({ visible: false }));
  chairHit.position.set(0, 0.5, 0.05);
  chair.add(chairHit);
  chair.traverse((o) => { if (o.isMesh && o !== chairHit) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(chair);
  clickables.push({ id: 'chair', label: 'Bürostuhl', hint: 'Anstossen', group: chair, anchor: new THREE.Vector3(0, 0.9, 0) });

  // Hüpfer: läuft über eine eigene Uhr, unabhängig von dt
  let hopT = -1, hopDur = 0;
  const chairApi = { spin: () => { hopT = 0; hopDur = 1.9; } };

  // ---------- Flachbildschirm (klickbar) ----------
  // Dünnes Panel mit schmaler Blende, Screen 16:9 bei z=0.021.
  const monitor = new THREE.Group();
  monitor.position.set(-0.42, 0.765, -1.98);
  const panelMat = lam(0x2a2d33);
  const panelBack = lam(0x33373e);
  const standMat = lam(0x3c4149);

  // Standfuss: flache Platte mit Nut
  const base = roundedSolid(0.34, 0.2, 0.016, 0.05, standMat);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, 0.008, -0.1);
  monitor.add(base);
  // Säule, leicht nach hinten geneigt
  const post = roundedSolid(0.075, 0.28, 0.03, 0.028, standMat);
  post.position.set(0, 0.17, -0.075);
  post.rotation.x = 0.05;
  monitor.add(post);
  // Gelenk hinter dem Panel
  monitor.add(box(0.1, 0.075, 0.045, standMat, 0, 0.305, -0.05));

  // Panel: Rücken leicht dicker, Front dünn
  const backShell = roundedSolid(0.62, 0.365, 0.026, 0.016, panelBack);
  backShell.position.set(0, 0.375, -0.024);
  monitor.add(backShell);
  const front = roundedSolid(0.63, 0.375, 0.012, 0.014, panelMat);
  front.position.set(0, 0.375, 0.008);
  monitor.add(front);
  // Aktive Fläche, schmale Blende ringsum
  const recess = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedShape(0.6, 0.3375, 0.006), { depth: 0.004, bevelEnabled: false, curveSegments: 8 }),
    lam(0x101318)
  );
  recess.position.set(0, 0.3805, 0.0165);
  monitor.add(recess);
  // Kinnleiste mit Logo und LED
  monitor.add(box(0.05, 0.005, 0.003, lam(0x6a7079), 0, 0.2055, 0.033));
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf0a03a }));
  led.position.set(0.27, 0.2055, 0.033);
  monitor.add(led);

  // Bildschirm (unbeleuchtet)
  const screenMat = new THREE.MeshBasicMaterial({ map: desktopTexture() });
  // Die Front reicht mit Fase bis z=0.032, der Bildschirm liegt knapp davor
  const screen = plane(0.592, 0.333, screenMat, 0, 0.3805, 0.0335);
  monitor.add(screen);
  // Schwacher Lichtsaum vor dem Panel
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x8fb8d8, transparent: true, opacity: 0.1 });
  monitor.add(plane(0.66, 0.4, glowMat, 0, 0.3805, 0.0352));
  monitor.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  root.add(monitor);
  clickables.push({ id: 'monitor', label: 'Monitor', hint: 'Skills, Projekte, Sprachen', group: monitor, anchor: new THREE.Vector3(0, 0.6, 0.05), main: true });

  // Tastatur + Maus
  const kb = new THREE.Group();
  kb.position.set(-0.34, 0.765, -1.52);
  kb.add(box(0.44, 0.018, 0.15, M.crtDark, 0, 0.009, 0));
  const keyGeo = new THREE.BoxGeometry(0.022, 0.008, 0.022);
  const keys = new THREE.InstancedMesh(keyGeo, M.crt, 4 * 14);
  let ki = 0;
  const mtx = new THREE.Matrix4();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) {
    mtx.makeTranslation(-0.2 + c * 0.0295 + r * 0.004, 0.022, -0.05 + r * 0.029);
    keys.setMatrixAt(ki++, mtx);
  }
  keys.castShadow = true; kb.add(keys);
  root.add(kb);
  const mouseG = new THREE.Group();
  mouseG.position.set(0.02, 0.7655, -1.5);
  mouseG.rotation.y = 0.07;
  mouseG.scale.set(1, 0.6, 1);
  const mBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.044, 6, 18), M.crt);
  mBody.rotation.x = Math.PI / 2;
  mBody.position.set(0, 0.028, 0);
  mBody.castShadow = true; mouseG.add(mBody);
  const mSeam = box(0.0025, 0.05, 0.05, M.crtDark, 0, 0.05, -0.016);
  mSeam.castShadow = false; mouseG.add(mSeam);
  const wheel = cyl(0.0085, 0.0085, 0.006, 12, M.plastic, 0, 0.062, -0.028);
  wheel.rotation.z = Math.PI / 2; mouseG.add(wheel);
  root.add(mouseG);

  // ---------- Mate-Dose (klickbar) ----------
  // Schlanke 33-cl-Dose mit eigener, neutraler Etikette. Marken-Logos werden bewusst nicht nachgebaut.
  const mate = new THREE.Group();
  mate.position.set(0.3, 0.7655, -1.72);
  const canLabel = (() => {
    const c = document.createElement('canvas');
    c.width = 768; c.height = 384;
    const g = c.getContext('2d');
    g.fillStyle = '#efe6d0'; g.fillRect(0, 0, 768, 384);
    g.fillStyle = '#2f6b4a'; g.fillRect(0, 96, 768, 190);
    g.fillStyle = '#d98a2b'; g.fillRect(0, 286, 768, 14);
    for (let i = 0; i < 3; i++) {
      const x = i * 256 + 128;
      g.fillStyle = '#efe6d0'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 92px system-ui, sans-serif'; g.fillText('MATE', x, 186);
      g.font = '600 24px system-ui, sans-serif'; g.fillText('33 CL', x, 250);
      // Mateblatt
      g.fillStyle = '#2f6b4a'; g.beginPath(); g.ellipse(x, 52, 34, 15, -0.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#efe6d0'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 26, 64); g.lineTo(x + 26, 38); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  })();
  const alu = lam(0xc9ccd0, { flatShading: false });
  const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.0285, 0.0285, 0.118, 32, 1, true), new THREE.MeshLambertMaterial({ map: canLabel }));
  canBody.position.y = 0.071; mate.add(canBody);
  mate.add(cyl(0.0285, 0.024, 0.012, 32, alu, 0, 0.006, 0));          // Boden
  mate.add(cyl(0.0235, 0.0285, 0.014, 32, alu, 0, 0.137, 0));         // Schulter
  mate.add(cyl(0.0245, 0.0245, 0.004, 32, alu, 0, 0.146, 0));         // Deckelrand
  mate.add(cyl(0.0215, 0.0215, 0.002, 32, lam(0xb4b8bd, { flatShading: false }), 0, 0.1455, 0));
  mate.add(box(0.012, 0.0015, 0.02, lam(0x9a9fa6), 0, 0.1485, 0.004)); // Lasche
  const mateHit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.12), new THREE.MeshBasicMaterial({ visible: false }));
  mateHit.position.set(0, 0.08, 0);
  mate.add(mateHit);
  mate.traverse((o) => { if (o.isMesh && o !== mateHit) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(mate);
  clickables.push({ id: 'mate', label: 'Mate', hint: 'Lieblingsgetränk', group: mate, anchor: new THREE.Vector3(0, 0.2, 0) });

  // ---------- Schachbrett auf dem Schreibtisch (klickbar) ----------
  const chess = new THREE.Group();
  chess.position.set(0.68, 0.7655, -1.66);
  chess.rotation.y = -0.35;
  const boardTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
      g.fillStyle = (f + r) % 2 ? '#7a5a3c' : '#eadcc2';
      g.fillRect(f * 32, r * 32, 32, 32);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  chess.add(box(0.226, 0.012, 0.226, lam(0x4a3322), 0, 0.006, 0));
  const boardTop = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshLambertMaterial({ map: boardTex }));
  boardTop.rotation.x = -Math.PI / 2;
  boardTop.position.y = 0.0122;
  chess.add(boardTop);
  // Feld (Linie a bis h = 0 bis 7, Reihe 1 bis 8 = 0 bis 7) in Brettkoordinaten
  const sq = (f, r) => [-0.0875 + f * 0.025, 0.0875 - r * 0.025];
  const pieceWhite = lam(0xf1ece2), pieceBlack = lam(0x24211f);
  const piece = (mat, f, r, h) => {
    const p = new THREE.Group();
    p.add(cyl(0.0085, 0.0105, 0.004, 14, mat, 0, 0.002, 0));
    p.add(cyl(0.0045, 0.0075, h, 14, mat, 0, 0.004 + h / 2, 0));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.0062, 12, 8), mat);
    head.position.y = 0.006 + h;
    head.castShadow = true;
    p.add(head);
    const [x, z] = sq(f, r);
    p.position.set(x, 0.0122, z);
    chess.add(p);
    return p;
  };
  piece(pieceWhite, 4, 0, 0.03); piece(pieceBlack, 4, 7, 0.03);            // Könige
  piece(pieceWhite, 3, 0, 0.026); piece(pieceBlack, 3, 7, 0.026);          // Damen
  [4, 3].forEach((f) => { piece(pieceWhite, f, 3, 0.012); piece(pieceBlack, f, 4, 0.012); });
  const knight = piece(pieceWhite, 6, 0, 0.018);                           // Springer auf g1
  const chessHit = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.26), new THREE.MeshBasicMaterial({ visible: false }));
  chessHit.position.y = 0.04;
  chess.add(chessHit);
  chess.traverse((o) => { if (o.isMesh && o !== chessHit) o.receiveShadow = true; });
  root.add(chess);
  clickables.push({ id: 'chess', label: 'Schachbrett', hint: 'Eine Partie', group: chess, anchor: new THREE.Vector3(0, 0.07, 0) });
  // Ein Klick zieht den Springer: Sg1-f3, beim nächsten Klick zurück
  let knightT = -1, knightFrom = sq(6, 0), knightTo = sq(5, 2);
  const chessApi = {
    move() {
      if (knightT >= 0) return;
      knightT = 0;
    },
  };

  // ---------- Zimmerpflanze, rechte Ecke ----------
  // Monstera: Topf aus Zylindern, Blaetter als extrudierte, gewoelbte Fiederform.
  const plant = new THREE.Group();
  plant.position.set(2.02, 0, -1.92);

  const potOuter = lam(0xbe7148);
  const potRim = lam(0xcd8154);
  plant.add(cyl(0.2, 0.2, 0.014, 24, lam(0x8d6a52), 0, 0.007, 0));
  plant.add(cyl(0.175, 0.128, 0.34, 24, potOuter, 0, 0.19, 0));
  plant.add(cyl(0.185, 0.178, 0.045, 24, potRim, 0, 0.345, 0));
  plant.add(cyl(0.166, 0.166, 0.01, 24, lam(0x3b3026), 0, 0.363, 0));
  // Erde mit ein paar Klumpen
  for (let i = 0; i < 9; i++) {
    const ang = i * 2.39, r = 0.03 + (i % 4) * 0.032;
    const cl = new THREE.Mesh(new THREE.SphereGeometry(0.016 + (i % 3) * 0.006, 6, 5), lam(0x4a3b2d));
    cl.position.set(Math.cos(ang) * r, 0.368, Math.sin(ang) * r);
    cl.scale.y = 0.5;
    plant.add(cl);
  }

  // Blattform: Mittelrippe mit gefiederten Lappen
  function monsteraShape(len, wid, lobes) {
    const sh = new THREE.Shape();
    const half = (t) => {
      const base = Math.sin(Math.pow(t, 0.62) * Math.PI) * wid;
      const notch = 0.62 + 0.38 * Math.abs(Math.cos(t * lobes * Math.PI));
      return base * notch * (1 - t * 0.12);
    };
    sh.moveTo(0, 0);
    for (let i = 1; i <= 40; i++) { const t = i / 40; sh.lineTo(half(t), t * len); }
    for (let i = 39; i >= 1; i--) { const t = i / 40; sh.lineTo(-half(t), t * len); }
    sh.lineTo(0, 0);
    return sh;
  }
  const leafTop = lam(0x3f7a3e);
  const leafYoung = lam(0x5b9a45);
  function makeLeaf(len, wid, lobes, mat) {
    const geo = new THREE.ExtrudeGeometry(monsteraShape(len, wid, lobes), {
      depth: 0.004, bevelEnabled: false, curveSegments: 6,
    });
    // Woelbung: laengs nach unten, quer nach oben (Rinne)
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, p.getZ(i) - Math.pow(y / len, 2) * len * 0.3 + Math.pow(x / wid, 2) * wid * 0.22);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  const stalkMat = lam(0x4f7f3c);
  // dir, Neigung, Stiellaenge, Blattlaenge, Blattbreite, Lappen, jung
  const fronds = [
    [0.0, 0.40, 0.46, 0.34, 0.13, 3, false],
    [1.15, 0.72, 0.40, 0.30, 0.12, 3, false],
    [2.3, 0.60, 0.50, 0.32, 0.125, 3, false],
    [3.5, 0.85, 0.34, 0.26, 0.105, 2, true],
    [4.4, 0.52, 0.44, 0.30, 0.12, 3, false],
    [5.5, 0.78, 0.37, 0.27, 0.11, 2, true],
    [0.6, 0.18, 0.56, 0.3, 0.115, 3, false],
  ];
  fronds.forEach(([dir, lean, sl, ll, lw, lobes, young], i) => {
    const bx2 = Math.cos(dir) * 0.05, bz = Math.sin(dir) * 0.05;
    const tipX = bx2 + Math.cos(dir) * Math.sin(lean) * sl;
    const tipZ = bz + Math.sin(dir) * Math.sin(lean) * sl;
    const tipY = 0.37 + Math.cos(lean) * sl;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bx2, 0.37, bz),
      new THREE.Vector3(bx2 + (tipX - bx2) * 0.25, 0.37 + (tipY - 0.37) * 0.55, bz + (tipZ - bz) * 0.25),
      new THREE.Vector3(bx2 + (tipX - bx2) * 0.7, tipY - 0.01, bz + (tipZ - bz) * 0.7),
      new THREE.Vector3(tipX, tipY, tipZ),
    ]);
    const stalk = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.009, 7, false), stalkMat);
    stalk.castShadow = true;
    plant.add(stalk);

    const leaf = makeLeaf(ll, lw, lobes, young ? leafYoung : leafTop);
    leaf.position.set(tipX, tipY, tipZ);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = -dir + Math.PI / 2;
    leaf.rotation.x = -Math.PI / 2 + (0.55 + lean * 0.35);
    leaf.rotation.z = (i % 2 ? 0.18 : -0.2);
    plant.add(leaf);
  });
  plant.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(plant);

  // ---------- Fotowand: ruhiges Raster, alle Bilder gerade, ein Rahmenton ----------
  const photos = new THREE.Group();
  photos.position.set(-0.42, 1.82, -2.37);
  const texLoader = new THREE.TextureLoader();
  const photoTex = (file) => {
    const t = texLoader.load(file);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  // Zwei Reihen gleicher Höhe. Hochformat 3:4, Neapel als einziges Querformat 3:2.
  const PH = 0.36, GAP = 0.07;
  const rows = [
    [['kyoto', 0.75], ['sequoia', 0.75], ['sf', 0.75], ['stadion', 0.75], ['yosemite', 0.75], ['singapur', 0.75]],
    [['rom', 0.75], ['nara', 0.75], ['neapel', 1.5], ['leuchtturm', 0.75], ['roadtrip', 0.75]],
  ];
  const frameMat = lam(0x2b2622), matMat = lam(0xf6f1e6);
  const photoList = [];
  rows.forEach((row, r) => {
    const total = row.reduce((sum, [, ar]) => sum + PH * ar, 0) + GAP * (row.length - 1);
    let x = -total / 2;
    const y = (r === 0 ? 1 : -1) * (PH + GAP) / 2;
    row.forEach(([name, ar]) => {
      const w = PH * ar;
      const g = new THREE.Group();
      g.position.set(x + w / 2, y, 0);
      g.add(box(w + 0.02, PH + 0.02, 0.018, frameMat, 0, 0, 0));
      g.add(plane(w + 0.008, PH + 0.008, matMat, 0, 0, 0.0095));
      // Zuerst nur kleine Vorschauen; die volle Auflösung lädt erst, wenn jemand die Fotowand öffnet
      const mat = new THREE.MeshBasicMaterial({ map: photoTex('photos/thumb/' + name + '.jpg') });
      g.add(plane(w - 0.02, PH - 0.02, mat, 0, 0, 0.0105));
      photos.add(g);
      photoList.push({ id: name, group: g, mat });
      x += w + GAP;
    });
  });
  const photosHit = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 0.05), new THREE.MeshBasicMaterial({ visible: false }));
  photosHit.position.set(0, 0, 0.0);
  photos.add(photosHit);
  photos.traverse((o) => { if (o.isMesh && o !== photosHit) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(photos);
  clickables.push({ id: 'photos', label: 'Fotowand', hint: 'Bilder von unterwegs', group: photos, anchor: new THREE.Vector3(0.2, 0.5, 0.1), main: true });

  // ---------- Fernseher auf Lowboard ----------
  const tv = new THREE.Group();
  tv.position.set(-1.98, 0, -1.32);
  tv.rotation.y = 0.95;
  tv.add(box(0.9, 0.34, 0.36, M.cabinet, 0, 0.17, 0));
  tv.add(box(0.06, 0.16, 0.2, M.plastic, 0, 0.42, 0));
  tv.add(box(0.34, 0.02, 0.14, M.plastic, 0, 0.35, 0));
  tv.add(box(0.88, 0.52, 0.05, M.plastic, 0, 0.76, 0));
  // Das Bild liefert tv.js als Live-Leinwand, bis dahin bleibt der Schirm dunkel
  const pitchMat = new THREE.MeshBasicMaterial({ color: 0x0b0d10 });
  const pitch = plane(0.82, 0.46, pitchMat, 0, 0.76, 0.027);
  tv.add(pitch);

  // Controller auf dem Lowboard
  const ctrl = new THREE.Group();
  ctrl.position.set(0.24, 0.35, 0.06);
  ctrl.rotation.set(0, -0.4, 0);
  const ctrlMat = lam(0x2c3038);
  ctrl.add(box(0.13, 0.028, 0.07, ctrlMat, 0, 0, 0));
  [-1, 1].forEach((sd) => {
    const grip = box(0.045, 0.026, 0.075, ctrlMat, sd * 0.055, -0.006, 0.045);
    grip.rotation.y = sd * 0.28;
    ctrl.add(grip);
  });
  ctrl.add(cyl(0.012, 0.012, 0.012, 10, lam(0x565c66), -0.032, 0.017, -0.004));
  ctrl.add(cyl(0.012, 0.012, 0.012, 10, lam(0x565c66), 0.014, 0.017, 0.022));
  [[0.036, -0.012], [0.05, 0.002], [0.036, 0.016], [0.022, 0.002]].forEach(([x, z]) => {
    ctrl.add(cyl(0.006, 0.006, 0.008, 8, lam(0xb14b3c), x, 0.016, z));
  });
  const ctrlHit = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.2), new THREE.MeshBasicMaterial({ visible: false }));
  ctrlHit.position.set(0, 0.02, 0.02);
  ctrl.add(ctrlHit);
  ctrl.traverse((o) => { if (o.isMesh && o !== ctrlHit) o.castShadow = true; });
  tv.add(ctrl);

  tv.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  root.add(tv);
  clickables.push({ id: 'tv', label: 'Fernseher', hint: 'Programm wechseln', group: tv, anchor: new THREE.Vector3(0, 1.15, 0) });
  clickables.push({ id: 'game', label: 'Controller', hint: 'Gamen', group: ctrl, anchor: new THREE.Vector3(0, 0.12, 0) });

  const tvApi = { screenMat: pitchMat, mesh: pitch, width: 0.82, height: 0.46 };

  // ---------- Bewegung ----------
  const seatY = seat.position.y;
  function tick(t, dt) {
    // Stuhl hüpft und dreht nach dem Anstossen
    if (hopT >= 0) {
      hopT += dt;
      const k = Math.min(1, hopT / hopDur);
      // Volle Drehung mit Auslauf, dazu ein kurzer Hüpfer
      const ease = 1 - Math.pow(1 - k, 3);
      seat.position.y = seatY + Math.abs(Math.sin(k * Math.PI * 3)) * 0.05 * (1 - k);
      seat.rotation.y = ease * Math.PI * 4;
      if (k >= 1) { hopT = -1; seat.position.y = seatY; seat.rotation.y = 0; }
    }
    // Springerzug in einem kleinen Bogen
    if (knightT >= 0) {
      knightT += dt;
      const k = Math.min(1, knightT / 0.55);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      knight.position.x = knightFrom[0] + (knightTo[0] - knightFrom[0]) * e;
      knight.position.z = knightFrom[1] + (knightTo[1] - knightFrom[1]) * e;
      knight.position.y = 0.0122 + Math.sin(k * Math.PI) * 0.035;
      if (k >= 1) { knightT = -1; const tmp = knightFrom; knightFrom = knightTo; knightTo = tmp; }
    }
  }

  return {
    chess: chessApi,
    root, clickables, interests, chair: chairApi, tv: tvApi,
    screen: { mesh: screen, width: 0.592, height: 0.333 },
    window: { mesh: winView, width: 1.72, height: 1.42 },
    photos: photoList,
    loadFullPhotos() {
      if (this.fullPhotos) return;
      this.fullPhotos = true;
      photoList.forEach((p) => texLoader.load('photos/' + p.id + '.jpg', (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        if (p.mat.map) p.mat.map.dispose();
        p.mat.map = t;
        p.mat.needsUpdate = true;
      }));
    },
    tick,
  };
}
