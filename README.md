# Metro Start website

This is the dependency-free GitHub Pages site for `www.metro-start.com`.

## Preview

Serve this directory with any static server. With Bun:

```sh
bun -e "Bun.serve({port: 4180, fetch: request => new Response(Bun.file(new URL(request.url).pathname.slice(1) || 'index.html'))})"
```

## Browser store links

The Chrome Web Store listing is live. Firefox, Edge, and Safari are deliberately
rendered as non-clickable release states so visitors are never sent to guessed or
unverified listings. When a listing is published, replace its `.store-row--pending`
`div` in `index.html` with an `a.store-row` and use the verified store URL.

The background is generated with [Trianglify](https://github.com/qrohlf/trianglify),
the same library the Metro Start extension uses. One mesh is drawn per page load:
the cell size, variance and palette all vary, so each visit gets a different
background. Nothing animates, so there is no background timer and no pause
control. Resizing the window generates a fresh background.

Trianglify is vendored as `js/trianglify.bundle.js` (the library's UMD bundle,
GPL-3.0) so the site keeps working with no build step and no third-party request
at page load. It is loaded as a classic script before `js/script.js`, and exposes
the global `trianglify`.

## Background colours

`js/script.js` holds the palettes. Each runs light to dark, matching the way
Trianglify shades a mesh (lightest corner to darkest), and stays inside one or
two adjacent hues so no combination can clash. Most lead with a pastel.

Pastels are far too bright for white text on their own — a pastel cell gives
roughly 1.5-2.2:1. That is why the page sets a dark `text-shadow`
(`--text-shadow` in `css/main.css`): the shadow supplies the backing that the
text sits on, which puts the worst cell on the canvas at 7.7:1 or better. The
colours are free to be pastel because the shadow, not the background, guarantees
legibility.

## Background logging

`js/script.js` logs the whole render path to the console, because a randomised
background is otherwise hard to reason about. It reports the chosen palette and
its stops, the Trianglify options, the triangle count, the canvas and CSS sizes,
the render time, resize regeneration, and slideshow state; failures to load the
bundle or render are logged as errors rather than swallowed.

```js
metroStartBackground.log.level = 'silent';   // error | warn | info | debug | silent
metroStartBackground.palettes;               // the palette list
metroStartBackground.lastRender;             // details of the most recent render
```

The default level is `debug`. Set `localStorage['metro-start:debug']` to another
level to change it for subsequent loads. The canvas is rendered at the device
pixel ratio (capped at 2) by Trianglify's own `scaling: 'auto'`, so log lines
report a `2880x1800` backing store for a `1440x900` viewport at 2x.

## Checks

```sh
node tools/check-palettes.js    # palette ordering and contrast
node tools/smoke-script.js      # runs the script against a stub, checks the log
```

`check-palettes.js` evaluates the real vendored Trianglify colour maths over a
sample grid and fails if a palette stops being light-to-dark, if any point on the
canvas drops white text below 4.5:1 (including the text shadow), or if the mesh
becomes washed out overall.

The preview carousel fades every eight seconds, and that automatic effect is
disabled when the visitor requests reduced motion.
