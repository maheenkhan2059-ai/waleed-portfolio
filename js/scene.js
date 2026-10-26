/* ==========================================================================
   WALEED MALIK — scene.js  (Three.js r158, one renderer)
   1. BACKGROUND  full-screen aurora shader + floating pages, paper planes,
                  pencils, brush strokes, ink drops, bokeh & gold dust, ink
                  blooms between sections. Post: soft bloom, grain, vignette.
                  The camera travels through it as you scroll.
   2. THE BOOK    a real hardcover: rounded boards, clearcoat-laminated cover
                  with foil title (MeshPhysicalMaterial + env map), rounded
                  spine, page block with paper edges, headbands. Idles with a
                  float/turn, faces the viewer, opens on its hinge and turns
                  pages with a page-curl shader. Two instances: hero + about.
   Driven by main.js's single ticker. No allocations inside the frame loop.
   ========================================================================== */
(function () {
  'use strict';
  var T = window.THREE;

  /* ---------------- helpers ---------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function ease(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOut(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function texOf(id) { var t = window.WM_TEX && window.WM_TEX[id]; return t ? t.src : null; }
  function loadImage(src) {
    return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(function () { res(im); }, function () { res(im); }); }; im.onerror = rej; im.src = src; });
  }
  function drawCover(g, im, x, y, w, h, fx, fy) {
    var s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
    var sx = clamp((im.width - sw) * (fx === undefined ? 0.5 : fx), 0, im.width - sw), sy = clamp((im.height - sh) * (fy === undefined ? 0.5 : fy), 0, im.height - sh);
    g.drawImage(im, sx, sy, sw, sh, x, y, w, h);
  }
  function containRect(iw, ih, bw, bh) { var s = Math.min(bw / iw, bh / ih); return { w: iw * s, h: ih * s }; }
  function wrapText(g, text, x, y, maxW, lh) {
    var words = String(text).split(' '), line = '', lines = [];
    for (var i = 0; i < words.length; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (g.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t; }
    lines.push(line); for (var j = 0; j < lines.length; j++) g.fillText(lines[j], x, y + j * lh); return lines.length;
  }
  var paperPattern = null;
  function paper(g, w, h, tone) {
    g.fillStyle = tone || '#f1e8d6'; g.fillRect(0, 0, w, h);
    if (!paperPattern) {
      var c = canvas(128, 128), pg = c.getContext('2d'), d = pg.createImageData(128, 128);
      for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 9; }
      pg.putImageData(d, 0, 0); paperPattern = c;
    }
    g.fillStyle = g.createPattern(paperPattern, 'repeat'); g.fillRect(0, 0, w, h);
  }
  function M(x, y, z, rx, ry, rz) { var m = new T.Matrix4(); m.compose(new T.Vector3(x || 0, y || 0, z || 0), new T.Quaternion().setFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0)), new T.Vector3(1, 1, 1)); return m; }
  function mergeColored(parts) {
    var pos = [], nor = [], col = [];
    parts.forEach(function (p) {
      var g = p.geo.index ? p.geo.toNonIndexed() : p.geo; if (p.mat) g.applyMatrix4(p.mat);
      var a = g.attributes.position.array, n = g.attributes.normal.array, c = new T.Color(p.color);
      for (var i = 0; i < a.length; i++) { pos.push(a[i]); nor.push(n[i]); }
      for (var j = 0; j < a.length / 3; j++) col.push(c.r, c.g, c.b);
    });
    var out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    return out;
  }

  /* ---------------- shaders ---------------- */
  var FS_QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  // background: aurora (midnight navy → plum → warm gold light). The cursor trail (uTrail) pushes and
  // swirls it like light in liquid; palette + glow position cross-fade per section.
  var AURORA_FS = [
    'uniform sampler2D uNoise; uniform sampler2D uTrail; uniform float uTime; uniform float uScroll; uniform vec3 uBase; uniform vec3 uA; uniform vec3 uB; uniform vec3 uGold; uniform vec3 uGlow; uniform vec2 uRes; uniform vec2 uPar;',
    'varying vec2 vUv;',
    'void main(){',
    '  vec4 tr = texture2D(uTrail, vUv); vec2 vel = (tr.xy - 0.5) * 2.0; vel *= step(0.012, abs(vel)); float dye = tr.z;',
    '  vec2 p = vUv - vel * 0.075 + uPar * 0.018;',
    '  float asp = uRes.x / uRes.y; vec2 q = vec2(p.x * asp, p.y);',
    '  float t = uTime * 0.025; float s = uScroll;',
    '  float n1 = texture2D(uNoise, q * 0.35 + vec2(t, -s * 0.25)).r;',
    '  float n2 = texture2D(uNoise, q * 0.6 + vec2(-t * 1.3, t * 0.7 - s * 0.4) + n1 * 0.45 + vel * 0.35).g;',
    '  float n3 = texture2D(uNoise, q * 0.22 + vec2(t * 0.6, s * 0.15) + n2 * 0.35).r;',
    '  vec3 c = uBase;',
    '  float band1 = smoothstep(0.3, 0.88, n2) * smoothstep(-0.15, 0.75, p.y + n1 * 0.5 - 0.1);',
    '  float band2 = smoothstep(0.36, 0.92, n3) * (1.1 - p.y * 0.5);',
    '  c = mix(c, uA, clamp(band1 * 0.85, 0.0, 1.0));',
    '  c = mix(c, uB, clamp(band2 * 0.7, 0.0, 1.0));',
    '  float gd = length((p - uGlow.xy) * vec2(asp * 0.7, 1.0));',
    '  float glow = (0.3 + 0.7 * smoothstep(0.25, 0.9, n1 * n2 * 1.8)) * exp(-gd * gd * 7.0);',
    '  c += uGold * glow * uGlow.z * 0.32;',
    // warm light dragged by the cursor
    '  c += (uGold * 0.55 + uA * 0.8) * dye * 0.55 * (0.6 + 0.4 * n2);',
    '  c *= 0.72 + 0.28 * smoothstep(0.15, 0.7, n1 * 0.6 + n3 * 0.6);',
    '  c *= 0.84 + 0.16 * smoothstep(1.3, 0.2, length((p - 0.5) * vec2(asp, 1.0)));',
    '  gl_FragColor = vec4(c, 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  // cursor "fluid": a small velocity + light texture that advects itself, decays, and gets a splat at the pointer.
  // RGBA8 so it runs everywhere: rg = velocity (0.5 = still), b = light.
  var TRAIL_FS = [
    'uniform sampler2D tPrev; uniform vec2 uPt; uniform vec2 uVel; uniform float uAsp; uniform float uR; uniform float uDecay; varying vec2 vUv;',
    'vec3 dec(vec4 t){ vec2 v = (t.xy - 0.5) * 2.0; v *= step(0.012, abs(v)); return vec3(v, t.z); }',
    'void main(){ vec3 here = dec(texture2D(tPrev, vUv));',
    '  vec3 s = dec(texture2D(tPrev, vUv - here.xy * 0.02));',
    '  vec2 v = s.xy * uDecay; float dye = max(0.0, s.z * uDecay - 0.004);',
    '  vec2 d = (vUv - uPt) * vec2(uAsp, 1.0); float g = exp(-dot(d, d) / (uR * uR)); float sp = length(uVel);',
    '  v += (uVel + vec2(-d.y, d.x) * sp * 5.0) * g;',
    '  dye += g * min(1.0, sp * 2.5) * 0.5;',
    '  gl_FragColor = vec4(clamp(v, -1.0, 1.0) * 0.5 + 0.5, clamp(dye, 0.0, 1.0), 1.0); }'].join('\n');
  var BRIGHT_FS = 'uniform sampler2D tMap; uniform float uThr; varying vec2 vUv; void main(){ vec3 c = texture2D(tMap, vUv).rgb; float l = dot(c, vec3(0.299, 0.587, 0.114)); float k = smoothstep(uThr, uThr + 0.35, l); gl_FragColor = vec4(c * k, 1.0); }';
  var BLUR_FS = [
    'uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;',
    'void main(){ vec3 c = texture2D(tMap, vUv).rgb * 0.227;',
    '  c += texture2D(tMap, vUv + uDir * 1.385).rgb * 0.316; c += texture2D(tMap, vUv - uDir * 1.385).rgb * 0.316;',
    '  c += texture2D(tMap, vUv + uDir * 3.231).rgb * 0.07; c += texture2D(tMap, vUv - uDir * 3.231).rgb * 0.07;',
    '  gl_FragColor = vec4(c, 1.0); }'].join('\n');
  var COMPOSITE_FS = [
    'uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;',
    'float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
    'void main(){ vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;',
    '  vec2 d = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0); c *= mix(1.0, 0.62, smoothstep(0.45, 1.25, length(d)));',
    '  gl_FragColor = vec4(c, 1.0);',
    '  #include <colorspace_fragment>',
    // film grain AFTER the sRGB conversion: tiny amplitude, faded out in the darks, re-seeded 12x per second
    '  float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));',
    '  float g = h(floor(vUv * uRes) + floor(uTime * 12.0) * 37.0) - 0.5;',
    '  gl_FragColor.rgb += g * 0.011 * smoothstep(0.03, 0.35, lum);',
    '}'].join('\n');
  // floating loose pages: printed/sketched paper, curled, really lit: warm key, light through the paper,
  // the cursor's lamp, a palette rim light and a soft sheen. (A soft shadow is drawn behind each sheet.)
  var SHEET_VS = [
    'attribute float aVar; varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vTint; varying float vDepth; varying float vVar;',
    'void main(){ vUv = uv; vVar = aVar; vec3 p = position; p.z += sin(uv.x * 3.1416) * 0.12 - uv.y * 0.05;',
    '  vN = normalize(normalMatrix * mat3(instanceMatrix) * vec3(-cos(uv.x * 3.1416) * 0.35, 0.05, 1.0));',
    '  #ifdef USE_INSTANCING_COLOR', '  vTint = instanceColor;', '  #else', '  vTint = vec3(1.0);', '  #endif',
    '  vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0); vP = mv.xyz; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }'].join('\n');
  var SHEET_FS = [
    'uniform sampler2D uMap; uniform vec3 uLight; uniform vec3 uKey; uniform vec3 uFill; uniform vec3 uRim; uniform vec3 uFog; uniform vec3 uCur; uniform vec3 uCurCol;',
    'varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vTint; varying float vDepth; varying float vVar;',
    'void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    '  vec2 cell = vec2(mod(vVar, 2.0), 1.0 - floor(vVar / 2.0)) * 0.5; vec2 tuv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);',
    '  vec3 alb = texture2D(uMap, cell + clamp(tuv, 0.01, 0.99) * 0.5).rgb * vTint;',
    '  vec3 V = normalize(-vP); float ndl = dot(n, uLight);',
    '  float diff = max(ndl, 0.0), trans = max(-ndl, 0.0) * 0.4;',
    '  vec3 Lc = uCur - vP; float dc = length(Lc); float cur = max(dot(n, Lc / dc), 0.0) / (1.0 + dc * dc * 0.1);',
    '  float curl = 0.74 + 0.26 * sin(vUv.x * 3.1416);',
    '  float rim = pow(1.0 - abs(dot(n, V)), 3.0);',
    '  vec3 c = alb * (uFill + uKey * (diff * 0.95 + trans) * curl + uCurCol * cur);',
    '  c += uRim * rim * 0.6 + uKey * pow(max(dot(n, normalize(uLight + V)), 0.0), 28.0) * 0.14;',
    '  c = mix(c, uFog, smoothstep(9.0, 26.0, vDepth) * 0.9);',
    '  gl_FragColor = vec4(c, 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  // camera-facing soft sprites: sheet shadows and the out-of-focus foreground layer
  var SPRITE_VS = [
    'attribute vec2 aCell; attribute float aRot; varying vec2 vUv;',
    'void main(){ vUv = aCell + uv * 0.5; vec4 c = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
    '  float s = length(instanceMatrix[0].xyz); vec2 q = position.xy * s; float cr = cos(aRot), sr = sin(aRot);',
    '  c.xy += vec2(q.x * cr - q.y * sr, q.x * sr + q.y * cr); gl_Position = projectionMatrix * c; }'].join('\n');
  var SPRITE_FS = [
    'uniform sampler2D uMap; uniform vec3 uTint; uniform float uAlpha; varying vec2 vUv;',
    'void main(){ vec4 t = texture2D(uMap, vUv); float a = t.a * uAlpha; if (a < 0.004) discard; gl_FragColor = vec4(uTint * t.rgb, a);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  var CARD_VS = [
    'varying vec2 vUv; varying vec3 vTint; varying float vDepth;',
    'void main(){ vUv = uv;',
    '  #ifdef USE_INSTANCING_COLOR', '  vTint = instanceColor;', '  #else', '  vTint = vec3(1.0);', '  #endif',
    '  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }'].join('\n');
  var CARD_FS = [
    'uniform sampler2D uMap; uniform float uAlpha; varying vec2 vUv; varying vec3 vTint; varying float vDepth;',
    'void main(){ vec4 t = texture2D(uMap, vUv); float a = t.a * uAlpha * (1.0 - smoothstep(10.0, 28.0, vDepth) * 0.85);',
    '  if (a < 0.01) discard; gl_FragColor = vec4(t.rgb * vTint, a);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  var PTS_VS = [
    'attribute float aSeed; attribute float aKind; uniform float uTime; uniform float uPR;',
    'varying float vA; varying float vKind;',
    'void main(){ vec3 p = position; float s = aSeed * 6.2831;',
    '  p.x += sin(uTime * 0.12 + s * 3.0) * 0.4; p.y += sin(uTime * 0.09 + s * 2.0) * 0.5;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  float size = aKind > 0.5 ? (26.0 + aSeed * 46.0) : (2.0 + aSeed * 2.6);',
    '  gl_PointSize = clamp(size * uPR * (8.0 / -mv.z), 1.0, 220.0 * uPR);',
    '  vA = aKind > 0.5 ? 0.07 + 0.05 * sin(uTime * 0.4 + s * 4.0) : 0.35 + 0.65 * abs(sin(uTime * (0.4 + aSeed) + s * 9.0));',
    '  vA *= aKind > 0.5 ? 1.0 - smoothstep(-3.0, -1.2, mv.z) : smoothstep(-30.0, -5.0, mv.z); vKind = aKind; gl_Position = projectionMatrix * mv; }'].join('\n');
  var PTS_FS = [
    'uniform vec3 uGoldP; varying float vA; varying float vKind;',
    'void main(){ float d = length(gl_PointCoord - 0.5); float a; vec3 c;',
    '  if (vKind > 0.5) { a = smoothstep(0.5, 0.36, d) * 0.9 + smoothstep(0.5, 0.0, d) * 0.3; c = uGoldP * 1.05; }',
    '  else { a = smoothstep(0.5, 0.0, d); a *= a; c = uGoldP * 1.15; }',
    '  gl_FragColor = vec4(c, a * vA); }'].join('\n');
  var BLOOMSTAIN_VS = [
    'attribute float aProg; attribute vec3 aCol; attribute float aSeed; varying vec2 vUv; varying float vProg; varying vec3 vCol; varying float vSeed;',
    'void main(){ vUv = uv; vProg = aProg; vCol = aCol; vSeed = aSeed;',
    '  if (aProg <= 0.001 || aProg >= 0.999) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
    '  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }'].join('\n');
  var BLOOMSTAIN_FS = [
    'uniform sampler2D uNoise; uniform float uTime; varying vec2 vUv; varying float vProg; varying vec3 vCol; varying float vSeed;',
    'void main(){ vec2 p = (vUv - 0.5) * vec2(1.6, 1.0); float d = length(p); vec2 dir = p / max(d, 1e-4);',
    '  float grow = smoothstep(0.0, 0.72, vProg), fade = 1.0 - smoothstep(0.78, 1.0, vProg);',
    // tendrils: noise sampled around the circle (seamless), the edge creeps outward unevenly like ink in wet paper
    '  float ten = texture2D(uNoise, dir * 0.32 + vec2(vSeed * 3.7, grow * 0.35)).r;',
    '  float wob = texture2D(uNoise, p * 0.55 + vec2(vSeed * 1.9, uTime * 0.002)).g;',
    '  float r = grow * 0.36 + (ten - 0.5) * 0.15 * grow + (wob - 0.5) * 0.06;',
    '  if (d > r + 0.03) discard;',
    '  float fib = texture2D(uNoise, dir * 1.4 + p * 3.0 + vSeed).r;',
    '  float body = smoothstep(r, r - 0.16, d);',
    '  float rim = smoothstep(r - 0.05, r - 0.008, d) * (1.0 - smoothstep(r - 0.008, r + 0.025, d)) * (0.45 + 0.55 * fib);',
    // a pigment-rich body that dries darker in the middle, with a feathered, fibrous luminous edge
    '  float a = (body * (0.13 + 0.07 * wob) * (1.0 - 0.35 * smoothstep(r * 0.2, r * 0.8, r - d)) + rim * 0.2) * fade; if (a < 0.003) discard;',
    '  gl_FragColor = vec4(vCol * mix(0.42, 1.25, rim + body * 0.15), a); }'].join('\n');
  // book pages: real page curl (bent plane), front/back textures
  var PAGE_VS = [
    'uniform float uTurn; uniform float uBend; uniform float uW;',
    'varying vec2 vUv; varying vec3 vN; varying float vX;',
    'void main(){ vUv = uv; float x = position.x;',
    '  float c = uBend * sin(uTurn) / uW; float a = uTurn + c * x;',
    '  vec3 p = vec3(0.0, position.y, 0.0);',
    '  if (abs(c) > 1e-4) { p.x = (sin(a) - sin(uTurn)) / c; p.z = (cos(uTurn) - cos(a)) / c; } else { p.x = x * cos(uTurn); p.z = x * sin(uTurn); }',
    '  p.z += sin(uTurn) * sin(uv.y * 3.1416) * 0.02 * (x / uW);',
    '  vN = normalize(normalMatrix * vec3(-sin(a), 0.0, cos(a))); vX = x / uW;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }'].join('\n');
  var PAGE_FS = [
    'uniform sampler2D uFront; uniform sampler2D uBack; uniform vec4 uFR; uniform vec4 uBR; uniform vec3 uLight; uniform float uLift;',
    'varying vec2 vUv; varying vec3 vN; varying float vX;',
    'void main(){ vec3 n = normalize(vN); vec4 col;',
    '  if (gl_FrontFacing) col = texture2D(uFront, uFR.xy + vUv * uFR.zw); else { n = -n; col = texture2D(uBack, uBR.xy + vec2(1.0 - vUv.x, vUv.y) * uBR.zw); }',
    '  float light = 0.55 + 0.55 * max(dot(n, uLight), 0.0);',
    // a page in mid-flip catches a warm sheen on its lifted half
    '  light += uLift * 0.12 * smoothstep(0.3, 1.0, vX);',
    '  light *= mix(0.62, 1.0, smoothstep(0.0, 0.16, vX)) * mix(1.0, 0.9, smoothstep(0.88, 1.0, vX));',
    '  gl_FragColor = vec4(col.rgb * light * vec3(1.04, 1.0, 0.93), 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');

  /* ---------------- shared textures ---------------- */
  function noiseTexture() {
    var N = 128, c = canvas(N, N), g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data;
    function grid(res, seed) { var a = []; for (var i = 0; i < res * res; i++) a.push(Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1); return a; }
    var o1 = [[4, grid(4, 1), 0.5], [8, grid(8, 2), 0.25], [16, grid(16, 3), 0.15], [32, grid(32, 4), 0.1]], o2 = [[6, grid(6, 5), 0.6], [24, grid(24, 6), 0.4]];
    function sample(o, x, y) { var res = o[0], gx = x / N * res, gy = y / N * res, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      var at = function (i, j) { return o[1][((j % res + res) % res) * res + ((i % res + res) % res)]; };
      return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var v = 0, w = 0, k; for (k = 0; k < o1.length; k++) v += sample(o1[k], x, y) * o1[k][2]; for (k = 0; k < o2.length; k++) w += sample(o2[k], x, y) * o2[k][2];
      var q = (y * N + x) * 4; d[q] = v * 255; d[q + 1] = w * 255; d[q + 2] = 0; d[q + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.minFilter = T.LinearFilter; t.generateMipmaps = false; return t;
  }
  var TEXBYTES = { v: 0 };
  function canvasTex(c, srgb) { var t = new T.CanvasTexture(c); if (srgb !== false) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; TEXBYTES.v += c.width * c.height * 4 * 1.33; return t; }

  /* ======================================================================== */
  function create(o) {
    var cfg = o.cfg || {}, mobile = !!o.mobile, state = o.state, canvasEl = o.canvas;
    var renderer = new T.WebGLRenderer({ canvas: canvasEl, context: o.glContext || undefined, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
    renderer.setClearColor(0x0b0f1e, 1);
    renderer.autoClear = false;
    renderer.toneMapping = T.NoToneMapping;
    var maxDpr = mobile ? 1 : Math.min(1.25, cfg.maxPixelRatio || 1.25);
    var dpr0 = Math.min(window.devicePixelRatio || 1, maxDpr), dpr = dpr0;
    renderer.setPixelRatio(dpr);
    var isGL2 = renderer.capabilities.isWebGL2;
    var L = { vw: 1, vh: 1, docH: 1 };
    var dummy = new T.Object3D(), tmpC = new T.Color();
    var noise = noiseTexture();
    var LIGHT = new T.Vector3(-0.4, 0.6, 0.7).normalize();
    var quality = 3, post = !mobile, worldOff = false;
    // a computer without a graphics card (software rendering) starts on the light setting
    var software = false;
    try { var glc = renderer.getContext(), dbg = glc.getExtension('WEBGL_debug_renderer_info'); software = /swiftshader|llvmpipe|software|basic render/i.test(dbg ? glc.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''); } catch (e) {}

    /* ======================= POST-PROCESSING ======================= */
    var quadGeo = new T.PlaneGeometry(2, 2), quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quadScene = new T.Scene();
    var quad = new T.Mesh(quadGeo); quad.frustumCulled = false; quadScene.add(quad);
    var rtScene = null, rtA = null, rtB = null;
    var brightMat = new T.ShaderMaterial({ vertexShader: FS_QUAD_VS, fragmentShader: BRIGHT_FS, uniforms: { tMap: { value: null }, uThr: { value: 0.42 } }, depthTest: false, depthWrite: false });
    var blurMat = new T.ShaderMaterial({ vertexShader: FS_QUAD_VS, fragmentShader: BLUR_FS, uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2() } }, depthTest: false, depthWrite: false });
    var compMat = new T.ShaderMaterial({ vertexShader: FS_QUAD_VS, fragmentShader: COMPOSITE_FS, uniforms: { tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 0.85 }, uTime: { value: 0 }, uRes: { value: new T.Vector2(1, 1) } }, depthTest: false, depthWrite: false });
    var rtKey = '';
    function makeTargets() {
      var w = Math.floor(L.vw * dpr), h = Math.floor(L.vh * dpr), key = post ? w + 'x' + h : 'off';
      if (key === rtKey) return; rtKey = key;                       // nothing changed: keep the targets
      [rtScene, rtA, rtB].forEach(function (r) { if (r) r.dispose(); });
      if (!post) { rtScene = rtA = rtB = null; return; }
      rtScene = new T.WebGLRenderTarget(w, h, { samples: 0, depthBuffer: true }); // no MSAA: bloom + grain hide edges
      rtA = new T.WebGLRenderTarget(Math.max(1, w >> 2), Math.max(1, h >> 2), { depthBuffer: false });
      rtB = new T.WebGLRenderTarget(Math.max(1, w >> 2), Math.max(1, h >> 2), { depthBuffer: false });
      compMat.uniforms.uRes.value.set(w, h);
    }
    function runPass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); }

    /* ======================= BACKGROUND WORLD ======================= */
    var world = null;
    // per-section palettes: base, aurora A, aurora B, warm light, [glow x, glow y, glow strength]
    var PAL_SRC = {
      home:         ['#0c1330', '#40215c', '#173f70', '#f2c274', [0.74, 0.62, 1.0]],   // gold light on navy
      about:        ['#1a1028', '#62264f', '#3c1d4c', '#f2a874', [0.24, 0.56, 0.85]],  // warm plum
      services:     ['#071a24', '#0f5058', '#183d6c', '#eebe6e', [0.82, 0.32, 0.75]],  // teal-navy with gold
      work:         ['#0e0f15', '#23212b', '#1b2130', '#c4a676', [0.5, 0.5, 0.3]],     // deep neutral: the art pops
      process:      ['#12151d', '#303849', '#45392a', '#ead7ae', [0.3, 0.68, 0.6]],    // ink & paper
      skills:       ['#0c1330', '#2f2366', '#144a70', '#e6bb70', [0.7, 0.4, 0.65]],
      testimonials: ['#140f26', '#4e2352', '#1e3262', '#f2bc7c', [0.5, 0.36, 0.7]],
      faq:          ['#0b1226', '#2a2e62', '#143f5a', '#dcb86c', [0.3, 0.5, 0.55]],
      contact:      ['#1a1018', '#57263c', '#47311c', '#ffc474', [0.5, 0.56, 1.25]]   // warm gold glow
    };
    var PAL = {}; Object.keys(PAL_SRC).forEach(function (k) { var a = PAL_SRC[k]; PAL[k] = [new T.Color(a[0]), new T.Color(a[1]), new T.Color(a[2]), new T.Color(a[3]), new T.Vector3(a[4][0], a[4][1], a[4][2])]; });
    var palCur = [new T.Color(), new T.Color(), new T.Color(), new T.Color(), new T.Vector3()], palTgt = [new T.Color(), new T.Color(), new T.Color(), new T.Color(), new T.Vector3()], palInit = false;
    var palInfo = { name: 'home', next: 'home', k: 0 };
    var secs = [];   // { name, top, h } measured on resize
    var LIT = { key: new T.Color(), fill: new T.Color(), rim: new T.Color(), cur: new T.Color(), gold: new T.Color() };
    // soft sprite atlas (2x2): 0 soft rounded rect (shadow / page), 1 pencil, 2 ink drop, 3 leaf / brush
    function softAtlas() {
      var c = canvas(512, 512), g = c.getContext('2d');
      function soft(cx, cy, blur, draw) { g.save(); g.shadowColor = '#fff'; g.shadowBlur = blur; g.shadowOffsetX = 2000; g.fillStyle = '#fff'; g.translate(cx - 2000, cy); draw(); g.restore(); }
      soft(128, 128, 22, function () { g.beginPath(); g.roundRect ? g.roundRect(-62, -82, 124, 164, 10) : g.rect(-62, -82, 124, 164); g.fill(); });
      soft(384, 128, 14, function () { g.rotate(0.7); g.fillRect(-12, -96, 24, 172); g.beginPath(); g.moveTo(-12, 76); g.lineTo(12, 76); g.lineTo(0, 108); g.fill(); });
      soft(128, 384, 18, function () { g.beginPath(); g.moveTo(0, -80); g.bezierCurveTo(48, -20, 62, 30, 0, 72); g.bezierCurveTo(-62, 30, -48, -20, 0, -80); g.fill(); });
      soft(384, 384, 16, function () { g.rotate(-0.5); g.beginPath(); g.ellipse(0, 0, 34, 96, 0, 0, 6.283); g.fill(); });
      var t = canvasTex(c, false); return t;
    }
    // paper atlas (2x2): ruled, graphite sketch, watercolour study, gold-edged printed page
    function sheetAtlas() {
      var N = 512, H = 256, c = canvas(N, N), g = c.getContext('2d');
      function cell(ix, iy, fn) { g.save(); g.translate(ix * H, iy * H); g.beginPath(); g.rect(0, 0, H, H); g.clip(); paper(g, H, H, '#f3ead7'); fn(); g.restore(); }
      cell(0, 0, function () { g.strokeStyle = 'rgba(92,120,180,.38)'; g.lineWidth = 1.2; for (var y = 40; y < 246; y += 15) { g.beginPath(); g.moveTo(10, y); g.lineTo(246, y); g.stroke(); } g.strokeStyle = 'rgba(200,80,80,.45)'; g.beginPath(); g.moveTo(40, 0); g.lineTo(40, 256); g.stroke();
        g.strokeStyle = 'rgba(40,40,60,.45)'; g.lineWidth = 1.4; for (var k = 0; k < 6; k++) { var yy = 52 + k * 30; g.beginPath(); g.moveTo(52, yy); for (var x = 52; x < 200 - k * 14; x += 8) g.lineTo(x, yy + Math.sin(x * 0.4 + k) * 2.2); g.stroke(); } });
      cell(1, 0, function () { g.lineCap = 'round'; for (var i = 0; i < 46; i++) { g.strokeStyle = 'rgba(60,58,66,' + (0.12 + Math.random() * 0.3) + ')'; g.lineWidth = 0.8 + Math.random() * 1.4; var cx = 128 + (Math.random() - 0.5) * 70, cy = 120 + (Math.random() - 0.5) * 90; g.beginPath(); g.ellipse(cx, cy, 20 + Math.random() * 50, 14 + Math.random() * 40, Math.random() * 3, Math.random() * 3, 3 + Math.random() * 3); g.stroke(); }
        for (i = 0; i < 26; i++) { g.strokeStyle = 'rgba(60,58,66,.18)'; g.lineWidth = 0.7; var x0 = 40 + Math.random() * 170, y0 = 196 + Math.random() * 30; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 22, y0 - 10); g.stroke(); } });
      cell(0, 1, function () { [['rgba(232,120,104,.30)', 92, 100, 58], ['rgba(70,110,190,.26)', 158, 132, 64], ['rgba(216,170,90,.32)', 120, 176, 50]].forEach(function (b) { for (var j = 0; j < 5; j++) { var r = g.createRadialGradient(b[1] + j * 3, b[2] - j * 2, 2, b[1], b[2], b[3] - j * 6); r.addColorStop(0, b[0]); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(b[1], b[2], b[3], 0, 6.283); g.fill(); } });
        g.strokeStyle = 'rgba(50,48,60,.35)'; g.lineWidth = 1.1; g.beginPath(); g.arc(122, 130, 52, 0.3, 5.6); g.stroke(); });
      cell(1, 1, function () { g.strokeStyle = 'rgba(190,150,80,.75)'; g.lineWidth = 2; g.strokeRect(18, 18, 220, 220); g.fillStyle = 'rgba(70,64,74,.32)'; for (var y = 70; y < 220; y += 13) g.fillRect(40, y, 120 + ((y * 7) % 56), 3.2); g.fillStyle = 'rgba(150,110,60,.6)'; g.fillRect(40, 42, 86, 7); });
      return canvasTex(c);
    }
    var RIM = { value: new T.Color() };
    function addRim(m, k) {
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uRim = RIM;
        sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  gl_FragColor.rgb += uRim * pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 3.0) * ' + k + ';');
      };
      return m;
    }
    function brushTex() {
      var c = canvas(512, 128), g = c.getContext('2d');
      for (var i = 0; i < 70; i++) {
        var y = 64 + (Math.random() - 0.5) * 50, w = 2 + Math.random() * 6; g.strokeStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.5) + ')'; g.lineWidth = w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(20 + Math.random() * 30, y); g.bezierCurveTo(160, y - 20 + Math.random() * 40, 330, y - 20 + Math.random() * 40, 470 - Math.random() * 40, y + (Math.random() - 0.5) * 20); g.stroke();
      }
      var grd = g.createLinearGradient(0, 0, 512, 0); grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.15, 'rgba(0,0,0,0)'); grd.addColorStop(0.8, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = grd; g.fillRect(0, 0, 512, 128);
      return canvasTex(c);
    }
    function buildWorld() {
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 0.1, 80); cam.position.set(0, 0, 10);
      var density = mobile ? (cfg.objectsMobile || 0.4) : (cfg.objectsDesktop || 1);
      var N = function (x) { return Math.max(2, Math.round(x * density)); };
      var FOG = new T.Color(0x0b0f1e);
      scene.fog = new T.Fog(0x0b0f1e, 8, 26);
      var amb = new T.AmbientLight(0x7a86b8, 0.6); scene.add(amb);
      var key = new T.DirectionalLight(0xffe0b0, 1.1); key.position.set(-3, 5, 6); scene.add(key);
      var rim = new T.DirectionalLight(0xc78ad8, 0.55); rim.position.set(5, -2, -4); scene.add(rim);
      // lamps[0] follows the cursor (objects near it light up), lamps[1] drifts slowly
      var lamps = [new T.PointLight(0xffc98a, 9, 11, 1.6), new T.PointLight(0xff8f7a, 3, 9, 1.6)]; lamps.forEach(function (l) { scene.add(l); });

      // aurora backdrop (drawn first, always behind)
      var aurora = new T.Mesh(quadGeo, new T.ShaderMaterial({ vertexShader: FS_QUAD_VS, fragmentShader: AURORA_FS, depthTest: false, depthWrite: false,
        uniforms: { uNoise: { value: noise }, uTrail: { value: null }, uTime: { value: 0 }, uScroll: { value: 0 }, uBase: { value: palCur[0] }, uA: { value: palCur[1] }, uB: { value: palCur[2] }, uGold: { value: palCur[3] }, uGlow: { value: palCur[4] }, uRes: { value: new T.Vector2(1, 1) }, uPar: { value: new T.Vector2() } } }));
      aurora.frustumCulled = false; aurora.renderOrder = -100; scene.add(aurora);

      var items = [];
      function addInst(geo, mat, n, opts, colors) {
        var mesh = new T.InstancedMesh(geo, mat, n); mesh.frustumCulled = false;
        if (colors) for (var i = 0; i < n; i++) mesh.setColorAt(i, tmpC.set(colors[i % colors.length]));
        scene.add(mesh);
        var data = [], phase = Math.random();
        for (var k = 0; k < n; k++) data.push({ u: ((k + Math.random()) / n + phase) % 1, fx: (Math.random() < 0.5 ? -1 : 1) * rnd(0.55, 1.2), z: rnd(opts.minZ || -14, opts.maxZ === undefined ? 1 : opts.maxZ),
          rx: rnd(0, 6.28), ry: rnd(0, 6.28), rz: rnd(0, 6.28), sp: rnd(0.12, 0.4) * (Math.random() < 0.5 ? -1 : 1), s: rnd(opts.minS || 0.7, opts.maxS || 1.2), bob: rnd(0, 6.28),
          ox: 0, oy: 0, vx: 0, vy: 0, spin: 0, sv: 0 });   // cursor push + spin
        var it = { mesh: mesh, data: data, n: n, flat: opts.flat }; items.push(it); return it;
      }
      // loose book pages
      var curView = new T.Vector3();
      var sheetMat = new T.ShaderMaterial({ vertexShader: SHEET_VS, fragmentShader: SHEET_FS, side: T.DoubleSide,
        uniforms: { uMap: { value: sheetAtlas() }, uLight: { value: LIGHT }, uFog: { value: FOG }, uKey: { value: LIT.key }, uFill: { value: LIT.fill }, uRim: { value: LIT.rim }, uCur: { value: curView }, uCurCol: { value: LIT.cur } } });
      var sheetGeo = new T.PlaneGeometry(1.1, 1.45, 10, 1);
      var nSheets = N(36), aVar = new Float32Array(nSheets); for (var v = 0; v < nSheets; v++) aVar[v] = v % 4;
      sheetGeo.setAttribute('aVar', new T.InstancedBufferAttribute(aVar, 1));
      var sheets = addInst(sheetGeo, sheetMat, nSheets, { minZ: -9, maxZ: -0.5, minS: 0.65, maxS: 1.15 }, ['#fbf4e4', '#f6ecd6', '#efe4cc', '#fffaf0']);
      // soft shadow behind every sheet (camera-facing blurred card, offset down-right)
      var atlas = softAtlas();
      var spriteGeo = function (n, cells) { var g = new T.PlaneGeometry(1, 1), ac = new Float32Array(n * 2), ar = new Float32Array(n); for (var i = 0; i < n; i++) { var cc = cells(i); ac[i * 2] = (cc % 2) * 0.5; ac[i * 2 + 1] = (1 - Math.floor(cc / 2)) * 0.5; } /* canvas row 0 = top = uv 0.5..1 */ g.setAttribute('aCell', new T.InstancedBufferAttribute(ac, 2)); g.setAttribute('aRot', new T.InstancedBufferAttribute(ar, 1)); return g; };
      var shGeo = spriteGeo(nSheets, function () { return 0; });
      var shadows = new T.InstancedMesh(shGeo, new T.ShaderMaterial({ vertexShader: SPRITE_VS, fragmentShader: SPRITE_FS, transparent: true, depthWrite: false,
        uniforms: { uMap: { value: atlas }, uTint: { value: new T.Color(0x02030a) }, uAlpha: { value: 0.3 } } }), nSheets);
      shadows.frustumCulled = false; scene.add(shadows); sheets.shadow = shadows;
      dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(0); dummy.updateMatrix(); for (v = 0; v < nSheets; v++) shadows.setMatrixAt(v, dummy.matrix); dummy.scale.setScalar(1);
      // paper planes
      var pp = new T.BufferGeometry(); pp.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.6, -0.42, 0.04, -0.4, 0, -0.02, -0.4, 0, 0, 0.6, 0, -0.02, -0.4, 0.42, 0.04, -0.4, 0, 0, 0.6, 0, -0.02, -0.4, 0, -0.14, -0.36], 3)); pp.computeVertexNormals();
      addInst(pp, addRim(new T.MeshStandardMaterial({ color: 0xf6eedf, roughness: 0.8, side: T.DoubleSide }), '0.55'), N(12), { minZ: -8, maxZ: 0, minS: 0.8, maxS: 1.3 });
      // pencils
      var pencilGeo = mergeColored([
        { geo: new T.CylinderGeometry(0.07, 0.07, 1.5, 6), color: '#ffffff' }, { geo: new T.CylinderGeometry(0.0, 0.07, 0.26, 6), color: '#e8c9a0', mat: M(0, 0.88, 0) },
        { geo: new T.CylinderGeometry(0.0, 0.025, 0.09, 6), color: '#2a2a2a', mat: M(0, 0.975, 0) }, { geo: new T.CylinderGeometry(0.072, 0.072, 0.12, 12), color: '#c9c9c9', mat: M(0, -0.81, 0) }, { geo: new T.CylinderGeometry(0.068, 0.068, 0.12, 12), color: '#e9a0a8', mat: M(0, -0.93, 0) }]);
      var vcol = addRim(new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.05 }), '0.6');
      addInst(pencilGeo, vcol, N(18), { minZ: -8, maxZ: 0, minS: 0.7, maxS: 1.1 }, ['#d8b46a', '#e07a6a', '#5b7fc4', '#7fb59a', '#c9a0e0']);
      // ink drops (glossy)
      var dropPts = []; for (var i = 0; i <= 12; i++) { var tt = i / 12, aa = tt * Math.PI; dropPts.push(new T.Vector2(Math.sin(aa) * 0.22 * (1 - tt * 0.55), -Math.cos(aa) * 0.26 + tt * tt * 0.18)); }
      addInst(new T.LatheGeometry(dropPts, 18), addRim(new T.MeshStandardMaterial({ roughness: 0.16, metalness: 0.05, emissive: 0x2c1d08 }), '0.7'), N(26), { minZ: -8, maxZ: 0, minS: 0.5, maxS: 1.1 }, ['#d8b46a', '#f08a7a', '#2e3c78', '#8a5bb8', '#e9c48a']);
      // painterly brush strokes (gold / coral)
      var strokeMat = new T.ShaderMaterial({ vertexShader: CARD_VS, fragmentShader: CARD_FS, transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, uniforms: { uMap: { value: brushTex() }, uAlpha: { value: 0.32 } } });
      addInst(new T.PlaneGeometry(3.2, 0.8), strokeMat, N(12), { minZ: -16, maxZ: -4, minS: 0.9, maxS: 1.8, flat: true }, ['#d8b46a', '#f08a7a', '#c88ad8', '#e9c48a']);

      // ONE Points object: soft bokeh + gold dust
      var NP = mobile ? (cfg.dustMobile || 160) : (cfg.dustDesktop || 600);
      var pGeo = new T.BufferGeometry(), pPos = new Float32Array(NP * 3), pSeed = new Float32Array(NP), pKind = new Float32Array(NP), pU = new Float32Array(NP);
      for (i = 0; i < NP; i++) { var bok = Math.random() < 0.12 ? 1 : 0; pKind[i] = bok; pSeed[i] = Math.random(); pU[i] = Math.random(); pPos[i * 3] = (Math.random() - 0.5) * 24; pPos[i * 3 + 2] = bok ? rnd(2.5, 6.5) : rnd(-16, -5); }   // dust = far layer, bokeh = near layer
      pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3)); pGeo.setAttribute('aSeed', new T.BufferAttribute(pSeed, 1)); pGeo.setAttribute('aKind', new T.BufferAttribute(pKind, 1));
      var pMat = new T.ShaderMaterial({ vertexShader: PTS_VS, fragmentShader: PTS_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPR: { value: dpr }, uGoldP: { value: LIT.gold } } });
      var points = new T.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);

      // foreground layer: big, out-of-focus silhouettes (page, pencil, ink drop, leaf) right in front of the camera,
      // only at the screen edges so they never sit on the text
      var NF = mobile ? 4 : 6, fgGeo = spriteGeo(NF, function (i) { return [0, 1, 2, 3][i % 4]; }), fgData = [];
      for (i = 0; i < NF; i++) fgData.push({ u: (i + Math.random() * 0.5) / NF, side: i % 2 ? 1 : -1, z: rnd(5.6, 6.8), s: rnd(1.3, 2.1), rot: rnd(-0.6, 0.6), bob: rnd(0, 6.28), edge: rnd(0.86, 1.04) });
      var fg = new T.InstancedMesh(fgGeo, new T.ShaderMaterial({ vertexShader: SPRITE_VS, fragmentShader: SPRITE_FS, transparent: true, depthWrite: false, depthTest: false,
        uniforms: { uMap: { value: atlas }, uTint: { value: new T.Color() }, uAlpha: { value: 0.72 } } }), NF);
      fg.frustumCulled = false; fg.renderOrder = 50; scene.add(fg);
      for (i = 0; i < NF; i++) fgGeo.attributes.aRot.array[i] = fgData[i].rot;

      // ink blooms between sections
      var NB = (o.blooms || []).length, stains = null;
      if (NB) {
        var bGeo = new T.PlaneGeometry(20, 12.5), bProg = new Float32Array(NB), bCol = new Float32Array(NB * 3), bSeed = new Float32Array(NB);
        var pal = ['#d8b46a', '#c35a7a', '#3f6fd0', '#8a5bb8', '#e08a6a'];
        for (i = 0; i < NB; i++) { var pe = PAL[o.blooms[i].id]; if (pe) tmpC.copy(pe[3]).lerp(pe[1], 0.35); else tmpC.set(pal[i % pal.length]); bCol[i * 3] = tmpC.r; bCol[i * 3 + 1] = tmpC.g; bCol[i * 3 + 2] = tmpC.b; bSeed[i] = Math.random(); }
        bGeo.setAttribute('aProg', new T.InstancedBufferAttribute(bProg, 1)); bGeo.setAttribute('aCol', new T.InstancedBufferAttribute(bCol, 3)); bGeo.setAttribute('aSeed', new T.InstancedBufferAttribute(bSeed, 1));
        var bMat = new T.ShaderMaterial({ vertexShader: BLOOMSTAIN_VS, fragmentShader: BLOOMSTAIN_FS, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uNoise: { value: noise } } });
        stains = new T.InstancedMesh(bGeo, bMat, NB); stains.frustumCulled = false; stains.renderOrder = -50; scene.add(stains);
        stains.userData = { prog: bGeo.attributes.aProg, tops: new Float32Array(NB), mat: bMat };
      }
      return { scene: scene, cam: cam, aurora: aurora, items: items, points: points, pMat: pMat, pGeo: pGeo, pPos: pPos, pU: pU, NP: NP, stains: stains, lamps: lamps, k: 0.01, len: 1,
        key: key, amb: amb, sheets: sheets, shadows: shadows, fg: fg, fgData: fgData, curView: curView, fog: FOG, sceneFog: scene.fog };
    }
    function measureSections() {
      var sy = window.scrollY || 0;
      secs = (o.sections || []).map(function (el) { var r = el.getBoundingClientRect(); return { name: el.id, top: r.top + sy, h: r.height }; });
    }
    function layoutWorld() {
      measureSections();
      var w = world; if (!w) return;
      w.cam.aspect = L.vw / L.vh; w.cam.updateProjectionMatrix();
      var tanH = Math.tan(T.MathUtils.degToRad(20)), visH = 2 * 10 * tanH, aspect = L.vw / L.vh;
      w.k = 0.4 * visH / L.vh; w.len = L.docH * w.k + visH;
      w.aurora.material.uniforms.uRes.value.set(L.vw, L.vh);
      w.items.forEach(function (it) {
        it.data.forEach(function (d, i) {
          d.y = 2 - d.u * w.len; d.x = d.fx * (10 - d.z) * tanH * aspect;
          if (it.flat) d.x *= 0.6; // brush strokes may cross the middle, far back
          dummy.position.set(d.x, d.y, d.z); dummy.rotation.set(d.rx, d.ry, d.rz); dummy.scale.setScalar(d.s); dummy.updateMatrix(); it.mesh.setMatrixAt(i, dummy.matrix);
        });
        it.mesh.instanceMatrix.needsUpdate = true;
      });
      dummy.scale.setScalar(1);
      for (var i = 0; i < w.NP; i++) w.pPos[i * 3 + 1] = 3 - w.pU[i] * w.len;
      w.pGeo.attributes.position.needsUpdate = true;
      if (w.stains) {
        var sy = window.scrollY || 0;
        o.blooms.forEach(function (el, b) {
          var top = el.getBoundingClientRect().top + sy; w.stains.userData.tops[b] = top;
          dummy.position.set(b % 2 ? 2.4 : -2.4, -top * w.k, -7); dummy.rotation.set(0, 0, (b % 3 - 1) * 0.3); dummy.updateMatrix(); w.stains.setMatrixAt(b, dummy.matrix);
        });
        w.stains.instanceMatrix.needsUpdate = true;
      }
    }
    /* ---------- cursor fluid trail ---------- */
    var trailClear = new T.Color(0.5, 0.5, 0);
    var trail = { a: null, b: null, w: 0, h: 0, lx: -1, ly: -1, speed: 0,
      mat: new T.ShaderMaterial({ vertexShader: FS_QUAD_VS, fragmentShader: TRAIL_FS, depthTest: false, depthWrite: false,
        uniforms: { tPrev: { value: null }, uPt: { value: new T.Vector2(0.5, 0.5) }, uVel: { value: new T.Vector2() }, uAsp: { value: 1 }, uR: { value: 0.1 }, uDecay: { value: 0.97 } } }) };
    function makeTrail() {
      var tw = mobile ? 96 : 160, th = Math.max(48, Math.round(tw * L.vh / Math.max(1, L.vw)));
      if (trail.a && trail.w === tw && trail.h === th) return;
      [trail.a, trail.b].forEach(function (r) { if (r) r.dispose(); });
      var opt = { depthBuffer: false, type: T.UnsignedByteType, minFilter: T.LinearFilter, magFilter: T.LinearFilter };
      trail.a = new T.WebGLRenderTarget(tw, th, opt); trail.b = new T.WebGLRenderTarget(tw, th, opt); trail.w = tw; trail.h = th;
      renderer.setClearColor(trailClear, 1);
      [trail.a, trail.b].forEach(function (r) { renderer.setRenderTarget(r); renderer.clear(); });
      renderer.setRenderTarget(null); renderer.setClearColor(0x0b0f1e, worldOff ? 0 : 1);
      if (world) world.aurora.material.uniforms.uTrail.value = trail.a.texture;
    }
    var ptr = { sx: 0, sy: 0, moved: false, lastPx: 0, lastPy: 0 };
    function stepTrail(dt, time) {
      if (!trail.a || dt <= 0) return;
      var u = trail.mat.uniforms, x, y, vx = 0, vy = 0;
      if (o.touch) {
        // touch: no cursor, so a slow "virtual hand" drifts around and stirs harder while you scroll
        x = 0.5 + 0.3 * Math.sin(time * 0.21) + ptr.sx * 0.15; y = 0.5 + 0.24 * Math.sin(time * 0.29 + 1.3) - ptr.sy * 0.15;
        var sv = Math.min(1, Math.abs(state.scroll - (trail.lsc || state.scroll)) / Math.max(dt, 0.001) / 2500); trail.lsc = state.scroll;
        if (trail.lx >= 0) { vx = (x - trail.lx) / dt * (0.6 + sv * 4); vy = (y - trail.ly) / dt * (0.6 + sv * 4); }
      } else {
        x = state.px * 0.5 + 0.5; y = 0.5 - state.py * 0.5;
        if (trail.lx >= 0) { vx = (x - trail.lx) / dt * 0.32; vy = (y - trail.ly) / dt * 0.32; }
      }
      var m = Math.sqrt(vx * vx + vy * vy); if (m > 1) { vx /= m; vy /= m; m = 1; }
      trail.speed += (m - trail.speed) * (1 - Math.exp(-dt * 6));
      trail.lx = x; trail.ly = y;
      u.tPrev.value = trail.a.texture; u.uPt.value.set(x, y); u.uVel.value.set(vx, vy); u.uAsp.value = L.vw / L.vh; u.uDecay.value = Math.pow(0.968, dt * 60);
      runPass(trail.mat, trail.b);
      var t = trail.a; trail.a = trail.b; trail.b = t;
      world.aurora.material.uniforms.uTrail.value = trail.a.texture;
    }

    /* ---------- palette per section (cross-fades over the last part of each section) ---------- */
    function updatePalette(dt) {
      var w = world, y = state.scroll + L.vh * 0.5, si = 0, i, c;
      for (i = 0; i < secs.length; i++) if (secs[i].top <= y) si = i;
      var a = secs[si], b = secs[Math.min(secs.length - 1, si + 1)], k = 0;
      if (a && b && b !== a) { var zone = Math.min(L.vh * 0.7, a.h * 0.6); k = smooth((y - (a.top + a.h - zone)) / zone); }
      var A = (a && PAL[a.name]) || PAL.home, B = (b && PAL[b.name]) || A;
      for (c = 0; c < 4; c++) palTgt[c].copy(A[c]).lerp(B[c], k);
      palTgt[4].copy(A[4]).lerp(B[4], k);
      var e = palInit ? 1 - Math.exp(-dt * 2.5) : 1; palInit = true;
      for (c = 0; c < 4; c++) palCur[c].lerp(palTgt[c], e);
      palCur[4].lerp(palTgt[4], e);
      palInfo.name = a ? a.name : 'home'; palInfo.next = b ? b.name : palInfo.name; palInfo.k = +k.toFixed(3);
      LIT.gold.copy(palCur[3]);
      LIT.key.copy(palCur[3]).multiplyScalar(1.15);
      LIT.fill.copy(palCur[1]).add(palCur[2]).multiplyScalar(0.9).add(palCur[0]).addScalar(0.05);
      LIT.rim.copy(palCur[1]).multiplyScalar(2.4).lerp(palCur[3], 0.3);
      LIT.cur.copy(palCur[3]).multiplyScalar(1.7);
      RIM.value.copy(LIT.rim);
      w.fog.copy(palCur[0]); w.sceneFog.color.copy(palCur[0]);
      w.key.color.copy(palCur[3]).lerp(tmpC.setRGB(1, 1, 1), 0.45);
      w.amb.color.copy(palCur[1]).add(palCur[2]).multiplyScalar(2.2).addScalar(0.12);
      w.lamps[0].color.copy(palCur[3]);
      w.fg.material.uniforms.uTint.value.copy(palCur[0]).multiplyScalar(0.7).add(tmpC.copy(palCur[3]).multiplyScalar(0.1));
    }

    var ray = new T.Vector3(), curW = new T.Vector3();
    function cursorAt(cam, z, out) { var t = (z - cam.position.z) / (ray.z || -1); return out.copy(cam.position).addScaledVector(ray, t); }
    function updateWorld(dt, time) {
      var w = world, p = clamp(state.scroll / Math.max(1, L.docH - L.vh), 0, 1), camY = -state.scroll * w.k;
      // eased pointer: mouse on desktop, device tilt on touch
      var e = 1 - Math.exp(-dt * 3.5); ptr.sx += (state.px - ptr.sx) * e; ptr.sy += (state.py - ptr.sy) * e;
      // camera travels down and dollies in/out so each section feels like a new place; mouse = parallax across all 4 layers
      w.cam.position.set(ptr.sx * 0.6, camY - ptr.sy * 0.32, 10 + Math.sin(p * Math.PI * 5) * 1.4);
      w.cam.lookAt(ptr.sx * 0.15, camY, 0);
      w.cam.rotation.z = Math.sin(p * Math.PI * 3) * 0.03;
      w.cam.updateMatrixWorld();
      updatePalette(dt);
      stepTrail(dt, time);
      var au = w.aurora.material.uniforms;
      au.uTime.value = time; au.uScroll.value = p * 3.0; au.uPar.value.set(ptr.sx, -ptr.sy);
      w.pMat.uniforms.uTime.value = time;
      // the cursor ray: the warm lamp sits where you point, objects near it get pushed and spun
      ray.set(o.touch ? ptr.sx : state.px, o.touch ? -ptr.sy : -state.py, 0.5).unproject(w.cam).sub(w.cam.position).normalize();
      cursorAt(w.cam, 1.2, curW); w.lamps[0].position.copy(curW);
      w.curView.copy(curW).applyMatrix4(w.cam.matrixWorldInverse);
      w.lamps[1].position.set(Math.cos(time * 0.25) * -6, camY + Math.sin(time * 0.35) * 3, 0);
      var push = o.touch ? 0.25 : 0.35 + Math.min(1, trail.speed * 1.6), R = 2.3, dd = Math.exp(-dt * 2.4), sd = Math.exp(-dt * 1.6);
      for (var j = 0; j < w.items.length; j++) {
        var it = w.items[j], mesh = it.mesh, data = it.data, n = mesh.count, dirty = false, sh = it.shadow, shRot = sh ? sh.geometry.attributes.aRot.array : null;
        for (var q = 0; q < n; q++) {
          var d = data[q]; if (Math.abs(d.y - camY) > 10) continue;
          var t = time * d.sp;
          if (!it.flat) {
            cursorAt(w.cam, d.z, curW);
            var dx = d.x + d.ox - curW.x, dy = d.y + d.oy - curW.y, r = Math.sqrt(dx * dx + dy * dy) + 1e-3;
            if (r < R) { var f = 1 - r / R; f = f * f * push; d.vx += dx / r * f * 16 * dt; d.vy += dy / r * f * 16 * dt; d.sv += f * (dx > 0 ? 1 : -1) * 22 * dt; }
            d.vx = (d.vx - d.ox * 2.0 * dt) * dd; d.vy = (d.vy - d.oy * 2.0 * dt) * dd; d.ox += d.vx * dt; d.oy += d.vy * dt;
            d.sv *= sd; d.spin += d.sv * dt;
          }
          dummy.position.set(d.x + d.ox + Math.sin(time * 0.25 + d.bob) * 0.18, d.y + d.oy + Math.sin(time * 0.4 + d.bob) * 0.22, d.z);
          if (it.flat) dummy.rotation.set(0, 0, d.rz * 0.2 + Math.sin(time * 0.1 + d.bob) * 0.08); else dummy.rotation.set(d.rx + t * 0.6 + d.spin, d.ry + t + d.spin * 0.6, d.rz + t * 0.4);
          dummy.scale.setScalar(d.s); dummy.updateMatrix(); mesh.setMatrixAt(q, dummy.matrix); dirty = true;
          if (sh) {
            // soft shadow: behind and below the sheet, narrower when the sheet turns edge-on
            var face = Math.abs(dummy.matrix.elements[10]) / d.s;
            dummy.position.x += 0.2 * d.s; dummy.position.y -= 0.3 * d.s; dummy.position.z -= 0.5;
            var fs = 0.1 + 0.9 * face; dummy.rotation.set(0, 0, 0); dummy.scale.set(d.s * 1.12 * fs, d.s * 1.18 * (0.4 + 0.6 * face), 1); dummy.updateMatrix(); sh.setMatrixAt(q, dummy.matrix);
            shRot[q] = d.rz + t * 0.4;
          }
        }
        if (dirty) { mesh.instanceMatrix.needsUpdate = true; if (sh) { sh.count = n; sh.instanceMatrix.needsUpdate = true; sh.geometry.attributes.aRot.needsUpdate = true; } }
      }
      // foreground out-of-focus layer: closest to the camera, so it slides fastest; extra mouse parallax
      if (w.fg.visible) {
        var tanH = Math.tan(T.MathUtils.degToRad(20)), asp = L.vw / L.vh;
        for (q = 0; q < w.fgData.length; q++) {
          // they loop around the camera and slide ~3.5x faster than the mid layer as you scroll
          var g = w.fgData[q], dz = w.cam.position.z - g.z, span = 9, rel = ((g.u * span + state.scroll * w.k * 0.9) % span + span) % span - span / 2;
          dummy.position.set(w.cam.position.x * 0.4 + g.side * dz * tanH * asp * g.edge - ptr.sx * 0.35, camY + rel + Math.sin(time * 0.2 + g.bob) * 0.15 + ptr.sy * 0.2, g.z);
          dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(g.s); dummy.updateMatrix(); w.fg.setMatrixAt(q, dummy.matrix);
        }
        w.fg.instanceMatrix.needsUpdate = true;
      }
      dummy.scale.setScalar(1);
      if (w.stains && w.stains.visible) {
        var sdat = w.stains.userData, arr = sdat.prog.array, mid = state.scroll + L.vh * 0.5;
        for (var b = 0; b < arr.length; b++) arr[b] = clamp((mid + L.vh * 0.5 - sdat.tops[b]) / (L.vh * 1.15), 0, 1);
        sdat.prog.needsUpdate = true; sdat.mat.uniforms.uTime.value = time;
      }
    }

    /* ======================= THE BOOK ======================= */
    var envTex = null, pmrem = null;
    function makeEnv() {
      var c = canvas(512, 256), g = c.getContext('2d');
      var sky = g.createLinearGradient(0, 0, 0, 256); sky.addColorStop(0, '#2b2a3e'); sky.addColorStop(0.5, '#141826'); sky.addColorStop(1, '#07080d');
      g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
      function soft(x, y, w, h, col) { var r = g.createRadialGradient(x, y, 0, x, y, Math.max(w, h)); r.addColorStop(0, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(x - w * 2, y - h * 2, w * 4, h * 4); }
      soft(150, 70, 70, 34, 'rgba(255,240,215,1)');   // studio softbox (key)
      soft(380, 90, 40, 26, 'rgba(255,200,150,0.8)'); // warm fill
      soft(256, 18, 120, 14, 'rgba(255,255,255,0.7)'); // overhead strip
      soft(470, 140, 30, 50, 'rgba(170,140,230,0.6)'); // plum rim
      var t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping; t.colorSpace = T.SRGBColorSpace;
      pmrem = new T.PMREMGenerator(renderer);
      envTex = pmrem.fromEquirectangular(t).texture; t.dispose();
    }
    function roundedShape(W, H, r) {
      var x0 = -0.012, x1 = W, s = new T.Shape();
      s.moveTo(x0, -H / 2); s.lineTo(x1 - r, -H / 2); s.quadraticCurveTo(x1, -H / 2, x1, -H / 2 + r); s.lineTo(x1, H / 2 - r); s.quadraticCurveTo(x1, H / 2, x1 - r, H / 2); s.lineTo(x0, H / 2); s.lineTo(x0, -H / 2);
      return { shape: s, x0: x0, x1: x1 };
    }
    function remapUV(geo, x0, x1, H) { var p = geo.attributes.position, uv = geo.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x0) / (x1 - x0), (p.getY(i) + H / 2) / H); uv.needsUpdate = true; }
    function titleText(g, text, cx, y, size, mask) {
      g.save(); g.font = '600 ' + size + 'px Fraunces'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      if ('letterSpacing' in g) g.letterSpacing = (size * 0.06) + 'px';
      if (!mask) { g.fillStyle = 'rgba(20,10,4,0.55)'; g.fillText(text, cx + 2, y + 3); var gd = g.createLinearGradient(0, y - size, 0, y); gd.addColorStop(0, '#fbe7b2'); gd.addColorStop(0.5, '#d8b46a'); gd.addColorStop(1, '#a87a35'); g.fillStyle = gd; }
      else g.fillStyle = '#fff';
      g.fillText(text, cx, y); g.restore();
    }
    // cover art + material maps: map (colour), orm (G = roughness, B = metalness for the foil)
    function makeCover(art, back) {
      var W = 540, H = 712, c = canvas(W, H), g = c.getContext('2d'), m = canvas(W, H), mg = m.getContext('2d');
      mg.fillStyle = 'rgb(0,150,0)'; mg.fillRect(0, 0, W, H); // roughness ~0.6, metal 0
      function foil(fn) { fn(g, false); mg.save(); mg.fillStyle = 'rgb(0,55,255)'; mg.strokeStyle = 'rgb(0,55,255)'; fn(mg, true); mg.restore(); }
      if (!back) {
        drawCover(g, art, 0, 0, W, H, 0.5, 0.45);
        var top = g.createLinearGradient(0, 0, 0, H * 0.42); top.addColorStop(0, 'rgba(14,10,8,0.82)'); top.addColorStop(1, 'rgba(14,10,8,0)'); g.fillStyle = top; g.fillRect(0, 0, W, H * 0.42);
        var bot = g.createLinearGradient(0, H * 0.8, 0, H); bot.addColorStop(0, 'rgba(14,10,8,0)'); bot.addColorStop(1, 'rgba(14,10,8,0.7)'); g.fillStyle = bot; g.fillRect(0, H * 0.8, W, H * 0.2);
        foil(function (x, mask) { x.strokeStyle = mask ? x.strokeStyle : '#d8b46a'; x.lineWidth = 2; x.strokeRect(26, 26, W - 52, H - 52); });
        foil(function (x, mask) { titleText(x, 'WALEED', W / 2, 118, 70, mask); titleText(x, 'MALIK', W / 2, 196, 70, mask); });
        foil(function (x, mask) { x.fillStyle = mask ? x.fillStyle : '#d8b46a'; x.fillRect(W / 2 - 46, 224, 92, 2); });
        g.fillStyle = '#f5f1e8'; g.font = '700 15px Manrope'; g.textAlign = 'center'; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('A STORYBOOK PORTFOLIO', W / 2 + 3, 258);
        foil(function (x, mask) { x.font = 'italic 400 17px Fraunces'; x.textAlign = 'center'; if ('letterSpacing' in x) x.letterSpacing = '1px'; x.fillStyle = mask ? x.fillStyle : '#e8cf93'; x.fillText('Picture books · Comics · Characters · Covers', W / 2, H - 46); });
      } else {
        g.fillStyle = '#121a33'; g.fillRect(0, 0, W, H);
        g.save(); g.globalAlpha = 0.18; g.translate(W, 0); g.scale(-1, 1); drawCover(g, art, 0, 0, W, H, 0.5, 0.5); g.restore();
        foil(function (x, mask) { x.strokeStyle = mask ? x.strokeStyle : '#d8b46a'; x.lineWidth = 2; x.strokeRect(26, 26, W - 52, H - 52); });
        g.textAlign = 'center'; g.fillStyle = '#f5f1e8'; g.font = 'italic 400 30px Fraunces';
        g.fillText('Eight disciplines,', W / 2, 150); g.fillText('one illustrator.', W / 2, 188);
        g.fillStyle = '#c9c1b2'; g.font = '600 17px Manrope';
        ["Children's Book Illustration", 'Comics', 'Character Design', 'Book Cover Design', 'Map Illustration', 'Line Art & Sketch', 'Ink & Watercolor', 'Vehicle Wraps & Decals'].forEach(function (s, i) { g.fillText(s, W / 2, 262 + i * 32); });
        foil(function (x, mask) { titleText(x, 'WALEED MALIK', W / 2, H - 84, 30, mask); });
      }
      return { map: canvasTex(c), orm: canvasTex(m, false) };
    }
    // small cover for a service-card book: the category's artwork, a gold foil frame and the category name
    function miniCover(art, label) {
      var W = 300, H = 396, c = canvas(W, H), g = c.getContext('2d'), m = canvas(W, H), mg = m.getContext('2d');
      mg.fillStyle = 'rgb(0,150,0)'; mg.fillRect(0, 0, W, H);
      function foil(fn) { fn(g, false); mg.save(); mg.fillStyle = 'rgb(0,55,255)'; mg.strokeStyle = 'rgb(0,55,255)'; fn(mg, true); mg.restore(); }
      drawCover(g, art, 0, 0, W, H, 0.5, 0.42);
      var bot = g.createLinearGradient(0, H * 0.62, 0, H); bot.addColorStop(0, 'rgba(14,10,8,0)'); bot.addColorStop(1, 'rgba(14,10,8,0.86)'); g.fillStyle = bot; g.fillRect(0, H * 0.62, W, H * 0.38);
      foil(function (x, mask) { x.strokeStyle = mask ? x.strokeStyle : '#d8b46a'; x.lineWidth = 1.5; x.strokeRect(14, 14, W - 28, H - 28); });
      foil(function (x, mask) { x.font = '600 22px Fraunces'; x.textAlign = 'center'; x.fillStyle = mask ? x.fillStyle : '#ecd08f'; x.fillText(label, W / 2, H - 36); });
      return { map: canvasTex(c), orm: canvasTex(m, false) };
    }
    function spineTexture() {
      var c = canvas(256, 1024), g = c.getContext('2d');
      g.fillStyle = '#5a1f17'; g.fillRect(0, 0, 256, 1024);
      var sh = g.createLinearGradient(0, 0, 256, 0); sh.addColorStop(0, 'rgba(0,0,0,0.45)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sh.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 1024);
      g.fillStyle = '#d8b46a'; g.fillRect(70, 70, 116, 3); g.fillRect(70, 951, 116, 3);
      g.save(); g.translate(128, 512); g.rotate(Math.PI / 2); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#e8c98a'; g.font = '600 50px Fraunces'; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('WALEED MALIK', -70, 0);
      g.font = '700 18px Manrope'; if ('letterSpacing' in g) g.letterSpacing = '4px'; g.fillStyle = '#f5f1e8'; g.fillText('PORTFOLIO', 250, 2);
      g.restore();
      return canvasTex(c);
    }
    function stripeTex(vertical) {
      var c = canvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#efe5cf'; g.fillRect(0, 0, 64, 64);
      for (var i = 0; i < 64; i += 2) { g.fillStyle = i % 4 ? 'rgba(140,110,70,0.14)' : 'rgba(140,110,70,0.26)'; if (vertical) g.fillRect(i, 0, 1, 64); else g.fillRect(0, i, 64, 1); }
      var t = canvasTex(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (vertical) t.repeat.set(4, 1); else t.repeat.set(1, 4); return t;
    }
    function headbandTex() { var c = canvas(64, 16), g = c.getContext('2d'); for (var i = 0; i < 64; i += 8) { g.fillStyle = (i / 8) % 2 ? '#efe2c4' : '#a8322e'; g.fillRect(i, 0, 8, 16); } var t = canvasTex(c); t.wrapS = T.RepeatWrapping; t.repeat.set(4, 1); return t; }

    var SW = 1024, SH = 676, META = o.artMeta || {}, CATNAME = o.catName || {};
    function makeSpread(id, art, idx, sc) {
      sc = sc || 1;   // 0.5 = small spread for the service-card books (drawn directly at 512 px)
      var c = canvas(Math.round(SW * sc), Math.round(SH * sc)), g = c.getContext('2d'); if (sc !== 1) g.scale(sc, sc); paper(g, SW, SH);
      var meta = META[id] || {};
      // every spread: LEFT page = category, title and a short story caption; RIGHT page = the illustration on a mat
      g.textAlign = 'center'; g.fillStyle = '#9b7a3e'; g.font = '700 14px Manrope'; if ('letterSpacing' in g) g.letterSpacing = '4px';
      g.fillText(String(CATNAME[meta.cat] || '').toUpperCase(), 256, 170); if ('letterSpacing' in g) g.letterSpacing = '0px';
      g.fillStyle = '#c8a564'; g.fillRect(226, 192, 60, 1.5);
      g.fillStyle = '#231c13'; g.font = '400 38px Fraunces'; var tl = wrapText(g, meta.title || '', 256, 252, 390, 46);
      g.fillStyle = '#5e4e36'; g.font = 'italic 400 23px Fraunces'; wrapText(g, meta.story || meta.brief || '', 256, 252 + tl * 46 + 38, 384, 32);
      g.fillStyle = '#c8a564'; g.font = '400 22px Fraunces'; g.fillText('\u2766', 256, 566);
      g.fillStyle = '#9c8a6c'; g.font = '600 13px Manrope'; if ('letterSpacing' in g) g.letterSpacing = '3px'; g.fillText('PLATE ' + (idx + 1), 256, 612); if ('letterSpacing' in g) g.letterSpacing = '0px';
      // wide pictures are trimmed to a softer landscape around their focus point (meta.fx), so they stay large on the page
      var sx = 0, sw = art.width, ar = art.width / art.height;
      if (meta.fx !== undefined && ar > 1.3) { sw = art.height * 1.3; sx = clamp(art.width * meta.fx - sw / 2, 0, art.width - sw); }
      var box = containRect(sw, art.height, 420, 560), x = 512 + (512 - box.w) / 2, y = (SH - box.h) / 2;
      g.save(); g.shadowColor = 'rgba(60,40,15,0.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = '#fbf7ee'; g.fillRect(x - 10, y - 10, box.w + 20, box.h + 20); g.restore();
      g.drawImage(art, sx, 0, sw, art.height, x, y, box.w, box.h);
      var gr = g.createLinearGradient(470, 0, 554, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(40,25,10,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(470, 0, 84, SH);
      return canvasTex(c);
    }

    var bookShared = null;
    function buildBookShared(arts, pages, leaves) {
      makeEnv();
      var W = 1, H = 1.32, BW = W + 0.03, BH = H + 0.05, B = 0.032;
      var sh = roundedShape(BW, BH, 0.05);
      var boardGeo = new T.ExtrudeGeometry(sh.shape, { depth: B, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 12 });
      var skinGeo = new T.ShapeGeometry(sh.shape, 12); remapUV(skinGeo, sh.x0, sh.x1, BH);
      var front = makeCover(arts.cover, false), back = makeCover(arts.cover, true);
      var sweep = { value: -0.6 };
      function laminated(t, foil) {
        var m = new T.MeshPhysicalMaterial({ map: t.map, roughnessMap: t.orm, metalnessMap: t.orm, roughness: 1, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.07, envMap: envTex, envMapIntensity: 1.15 });
        m.onBeforeCompile = function (s) {
          s.uniforms.uSweep = sweep;
          s.fragmentShader = 'uniform float uSweep;\n' + s.fragmentShader.replace('#include <dithering_fragment>',
            '#include <dithering_fragment>\n float sb = smoothstep(0.14, 0.0, abs(vMapUv.x * 0.8 + vMapUv.y * 0.45 - uSweep));\n gl_FragColor.rgb += sb * 0.16 * vec3(1.0, 0.96, 0.9)' + (foil ? ' + sb * metalnessFactor * 0.55 * vec3(1.0, 0.82, 0.48)' : '') + ';');
        };
        return m;
      }
      var frontMat = laminated(front, true), backMat = laminated(back, false);
      var cloth = new T.MeshStandardMaterial({ color: 0x5a1f17, roughness: 0.85, envMap: envTex, envMapIntensity: 0.4 });
      var endpaper = new T.MeshStandardMaterial({ color: 0x8c3a24, roughness: 0.9 });
      var foreMat = new T.MeshStandardMaterial({ map: stripeTex(true), roughness: 0.95 }), topMat = new T.MeshStandardMaterial({ map: stripeTex(false), roughness: 0.95 }), cream = new T.MeshStandardMaterial({ color: 0xece0c4, roughness: 0.95 });
      var spineMat = new T.MeshPhysicalMaterial({ map: spineTexture(), roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.2, envMap: envTex, envMapIntensity: 0.8, side: T.DoubleSide });
      var hbMat = new T.MeshStandardMaterial({ map: headbandTex(), roughness: 0.7 });
      // only the first two spreads are painted at start-up; the rest arrive later (fillSpreads)
      var blankC = canvas(64, 64), bg = blankC.getContext('2d'); paper(bg, 64, 64); var blank = canvasTex(blankC);
      var spreads = pages.map(function (id, k) { return { value: k < 2 && arts[id] ? makeSpread(id, arts[id], k) : blank, done: k < 2 && !!arts[id] }; });
      var rc = canvas(32, 128), rg = rc.getContext('2d'); rg.fillStyle = '#fff'; rg.beginPath(); rg.moveTo(0, 0); rg.lineTo(32, 0); rg.lineTo(32, 128); rg.lineTo(16, 112); rg.lineTo(0, 128); rg.closePath(); rg.fill();
      var ribbonMat = new T.MeshStandardMaterial({ color: 0x9a1f2c, roughness: 0.38, metalness: 0.05, envMap: envTex, envMapIntensity: 0.9, side: T.DoubleSide, alphaMap: canvasTex(rc, false), alphaTest: 0.5 });
      var tc = canvas(128, 8), tg = tc.getContext('2d'), tgr = tg.createLinearGradient(0, 0, 128, 0);
      tgr.addColorStop(0, 'rgba(0,0,0,0.9)'); tgr.addColorStop(0.55, 'rgba(0,0,0,0.45)'); tgr.addColorStop(1, 'rgba(0,0,0,0)'); tg.fillStyle = tgr; tg.fillRect(0, 0, 128, 8);
      var turnShTex = canvasTex(tc, false);
      return { laminated: laminated, blankTex: blank, coatMats: [frontMat, backMat, spineMat], ribbonMat: ribbonMat, turnShTex: turnShTex, W: W, H: H, BW: BW, BH: BH, B: B, boardGeo: boardGeo, skinGeo: skinGeo, frontMat: frontMat, backMat: backMat, cloth: cloth, endpaper: endpaper,
        blockMats: [foreMat, cream, topMat, topMat, cream, cream], spineMat: spineMat, hbMat: hbMat, spreads: spreads, sweep: sweep, pages: pages, leaves: leaves };
    }

    function buildBook(S, withPages) {
      var n = withPages ? S.leaves : 0, W = S.W, H = S.H, B = S.B, TH = 0.09, EPS = 0.0035;
      var zc = 0, zp = zc - (n + 2) * EPS;
      var outer = new T.Group(), spinG = new T.Group(), root = new T.Group(); outer.add(spinG); spinG.add(root);
      var pageGeo = new T.PlaneGeometry(W, H, mobile || S.mini ? 12 : 24, 1); pageGeo.translate(W / 2, 0, 0);
      var RIGHT = new T.Vector4(0.5, 0, 0.5, 1), LEFT = new T.Vector4(0, 0, 0.5, 1);
      function pageMat(fr, frr, bk, bkr, bend) {
        return new T.ShaderMaterial({ vertexShader: PAGE_VS, fragmentShader: PAGE_FS, side: T.DoubleSide,
          uniforms: { uTurn: { value: 0 }, uBend: { value: bend }, uW: { value: W }, uFront: fr, uBack: bk, uFR: { value: frr }, uBR: { value: bkr }, uLight: { value: LIGHT }, uLift: { value: 0 } } });
      }
      var sp = S.spreads;
      // back board (cloth) + back skin facing -z
      var back = new T.Mesh(S.boardGeo, [S.endpaper, S.cloth]); back.position.z = zp - TH / 2 - B - 0.008; root.add(back);
      var backSkin = new T.Mesh(S.skinGeo, S.backMat); backSkin.rotation.y = Math.PI; backSkin.position.set(S.BW - 0.012, 0, back.position.z - 0.0065); root.add(backSkin);
      var blockGeo = new T.BoxGeometry(W - 0.012, H - 0.02, TH / 2);
      var rBlock = new T.Mesh(blockGeo, S.blockMats); rBlock.position.set(W / 2, 0, zp - TH / 4); root.add(rBlock);
      var hasPages = withPages && sp.length > 0;
      var base = hasPages ? new T.Mesh(pageGeo, pageMat(sp[n], RIGHT, sp[n], LEFT, 0)) : null; if (base) { base.position.z = zp + EPS * 0.5; root.add(base); }
      // hinged front cover
      var coverG = new T.Group(); coverG.position.z = zc; root.add(coverG);
      var board = new T.Mesh(S.boardGeo, [S.endpaper, S.cloth]); board.position.z = TH / 2 + EPS + 0.008; coverG.add(board);
      var skin = new T.Mesh(S.skinGeo, S.frontMat); skin.position.z = board.position.z + B + 0.0065; coverG.add(skin);
      var lBlock = new T.Mesh(blockGeo, S.blockMats); lBlock.position.set(W / 2, 0, TH / 4 + EPS); coverG.add(lBlock);
      var leaf0 = hasPages ? new T.Mesh(pageGeo, pageMat(sp[0], RIGHT, sp[0], LEFT, 0)) : null; if (leaf0) coverG.add(leaf0);
      // rounded spine: half cylinder bulging out at -x, title printed on it; headbands
      var zTop = skin.position.z + 0.004, zBot = backSkin.position.z - 0.004, R = (zTop - zBot) / 2;
      var spineG = new T.Group(); root.add(spineG);
      var spine = new T.Mesh(new T.CylinderGeometry(R, R, S.BH, S.mini ? 14 : 28, 1, true, Math.PI, Math.PI), S.spineMat); spineG.add(spine);
      var hbGeo = new T.CylinderGeometry(0.012, 0.012, TH * 0.95, 10); hbGeo.rotateX(Math.PI / 2);
      var hb1 = new T.Mesh(hbGeo, S.hbMat); hb1.position.set(0.006, H / 2 - 0.006, 0); spineG.add(hb1);
      var hb2 = new T.Mesh(hbGeo, S.hbMat); hb2.position.set(0.006, -H / 2 + 0.006, 0); spineG.add(hb2);
      var spineMid = (zTop + zBot) / 2, spineOpen = zp - TH / 2;
      var leaves = [];
      for (var i = 1; i <= n; i++) {
        var m = new T.Mesh(pageGeo, pageMat(sp[i - 1], RIGHT, sp[i], LEFT, -1.0));
        m.userData.zr = zp + (n - i + 1) * EPS; m.userData.zl = zc + i * EPS; m.position.z = m.userData.zr; root.add(m); leaves.push(m);
      }
      // satin ribbon bookmark hanging out of the bottom of the page block (V-cut end)
      var ribGeo = new T.PlaneGeometry(0.05, 0.62, 1, 18), rp = ribGeo.attributes.position;
      for (var ri = 0; ri < rp.count; ri++) { var ry = rp.getY(ri), hang = clamp((0.05 - ry) / 0.36, 0, 1); rp.setZ(ri, hang * hang * 0.09); rp.setX(ri, rp.getX(ri) + hang * hang * 0.03); }
      ribGeo.computeVertexNormals();
      var ribbon = new T.Mesh(ribGeo, S.ribbonMat); ribbon.position.set(W * 0.64, -H / 2 + 0.06, zp + EPS * 0.2); root.add(ribbon);
      // shadow a turning page casts on the page beneath it
      var tsGeo = new T.PlaneGeometry(W, H); tsGeo.translate(W / 2, 0, 0);
      var turnSh = new T.Mesh(tsGeo, new T.MeshBasicMaterial({ map: S.turnShTex, color: 0x000000, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
      turnSh.visible = false; if (n) root.add(turnSh);
      // soft contact shadow under the book (stays on the floor while the book turns)
      var shTex = shadowTexture();
      var shadow = new T.Mesh(new T.PlaneGeometry(2.8, 1.1), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.55 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.24; if (!S.mini) outer.add(shadow);
      var contact = new T.Mesh(shadow.geometry, new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.8 })); contact.rotation.x = -Math.PI / 2; contact.scale.set(0.45, 0.4, 1); contact.position.y = -H / 2 - 0.22; outer.add(contact);
      root.position.z = -(zTop + zBot) / 2;
      return { outer: outer, spinG: spinG, root: root, coverG: coverG, spineG: spineG, spineMid: spineMid, spineOpen: spineOpen, leaves: leaves, base: base, leaf0: leaf0, n: n,
        ribbon: ribbon, turnSh: turnSh, EPS: EPS, cov: { a: 0, v: 0 }, openScale: 1, spinMode: 'sway',
        W: W, zOff: -(zTop + zBot) / 2, shadow: shadow, contact: contact, cur: 0, target: 0, res: { wrapped: 0, page: 0 }, spin: Math.random() * 6, rx: 0, ry: 0, intro: 0, lastPage: -1 };
    }
    var shadowTexCache = null;
    function shadowTexture() {
      if (shadowTexCache) return shadowTexCache;
      var c = canvas(128, 128), g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, 'rgba(0,0,0,0.95)'); r.addColorStop(0.4, 'rgba(0,0,0,0.5)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
      shadowTexCache = new T.CanvasTexture(c); return shadowTexCache;
    }
    // animate one book instance; book.target = 0 (closed) … n+1 (last spread)
    // spring toward a target angle: slight overshoot, then settles (feels like real paper / a real hinge)
    function spring(st, tgt, dt, k, z) {
      var h = Math.min(dt, 1 / 30), steps = Math.ceil(dt / h - 1e-6);
      for (var i = 0; i < steps; i++) { var acc = (tgt - st.a) * k - st.v * z; st.v += acc * h; st.a += st.v * h; }
      if (Math.abs(tgt - st.a) < 1e-4 && Math.abs(st.v) < 1e-3) { st.a = tgt; st.v = 0; }
      return st.a;
    }
    // animate one book instance; book.target = 0 (closed) … n+1 (last spread)
    function animateBook(bk, dt, time, idleSpin) {
      bk.cur += (bk.target - bk.cur) * (1 - Math.exp(-dt * 3.6));
      if (Math.abs(bk.target - bk.cur) < 0.0005) bk.cur = bk.target;
      var t = bk.cur;
      bk.intro = Math.min(1, bk.intro + dt * 0.6);
      var iK = easeOut(bk.intro);
      var openK = smooth(t / 0.35);                         // how much it faces the viewer
      var wSpin = idleSpin ? 1 - openK : 0;
      if (wSpin > 0.01) bk.spin += dt * 0.35;
      var wrapped = bk.spin - Math.PI * 2 * Math.round(bk.spin / (Math.PI * 2));
      if (bk.spinMode === 'turn') bk.spinG.rotation.y = bk.spin * 0.55;   // contact book: a slow full turn, front and back
      else bk.spinG.rotation.y = Math.sin(wrapped) * 1.15 * wSpin;           // hero: ease-in-out sway, front → spine → front
      // cover on a sprung hinge (ζ≈0.7: a few % overshoot when it lands)
      var cA = spring(bk.cov, ease(clamp((t - 0.15) / 0.75, 0, 1)) * Math.PI, dt, 55, 10.4);
      var coverK = clamp(cA / Math.PI, 0, 1);
      bk.coverG.rotation.y = -cA;
      var half = clamp(cA, 0, Math.PI) / 2; bk.spineG.rotation.y = -half;
      bk.spineG.position.set(0, 0, mix(bk.spineMid, bk.spineOpen, Math.sin(half)));
      var topLeft = coverK >= 0.999 ? 0 : -1, topRight = -1, lift = null, liftS = 0;
      for (var i = 0; i < bk.leaves.length; i++) {
        var lf = bk.leaves[i], ud = lf.userData, tgtA = ease(clamp((t - (i + 1) - 0.1) / 0.8, 0, 1)) * Math.PI;
        if (!ud.st) ud.st = { a: tgtA, v: 0 };
        var a = spring(ud.st, tgtA, dt, 60, 10.8), k = a / Math.PI;
        ud.k = k; lf.material.uniforms.uTurn.value = a;
        // a fast flip bends the paper more; a lifted page catches the light
        lf.material.uniforms.uBend.value = -1.0 - Math.min(0.7, Math.abs(ud.st.v) * 0.09);
        var sA = Math.sin(clamp(a, 0, Math.PI)); lf.material.uniforms.uLift.value = sA;
        lf.position.z = mix(ud.zr, ud.zl, smooth(clamp(k, 0, 1) * 1.4 - 0.2));
        if (k >= 0.999) topLeft = i + 1; else if (k <= 0.001 && topRight < 0) topRight = i + 1;
        if (k > 0.001 && k < 0.999 && sA > liftS) { liftS = sA; lift = lf; }
      }
      var closed = coverK <= 0.001;
      for (var j = 0; j < bk.leaves.length; j++) { var kk = bk.leaves[j].userData.k; bk.leaves[j].visible = !closed && ((kk > 0.001 && kk < 0.999) || j + 1 === topLeft || j + 1 === topRight); }
      if (bk.leaf0) bk.leaf0.visible = !closed && topLeft <= 0;
      if (bk.base) bk.base.visible = !closed && topRight < 0;
      // soft shadow of the turning page on the page underneath (right half while it lifts, left half as it lands)
      var ts = bk.turnSh;
      if (lift && !closed) {
        var la = lift.userData.st.a, right = la < Math.PI / 2;
        ts.visible = true; ts.rotation.y = right ? 0 : Math.PI;
        ts.scale.x = Math.max(0.06, Math.abs(Math.cos(la)) * 1.08);
        ts.position.z = (right ? lift.userData.zr : lift.userData.zl) - bk.EPS * 0.5;
        ts.material.opacity = 0.42 * liftS;
      } else ts.visible = false;
      bk.root.position.x = mix(-bk.W / 2, 0, coverK);
      bk.root.position.z = bk.zOff * (1 - coverK);
      var pxv = bk.ptr ? bk.ptr.x : state.px, pyv = bk.ptr ? bk.ptr.y : state.py;   // service books tilt toward the cursor inside their card
      bk.rx += (pyv * (bk.ptr ? 0.35 : 0.1) - bk.rx) * (1 - Math.exp(-dt * 4));
      bk.ry += (pxv * (bk.ptr ? 0.5 : 0.18) - bk.ry) * (1 - Math.exp(-dt * 4));
      bk.outer.rotation.x = mix(-0.06, -0.48, coverK) + bk.rx + Math.sin(time * 0.55) * 0.012;
      bk.outer.rotation.y = mix(-0.22, -0.03, openK) * (1 - wSpin * 0.6) + bk.ry;
      bk.outer.rotation.z = mix(0.035, 0.0, openK);
      bk.outer.position.y = Math.sin(time * 0.7) * 0.035 - (1 - iK) * 1.2;
      bk.outer.scale.setScalar((0.75 + 0.25 * iK) * mix(1, bk.openScale, coverK));   // big when closed, fits the column when open
      bk.ribbon.rotation.x = Math.sin(time * 0.9 + 1.3) * 0.06 * (1 - coverK * 0.5);
      bk.shadow.scale.x = mix(0.55, 1, coverK); bk.shadow.material.opacity = 0.55 * iK; bk.contact.material.opacity = 0.8 * iK * (1 - coverK * 0.4);
      bk.res.wrapped = wrapped; bk.res.page = Math.round(t); return bk.res;
    }

    var books = []; // { bk, scene, cam, m(section), stage, idle, onPage }
    function bookScene() {
      var scene = new T.Scene(); scene.environment = envTex;
      scene.add(new T.AmbientLight(0x8a90b0, 0.35));
      var key = new T.DirectionalLight(0xfff0dc, 2.2); key.position.set(-2.2, 3, 4); scene.add(key);
      var rim = new T.DirectionalLight(0xc9a6ff, 2.3); rim.position.set(2.8, 1.4, -3); scene.add(rim);
      var rim2 = new T.DirectionalLight(0xffc98a, 1.5); rim2.position.set(-3.2, 0.8, -2.6); scene.add(rim2);   // warm edge light on the spine side
      var warm = new T.PointLight(0xffb36b, 1.4, 6); warm.position.set(1.8, -0.6, 1.8); scene.add(warm);
      var cam = new T.PerspectiveCamera(30, 1, 0.1, 60);
      return { scene: scene, cam: cam, key: key };
    }
    function measureStage(b) {
      var sy = window.scrollY || 0, sec = b.section, sr = sec.getBoundingClientRect(), sticky = sec.querySelector('[data-sticky]');
      var base = sticky ? sticky.getBoundingClientRect() : sr, ar = b.stage.getBoundingClientRect();
      var stuck = sticky && getComputedStyle(sticky).position === 'sticky';
      b.m = { top: sr.top + sy, h: sr.height, sticky: stuck, ax: ar.left + ar.width / 2, ay: ar.top - base.top + ar.height / 2, aw: ar.width, ah: ar.height };
      var tanH = Math.tan(T.MathUtils.degToRad(b.cam.fov / 2));
      var ppu;
      if (b.mini) {
        // service-card book: fits its card's picture area; opens to a spread that still fits the card
        ppu = Math.min(b.m.aw * 0.52 / 1.15, b.m.ah * 0.6 / 1.42);
        b.bk.openScale = Math.min(1, (b.m.aw * 0.8 / 2.2) / ppu);
      } else if (b.open) {
        // hero: the closed book is ~1.5x bigger than before; when it opens it scales down to fit its column
        ppu = Math.min(b.m.aw * 0.9 / 1.15, b.m.ah * 0.9 / 1.42, L.vh * 0.62 / 1.42);
        var ppuOpen = Math.min(b.m.aw * 1.04 / 2.2, L.vh * 0.6 / 1.42);
        b.bk.openScale = Math.min(1, ppuOpen / ppu);
      } else ppu = Math.min(b.m.aw * 0.9 / 1.4, b.m.ah * 0.86 / 1.62);
      b.cam.aspect = L.vw / L.vh; b.cam.position.set(0, 0, L.vh / (ppu * 2 * tanH)); b.cam.lookAt(0, 0, 0); b.cam.updateProjectionMatrix();
    }
    function stickyTop(m) { var a = m.top - state.scroll; if (!m.sticky) return a; if (a > 0) return a; var b = m.top + m.h - L.vh - state.scroll; return b < 0 ? b : 0; }

    /* ---------------- adaptive quality: 3 tiers ----------------
       high   : pixel ratio ≤ 1.25, bloom (2 blur passes), all objects & dust, ink blooms, clearcoat book
       medium : pixel ratio 1, bloom (1 blur pass), ~60% objects, ~55% dust
       low    : pixel ratio 1, no post-processing, ~35% objects, ~30% dust, no ink blooms, no clearcoat
       (a computer with no graphics card at all also gets a painted static background)
       Chosen from a short benchmark at start, then only ever steps DOWN (never flickers back up). */
    var TIERS = {
      high:   { dpr: 1.25, post: true,  passes: 2, obj: 1,    dust: 1,    stains: true,  coat: true },
      medium: { dpr: 1,    post: true,  passes: 1, obj: 0.6,  dust: 0.55, stains: true,  coat: true },
      low:    { dpr: 1,    post: false, passes: 0, obj: 0.35, dust: 0.3,  stains: false, coat: false }
    };
    var ORDER = ['high', 'medium', 'low'], tier = 'high', passes = 2, coatOn = true;
    function applyTier(name) {
      var t = TIERS[name]; tier = name; quality = ORDER.length - 1 - ORDER.indexOf(name) + 1;
      var nd = Math.min(dpr0, t.dpr); if (nd !== dpr) { dpr = nd; renderer.setPixelRatio(dpr); renderer.setSize(L.vw, L.vh, false); }
      post = t.post && !mobile; passes = t.passes;
      if (world) {
        world.pMat.uniforms.uPR.value = dpr;
        world.items.forEach(function (it) { it.mesh.count = Math.max(1, Math.floor(it.n * t.obj)); });
        world.pGeo.setDrawRange(0, Math.floor(world.NP * t.dust));
        if (world.stains) world.stains.visible = t.stains;
        world.shadows.visible = t.stains; world.fg.visible = name !== 'low';
      }
      if (S && t.coat !== coatOn) { coatOn = t.coat; S.coatMats.forEach(function (m) { m.clearcoat = coatOn ? 1 : 0; m.needsUpdate = true; }); }
      makeTargets();
      if (o.onQuality) o.onQuality(software && worldOff ? 'software' : name);
    }
    // compile every shader up front, including hidden page leaves, so nothing compiles mid-scroll
    function compileAll() {
      if (!world) return;
      function c(scene, cam) {
        var hidden = []; scene.traverse(function (ob) { if (!ob.visible) { hidden.push(ob); ob.visible = true; } });
        renderer.compile(scene, cam); hidden.forEach(function (ob) { ob.visible = false; });
      }
      c(world.scene, world.cam); books.forEach(function (b) { c(b.scene, b.cam); });
      // three.js links programs lazily on first draw; force the link now (behind the preloader), not mid-scroll
      (renderer.info.programs || []).forEach(function (p) { try { p.getUniforms(); p.getAttributes(); } catch (e) {} });
    }
    function stepDown() { var i = ORDER.indexOf(tier); if (i < ORDER.length - 1) { applyTier(ORDER[i + 1]); compileAll(); } }
    // benchmark: ~1 s of real frames right after start-up (behind the preloader). Wall-clock time, not the
    // capped animation dt, so a very slow machine is measured honestly.
    var bench = { on: false, t0: 0, n: 0, skip: 6, resolve: null };
    var ready = new Promise(function (r) { bench.resolve = r; });
    function benchDone(fps) {
      bench.on = false; window.__wmBench = Math.round(fps);
      applyTier(fps >= 50 ? 'high' : fps >= 32 ? 'medium' : 'low'); compileAll();
      guard.cool = performance.now() + 3000; bench.resolve(tier);
    }
    function benchFrame() {
      if (!bench.on) return;
      var now = performance.now();
      if (bench.skip > 0) { bench.skip--; bench.t0 = now; return; }   // first frames include shader warm-up
      bench.n++;
      if (now - bench.t0 >= 1000) benchDone(bench.n / ((now - bench.t0) / 1000));
    }
    // live guard: below 45 fps for 2 s in a row -> one tier down, then 3 s cool-down. Never steps back up.
    var guard = { cool: 0, winT: 0, winN: 0, lowSince: 0 };
    function monitor() {
      if (o.qualityFull || bench.on) return;
      var now = performance.now();
      if (now < guard.cool) { guard.winT = now; guard.winN = 0; guard.lowSince = 0; return; }
      if (!guard.winT) { guard.winT = now; return; }
      guard.winN++;
      if (now - guard.winT >= 500) {
        var fps = guard.winN * 1000 / (now - guard.winT); guard.winT = now; guard.winN = 0;
        if (fps < 45) { if (!guard.lowSince) guard.lowSince = now - 500; if (now - guard.lowSince >= 2000) { guard.lowSince = 0; guard.cool = now + 3000; stepDown(); } }
        else guard.lowSince = 0;
      }
    }

    /* ---------------- frame ---------------- */
    var freezeT = null;   // test hook: freeze the clock so only cursor/scroll changes the picture
    function frame(dt, time) {
      if (document.hidden || state.paused) return;
      if (freezeT !== null) time = freezeT;   // hidden tab, or a full-screen viewer / drawer / menu covers everything
      benchFrame();
      renderer.setScissorTest(false);
      if (worldOff) { renderer.setRenderTarget(null); renderer.clear(); }
      else if (world) updateWorld(dt, time);
      if (worldOff) {}
      else if (post && rtScene) {
        renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(world.scene, world.cam);
        brightMat.uniforms.tMap.value = rtScene.texture; runPass(brightMat, rtA);
        for (var bp = 1; bp <= passes; bp++) {
          blurMat.uniforms.tMap.value = rtA.texture; blurMat.uniforms.uDir.value.set(bp * 1.5 / rtA.width, 0); runPass(blurMat, rtB);
          blurMat.uniforms.tMap.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, bp * 1.5 / rtA.height); runPass(blurMat, rtA);
        }
        compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tBloom.value = rtA.texture; compMat.uniforms.uTime.value = time;
        renderer.setRenderTarget(null); renderer.clear(); runPass(compMat, null);
      } else {
        renderer.setRenderTarget(null); renderer.clear(); if (world) renderer.render(world.scene, world.cam);
      }
      // books on top, scissored to their section
      renderer.setScissorTest(true);
      for (var i = 0; i < books.length; i++) {
        var b = books[i], m = b.m; if (!m || b.inView === false) continue;   // IntersectionObserver says: off screen
        var top0 = m.top - state.scroll; if (top0 > L.vh || top0 + m.h < 0) continue;
        var cx, cy, y0, y1, x0 = 0, x1 = L.vw;
        if (b.mini) {
          if (!miniOn) continue;
          var sTop = top0 + m.ay - m.ah / 2; if (sTop > L.vh || sTop + m.ah < 0) continue;
          cx = m.ax; cy = sTop + m.ah / 2 - (sTop + m.ah / 2 - L.vh / 2) * 0.06;   // gentle parallax inside the card
          y0 = Math.max(0, sTop); y1 = Math.min(L.vh, sTop + m.ah); x0 = Math.max(0, m.ax - m.aw / 2); x1 = Math.min(L.vw, m.ax + m.aw / 2);
        }
        var res = animateBook(b.bk, dt, time, b.idle);
        S.sweep.value = ((time * (b.hover ? 0.4 : 0.16)) % 2.4) - 0.6 + res.wrapped * 0.35;
        if (!b.mini) { var st = stickyTop(m); cx = m.ax; cy = st + m.ay; y0 = Math.max(0, top0); y1 = Math.min(L.vh, top0 + m.h); }
        b.cam.setViewOffset(L.vw, L.vh, L.vw / 2 - cx, L.vh / 2 - cy, L.vw, L.vh);
        renderer.clearDepth(); renderer.setScissor(x0, L.vh - y1, x1 - x0, y1 - y0);
        renderer.render(b.scene, b.cam);
        if (res.page !== b.bk.lastPage) { b.bk.lastPage = res.page; if (b.onPage) b.onPage(res.page); }
      }
      renderer.setScissorTest(false);
      monitor();
      if (!canvasEl.classList.contains('is-on')) canvasEl.classList.add('is-on');
    }
    function resize() {
      L.vw = window.innerWidth; L.vh = window.innerHeight; L.docH = Math.max(1, document.documentElement.scrollHeight);
      renderer.setSize(L.vw, L.vh, false);
      makeTargets(); layoutWorld(); books.forEach(measureStage);
      if (world) { world.aurora.material.uniforms.uRes.value.set(L.vw, L.vh); if (!worldOff) makeTrail(); }
    }

    var S = null, bookIO = null, miniOn = true;
    function needArts(list) {
      var out = {};
      return Promise.all(list.map(function (id) { var src = texOf(id); if (!src) return Promise.reject(new Error('Missing texture ' + id)); return loadImage(src).then(function (im) { out[id] = im; }); })).then(function () { return out; });
    }
    var fontsReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('600 40px Fraunces'), document.fonts.load('italic 400 20px Fraunces'), document.fonts.load('700 16px Manrope')]).catch(function () {}) : Promise.resolve();

    return {
      frame: frame, resize: resize, quality: function () { return quality; }, renderer: renderer,
      software: function () { return software; },
      init: function () {
        var pages = o.book.pages, leaves = Math.min(pages.length - 1, mobile ? (cfg.pagesMobile || 4) : (cfg.pagesDesktop || 6));
        pages = pages.slice(0, leaves + 1);
        return fontsReady.then(function () { return needArts(pages.slice(0, 2).concat([o.book.cover])); }).then(function (arts) {
          arts.cover = arts[o.book.cover];
          world = buildWorld();
          S = buildBookShared(arts, pages, leaves);
          var io = bookIO = window.IntersectionObserver ? new IntersectionObserver(function (es) { es.forEach(function (e) { books.forEach(function (b) { if (b.stage === e.target) b.inView = e.isIntersecting; }); }); }, { rootMargin: '120px 0px' }) : null;
          o.book.instances.forEach(function (inst) {
            var bs = bookScene(), bk = buildBook(S, inst.pages);
            bs.scene.add(bk.outer);
            if (inst.spin) bk.spinMode = inst.spin;
            books.push({ bk: bk, scene: bs.scene, cam: bs.cam, section: inst.section, stage: inst.stage, idle: true, open: inst.pages, onPage: inst.onPage, name: inst.name });
            if (io && inst.stage) io.observe(inst.stage);
          });
          resize();
          if (o.qualityFull) { applyTier('high'); bench.resolve('high'); }
          else if (software) { worldOff = true; renderer.setClearColor(0x000000, 0); if (o.onWorldOff) o.onWorldOff(); applyTier('low'); bench.resolve('low'); }
          else if (TIERS[o.startTier]) { applyTier(o.startTier); bench.resolve(o.startTier); }   // ?tier=… test switch (live guard still active)
          else { applyTier('high'); bench.on = true; setTimeout(function () { if (bench.on) benchDone(bench.n ? bench.n / ((performance.now() - bench.t0) / 1000) : 0); }, 3500); }
          compileAll();
          return { pages: pages, leaves: leaves };
        });
      },
      ready: function () { return ready; },
      /* ---- service-card books: same hardcover as the hero, own cover, 1–3 category spreads, drawn by this one renderer ---- */
      addMini: function (list) {
        if (!S || worldOff) return Promise.resolve(false);
        var src = window.WM_TEX_SVC || {};
        return Promise.all(list.map(function (it) { var t = src[it.cover]; if (!t) return Promise.reject(new Error('Missing service texture ' + it.cover)); return loadImage(t.src).then(function (im) { it.img = im; }); })).then(function () {
          list.forEach(function (it) {
            var front = S.laminated(miniCover(it.img, it.label), true); S.coatMats.push(front);
            if (!coatOn) front.clearcoat = 0;
            var cloth = new T.MeshStandardMaterial({ color: it.cloth || 0x5a1f17, roughness: 0.85, envMap: envTex, envMapIntensity: 0.4 });
            var sp = it.pages.map(function () { return { value: S.blankTex, done: false }; });
            var Sm = Object.assign({}, S, { mini: true, frontMat: front, cloth: cloth, spreads: sp, leaves: Math.max(0, sp.length - 1) });
            var bs = bookScene(), bk = buildBook(Sm, true); bk.ptr = { x: 0, y: 0 }; bk.spin = Math.random() * 6;
            bs.scene.add(bk.outer);
            var b = { bk: bk, scene: bs.scene, cam: bs.cam, section: it.section, stage: it.stage, idle: true, open: false, mini: true, name: it.name, pageIds: it.pages, spreads: sp, hover: false, cover: it.cover };
            books.push(b); if (bookIO) bookIO.observe(it.stage); measureStage(b);
          });
          compileAll();
          return true;
        });
      },
      // paint a service book's spreads the first time it is opened (one per idle slot, small 512 px textures)
      miniPages: function (name) {
        var b = null; books.forEach(function (x) { if (x.name === name && x.mini) b = x; }); if (!b || b.painting) return; b.painting = true;
        var src = window.WM_TEX_SVC || {}, idle = window.requestIdleCallback || function (f) { return setTimeout(f, 30); };
        Promise.all(b.pageIds.map(function (id) { return loadImage(src[id].src); })).then(function (ims) {
          ims.forEach(function (im, k) { idle(function () {
            var t = makeSpread(b.pageIds[k], im, k, 0.5); renderer.initTexture(t); b.spreads[k].value = t; b.spreads[k].done = true;
          }, { timeout: 1500 }); });
        }).catch(function () {});
      },
      miniHover: function (name, on, x, y) { books.forEach(function (b) { if (b.name === name && b.mini) { b.hover = on; b.bk.ptr.x = on ? x : 0; b.bk.ptr.y = on ? y : 0; } }); },
      miniEnable: function (on) { miniOn = !!on; },
      miniInfo: function () { return books.filter(function (b) { return b.mini; }).map(function (b) { return { name: b.name, cover: b.cover, pages: b.pageIds.length, painted: b.spreads.filter(function (x) { return x.done; }).length, target: b.bk.target, cur: +b.bk.cur.toFixed(3), sway: +b.bk.spinG.rotation.y.toFixed(3), tiltY: +b.bk.ry.toFixed(3), inView: b.inView !== false, open: +(b.bk.cov.a / Math.PI).toFixed(3) }; }); },
      palette: function () { return { name: palInfo.name, next: palInfo.next, k: palInfo.k, base: '#' + palCur[0].getHexString(), light: '#' + palCur[3].getHexString() }; },
      _dbg: function () { return { world: world, trail: trail, renderer: renderer, freeze: function (t) { freezeT = t; }, books: books, bookPages: S ? S.pages.slice() : null, setPost: function (v) { post = v; makeTargets(); } }; },
      trailSpeed: function () { return +trail.speed.toFixed(3); },
      tier: function () { return tier; },
      // paint the remaining book spreads one per idle slot (no long task on the main thread)
      fillSpreads: function () {
        if (!S) return;
        var todo = S.pages.map(function (id, k) { return k; }).filter(function (k) { return !S.spreads[k].done; });
        needArts(todo.map(function (k) { return S.pages[k]; })).then(function (arts) {
          var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 60); };
          (function next() { var k = todo.shift(); if (k === undefined) return; idle(function () { var id = S.pages[k]; var t = makeSpread(id, arts[id], k); renderer.initTexture(t); S.spreads[k].value = t; if (performance.mark) performance.mark('wm-spread-' + k); S.spreads[k].done = true; next(); }, { timeout: 1200 }); })();   // timeout: pages are painted even on a page that is never idle
        }).catch(function () {});
      },
      stats: function () {
        var w = Math.floor(L.vw * dpr), h = Math.floor(L.vh * dpr), rt = post ? (w * h * 4 * 2 + 2 * (w >> 2) * (h >> 2) * 4) : 0;
        return { tier: tier, dpr: dpr, texMB: +((TEXBYTES.v + rt + 128 * 128 * 4) / 1048576).toFixed(1) };
      },
      setPage: function (name, k) { books.forEach(function (b) { if (b.name === name) b.bk.target = clamp(k, 0, b.bk.n + 1); }); },
      getPage: function (name) { for (var i = 0; i < books.length; i++) if (books[i].name === name) return { target: books[i].bk.target, cur: books[i].bk.cur, n: books[i].bk.n }; return null; }
    };
  }

  window.WMScene = { create: create };
})();
