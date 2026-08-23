# Metro Start 10.11

A new tab page for Google Chrome inspired by Zune.

[Available on the Google Chrome Store](https://chrome.google.com/webstore/detail/bbhdfpmfdplolnnkpdepnelcfdmikjfd)

⚡ Powered by:
* [Trianglify](http://qrohlf.com/trianglify/)
* [MetroSelect](https://github.com/metro-start/metro-select)
* [Pickr](https://github.com/simonwep/pickr)
* [TinyColor](https://github.com/bgrins/TinyColor)
* [and others...](https://github.com/metro-start/metro-start/blob/master/package.json)

## Prerequisites

Install Bun 1.4 or newer. Metro Select 3.1 is installed from npm and pinned by
the Bun lockfile for reproducible extension builds.

## Install, test, and build

```sh
bun install --frozen-lockfile
bun run check
```

`check` runs ESLint, unit and API-contract tests, builds all targets, and
validates their manifests and files. Individual builds are available through
`bun run build:chrome`, `bun run build:firefox`, and `bun run build:xcode`.
Artifacts and store-ready ZIP files are written under `dist/`.

To build the standalone demo wrapper:

```sh
bun run build:demo
open demo/index.html
```

The demo intentionally works from `file://` and uses bundled sample data.

## Deploy

- Chrome/Edge: upload `dist/metro-start-chrome.zip` to the Chrome Web Store or
  Microsoft Edge Add-ons dashboard.
- Firefox: upload `dist/metro-start-firefox.zip` to Firefox Add-ons. Its build
  uses Manifest V2 and the fixed extension ID from `scripts/manifest.cjs`.
- Safari: import the generated `dist/xcode` extension resources into the
  `metro-start-xcode` wrapper, archive it in Xcode, and submit through App Store
  Connect.

Before publishing, confirm the version in `package.json`; the build copies it
into every generated manifest. Version 10.11 expects Metro Select 3.1 and the
Metro Start Web API 1.1-compatible `/api/weather`, `/api/themes`, and
`/api/newtheme` contracts.
