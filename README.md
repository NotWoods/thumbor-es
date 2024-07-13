# @notwoods/thumbor-es

_TypeScript Thumbor client for Node, Deno, Bun, & browsers_

TypeScript client for the
[Thumbor image service](https://github.com/globocom/thumbor) which allows you to
build URIs in an expressive fashion using a fluent API.

This library is fully compatible with all JS runtimes (using the
[Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)).
It's heavily based on Square's [Pollexor](https://github.com/square/pollexor)
library for Java.

## Examples

```ts
// Without encryption:
const url = await buildThumborUrl({ image: "http://example.com" });

// With encryption:
const url = await buildThumborUrl({ image: "http://example.com", key: "key" });
```

```ts
const url = await buildThumborUrl({
  image: "http://example.com/image.png",
  resize: { width: 48, height: 48 },
});
// Produces: /unsafe/48x48/example.com/image.png

const url = await buildThumborUrl({
  image: "http://example.com/image.png",
  crop: { top: 10, left: 10, bottom: 90, right: 90 },
  resize: { width: 40, height: 40 },
  smart: true,
});
// Produces: /unsafe/10x10:90x90/smart/40x40/example.com/image.png

const url = await buildThumborUrl({
  image: "http://example.com/image.png",
  crop: { top: 5, left: 5, bottom: 195, right: 195 },
  resize: { width: 95, height: 95 },
  align: { horizontal: "bottom", vertical: "right" },
});
// Produces: /unsafe/5x5:195x195/right/bottom/95x95/example.com/image.png

const url = await buildThumborUrl({
  image: "http://example.com/image.png",
  resize: { width: 200, height: 100 },
  filters: [
    roundCorner(10),
    watermark(
      await buildThumborUrl({
        image: "http://example.com/overlay1.png",
        resize: { width: 200, height: 100 },
      }),
    ),
    watermark(
      await buildThumborUrl({
        image: "http://example.com/overlay2.png",
        resize: { width: 50, height: 50 },
      }),
      { x: 75, y: 25 },
    ),
    quality(85),
  ],
});
// Produces: /unsafe/200x100/filters:round_corner(10,255,255,255):watermark(/unsafe/200x100/example.com/overlay1.png,0,0,0):watermark(/unsafe/50x50/example.com/overlay2.png,75,25,0):quality(85)/example.com/background.png
```

## Comparison to other libraries

thumbor-es has a JavaScript-style API with an options object, unlike other older
libraries using Java-style builder classes. It's also built with the latest
browsers in mind, and is tinier, faster, and has 100% test coverage.
