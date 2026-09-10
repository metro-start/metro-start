// Runs js/script.js against a recording stub to confirm the logging works and
// the render path executes without throwing. Not shipped: a local check.
//
//   node tools/smoke-script.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const scriptSource = fs.readFileSync(path.join(root, 'js', 'script.js'), 'utf8');
const bundleSource = fs.readFileSync(path.join(root, 'js', 'trianglify.bundle.js'), 'utf8');

const output = [];
const capture = (kind) => (...args) => {
  output.push(`${kind}: ${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`);
};

const calls = [];
const makeContext = () => ({
  fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
  setTransform() {}, scale() {}, save() {}, restore() {},
  beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, rect() {},
  fill() {}, stroke() {}, fillRect() {}, clearRect() {}, drawImage() {},
  createLinearGradient: () => ({ addColorStop() {} }),
  createRadialGradient: () => ({ addColorStop() {} }),
  fillText() {}, measureText: () => ({ width: 0 }),
});

const element = (tag) => ({
  tagName: String(tag).toUpperCase(), style: {}, width: 0, height: 0,
  setAttribute() {}, getAttribute() {}, appendChild(c) { return c; },
  addEventListener() {}, getContext: () => makeContext(),
  querySelector: () => null, querySelectorAll: () => [],
});

const listeners = {};
const track = { style: {} };
const canvas = element('canvas');

const sandbox = {
  console: {
    log: capture('log'), info: capture('info'), warn: capture('warn'),
    error: capture('error'), debug: capture('debug'),
    groupCollapsed: (label) => output.push(`group: ${label}`),
    groupEnd: () => {},
  },
  performance: { now: (() => { let t = 0; return () => (t += 12.5); })() },
  Math, Array, Object, Number, JSON, String, Boolean, Error,
  Uint32Array, Uint8Array, Float64Array, isNaN, parseFloat, parseInt,
  navigator: { userAgent: 'node' },
  setTimeout: (fn) => { listeners.timer = fn; return 0; },
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.document = {
  hidden: false,
  querySelector: (sel) => (sel === '.slideshow__track' ? track : null),
  getElementById: (id) => (id === 'background_canvas' ? canvas : null),
  addEventListener: (name, fn) => { listeners[name] = fn; },
  createElement: element,
  createElementNS: (ns, tag) => element(tag),
};

sandbox.localStorage = { getItem: () => 'debug', setItem() {} };
sandbox.window.addEventListener = (name, fn) => { listeners[name] = fn; };
sandbox.window.devicePixelRatio = 2;
sandbox.window.innerWidth = 1440;
sandbox.window.innerHeight = 900;
sandbox.window.matchMedia = () => ({ matches: false, addEventListener() {} });

vm.createContext(sandbox);
vm.runInContext(bundleSource, sandbox, { filename: 'trianglify.bundle.js' });
vm.runInContext(scriptSource, sandbox, { filename: 'script.js' });

// Exercise the resize path too.
if (listeners.resize) listeners.resize();
if (listeners.timer) listeners.timer();

const result = {
  libraryGlobal: typeof sandbox.trianglify,
  logLines: output.length,
  // The script warns only when something is actually wrong, so any warning
  // fails this check.
  warnings: output.filter(line => line.startsWith('warn:')),
  errors: output.filter(line => line.startsWith('error:')),
  lastRender: sandbox.metroStartBackground && sandbox.metroStartBackground.lastRender,
  paletteCount: sandbox.metroStartBackground && sandbox.metroStartBackground.palettes.length,
};

console.log(JSON.stringify({
  ...result,
  sample: output.slice(0, 12),
}, null, 2));

const failures = [];
if (result.libraryGlobal !== 'function') failures.push('trianglify global missing');
if (!result.lastRender) failures.push('no render recorded');
if (result.paletteCount !== 8) failures.push(`expected 8 palettes, got ${result.paletteCount}`);
if (!result.lastRender || result.lastRender.triangles < 1) failures.push('no triangles built');
if (result.logLines < 10) failures.push(`expected plenty of log lines, got ${result.logLines}`);
// At dpr 2 with a 1440x900 viewport, Trianglify's auto scaling should give a
// 2880x1800 backing store -- and must not be scaled twice.
if (result.lastRender && result.lastRender.canvasWidth !== 2880) {
  failures.push(`expected a 2880px backing store at dpr 2, got ${result.lastRender.canvasWidth}`);
}
if (result.warnings && result.warnings.length) {
  failures.push(`unexpected warnings: ${result.warnings.join(' | ')}`);
}
if (result.errors && result.errors.length) {
  failures.push(`unexpected errors: ${result.errors.join(' | ')}`);
}

if (failures.length) {
  console.error('\nFAIL:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('\nOK: script ran, logged, and rendered through the resize path');
