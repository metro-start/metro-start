// Palette diagnostics for metro-start-site.
//
// Trianglify shades its mesh with a colour scale: the x axis runs from the first
// palette stop to the last, the y axis does the same, and each cell sits where
// those two meet. The lightest stop therefore occupies the top-left corner and
// the darkest the bottom-right.
//
// Pastel light ends mean some cells are genuinely bright, far too bright for
// white text on their own. That is fine because the page puts a dark text-shadow
// behind the text: the shadow supplies the contrast, so the background is free
// to be pastel. This checks that contract holds:
//
//   1. Every palette is ordered light -> dark, so the mesh reads as a gradient.
//   2. Over the *entire* canvas, white text on its shadow keeps >= 4.5:1 (AA).
//   3. The mesh is not so bright that the page looks washed out (mean contrast).
//
//   node tools/check-palettes.js
//   node tools/check-palettes.js --candidates   # report pastel options

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'js', 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'main.css'), 'utf8');

const AA = 4.5;
// A pastel light end pulls the average down, so this is a "not washed out"
// guard rather than a readability requirement: if a palette drifts toward light
// overall, the mean collapses and the page starts to look bleached.
const MIN_MEAN_CONTRAST = 7;
const SAMPLES = 80;             // grid resolution per axis

// --- read the palettes the page actually ships -----------------------------
const block = script.slice(script.indexOf('const palettes = ['), script.indexOf('const pick'));
const palettes = [...block.matchAll(/\[([^\]]+)\]/g)]
  .map(m => [...m[1].matchAll(/'#[0-9a-fA-F]{6}'/g)].map(h => h[0].slice(1, -1)))
  .filter(p => p.length);
if (!palettes.length) {
  console.error('FAIL: could not parse any palettes out of js/script.js');
  process.exit(1);
}

// The shade overlay darkens the whole mesh slightly; read it from the CSS.
const shadeMatch = /\.background__shade\s*\{\s*background:\s*rgb\(0 0 0\s*\/\s*([\d.]+)%\)/.exec(css);
if (!shadeMatch) {
  console.error('FAIL: could not read the shade overlay from css/main.css');
  process.exit(1);
}
const overlay = Number(shadeMatch[1]) / 100;

// The text shadow supplies the contrast for white text over the mesh.
const shadowMatch = /--text-shadow:\s*rgb\(0 0 0\s*\/\s*([\d.]+)%\)/.exec(css);
if (!shadowMatch) {
  console.error('FAIL: could not read --text-shadow from css/main.css');
  process.exit(1);
}
const shadowAlpha = Number(shadowMatch[1]) / 100;

// --- load the vendored bundle so the colour maths matches production -------
function loadTrianglify() {
  const source = fs.readFileSync(path.join(root, 'js', 'trianglify.bundle.js'), 'utf8');
  const moduleShim = { exports: {} };
  const sandbox = {
    module: moduleShim, exports: moduleShim.exports, console, Math, Array, Object,
    Number, JSON, String, Boolean, Error, Uint32Array, Uint8Array, Float64Array,
    isNaN, parseFloat, parseInt, navigator: { userAgent: 'node' },
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.document = { createElement: () => ({ getContext: () => null }) };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'trianglify.bundle.js' });
  return sandbox.trianglify || moduleShim.exports;
}

const trianglify = loadTrianglify();
if (typeof trianglify !== 'function') {
  console.error('FAIL: vendored bundle did not expose trianglify');
  process.exit(1);
}
const mix = trianglify.utils && trianglify.utils.mix;
if (typeof mix !== 'function') {
  console.error('FAIL: bundle does not expose utils.mix');
  process.exit(1);
}

const toColour = rgb => mix(rgb, rgb, 0.5, 'lab');

function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrastWithWhite = rgb => 1.05 / (relativeLuminance(rgb) + 0.05);

// Worst case for the reader: the mesh cell at full strength with no overlay,
// then the shadow composited on top of it, then white text on that.
const effectiveContrast = rgb => {
  const onShadow = rgb.map(v => v * (1 - shadowAlpha));
  return contrastWithWhite(onShadow);
};
// What the page looks like overall (overlay applied, no shadow).
const pageContrast = rgb => contrastWithWhite(rgb.map(v => v * (1 - overlay)));

function evaluate(palette) {
  const first = toColour(palette[0]);
  const last = toColour(palette[palette.length - 1]);
  let total = 0;
  let floor = Infinity;
  let pageSum = 0;
  for (let iy = 1; iy <= SAMPLES; iy++) {
    const yColour = mix(first, last, iy / (SAMPLES + 1), 'lab');
    for (let ix = 1; ix <= SAMPLES; ix++) {
      const xColour = mix(first, last, ix / (SAMPLES + 1), 'lab');
      // Trianglify's default colour function mixes the x and y samples at 0.5.
      const rgb = mix(xColour, yColour, 0.5, 'lab')._rgb.slice(0, 3);
      total++;
      floor = Math.min(floor, effectiveContrast(rgb));
      pageSum += pageContrast(rgb);
    }
  }
  return { floor, meanPageContrast: pageSum / total };
}

// --- optional: report pastel candidates ------------------------------------
if (process.argv.includes('--candidates')) {
  const candidates = [
    '#b8a9e8', '#b3a6e0', '#a9c8e8', '#a8cfe0', '#b5d6b0', '#a8cfa4',
    '#e8b8c8', '#e0b3c4', '#f0cba8', '#e8c9a0', '#a8d8d0', '#b0d8d4',
    '#d8b8e0', '#e0c8b0', '#c8d8a8', '#a8d0e8',
  ];
  console.log(`pastel candidates. contrast for white text over the brightest\n` +
    `possible cell (no overlay) with a ${shadowAlpha} black text shadow:\n`);
  console.log('  hex        L*      vs white alone   with text shadow');
  for (const hex of candidates) {
    const colour = toColour(hex);
    const rgb = colour._rgb.slice(0, 3);
    console.log(`  ${hex}  ${colour.lab()[0].toFixed(1).padStart(5)}   ` +
      `${contrastWithWhite(rgb).toFixed(2).padStart(6)}:1` +
      `          ${effectiveContrast(rgb).toFixed(2).padStart(5)}:1`);
  }
  process.exit(0);
}

// --- report ----------------------------------------------------------------
console.log(`shade overlay ${(overlay * 100).toFixed(0)}%, text shadow ${(shadowAlpha * 100).toFixed(0)}%   ` +
  `AA target ${AA}:1   mean page contrast floor ${MIN_MEAN_CONTRAST}:1\n`);

let failures = 0;
palettes.forEach((palette, index) => {
  const lightness = palette.map(hex => toColour(hex).lab()[0]);
  const monotonic = lightness.every((l, i) => i === 0 || l < lightness[i - 1]);
  const { floor, meanPageContrast } = evaluate(palette);
  const ok = monotonic && floor >= AA && meanPageContrast >= MIN_MEAN_CONTRAST;
  if (!ok) failures++;
  const bright = lightness[0] >= 70;
  console.log(`${ok ? 'ok  ' : 'FAIL'} palette ${String(index + 1).padStart(2)}: ` +
    `${palette[0]} > ${palette[palette.length - 1]}` +
    `${bright ? '   (pastel light end)' : ''}`);
  console.log(`       L* ${lightness.map(l => l.toFixed(0)).join(' > ')}` +
    `${monotonic ? '' : '   NOT light -> dark'}`);
  console.log(`       white text worst case ${floor.toFixed(2)}:1, ` +
    `mean page contrast ${meanPageContrast.toFixed(1)}:1`);
});

console.log('');
if (failures) {
  console.error(`${failures} palette(s) failed`);
  process.exit(1);
}
const pastelCount = palettes.filter(p => toColour(p[0]).lab()[0] >= 70).length;
console.log(`OK: all ${palettes.length} palettes keep white text at AA or better ` +
  `everywhere (${pastelCount} with a pastel light end)`);
