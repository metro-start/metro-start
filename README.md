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

The ambient background cross-fades every 14 seconds over a six-second transition.
The preview carousel fades every eight seconds. Both automatic effects are disabled
when the visitor requests reduced motion.
