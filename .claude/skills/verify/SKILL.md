# Verify changes in the running app

How to launch and visually verify this Next.js site in the remote (headless) environment.

## Build & launch

```bash
npm install --no-audit --no-fund   # if node_modules missing
npm run dev &                       # ready in ~2s, first page compile ~15-20s
curl -s -o /dev/null http://localhost:3000   # warm the page before driving it
```

## Drive with Playwright

Playwright is installed globally but not in this repo. ESM imports ignore NODE_PATH, so symlink it:

```bash
mkdir -p <scratch>/node_modules
ln -sfn /opt/node22/lib/node_modules/playwright <scratch>/node_modules/playwright
ln -sfn /opt/node22/lib/node_modules/playwright-core <scratch>/node_modules/playwright-core
```

Launch with the pre-installed browser (the `/opt/pw-browsers/chromium/...` path in env docs is wrong; use the versioned dir):

```js
chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
```

## Gotchas

- **Screenshots time out** with big viewports / deviceScaleFactor > 2: the WebGL hero canvas
  (`components/HeroCanvas.tsx`) is expensive to raster. Use a short viewport (height ~320) when
  you only need the header, and pass `timeout: 60000`.
- **`getComputedStyle` lies about compositor-driven CSS animations** (transform keyframes) in
  headless: values read stale/parked and `boundingBox()` can hang on the "stable" actionability
  check for infinitely-animating elements. To observe an animation, either force frames (take a
  tiny-clip screenshot between samples) or scrub deterministically via WAAPI:
  `el.getAnimations()[0].pause(); anim.currentTime = <ms>;` then screenshot the pixels.
- **Hover**: bypass actionability with `page.mouse.move(cx, cy)` at coordinates from
  `getBoundingClientRect`, then force a frame before reading styles.
- **Timer throttling**: `setTimeout` inside `page.evaluate` can sleep far longer than asked;
  don't trust polling intervals for timing-sensitive checks.

## Flows worth driving

- Header/nav (`components/Navigation.tsx`): check at 1536/1440/1280 (full nav — it is width-tight;
  assert the gap between the logo wordmark and the first nav link stays positive, and
  `document.body.scrollWidth <= viewport`) and 1152/1024/768/375 (burger menu).
- Reduced motion: `page.emulateMedia({ reducedMotion: 'reduce' })` — globals.css globally kills
  animations/transitions; verify animated elements still end up visible (opacity 1).
