import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "jsr:@std/assert";
import {
  brightness,
  buildThumborUrl,
  contrast,
  ORIGINAL_SIZE,
  roundCorner,
  watermark,
} from "./mod.ts";

const passTypeTest = () => assertEquals(true, true);

const safeKey = "test";

Deno.test(async function testNoConfig() {
  assertEquals(
    await buildThumborUrl({
      image: "http://a.com/b.png",
    }),
    "/unsafe/http://a.com/b.png"
  );
});

Deno.test(async function testComplexUnsafeBuild() {
  const watermarkImageUrl = await buildThumborUrl({
    image: "b.com/c.jpg",
    resize: { width: 20, height: 20 },
  });

  const expected =
    "/unsafe/10x10:90x90/40x40/filters:watermark(/unsafe/20x20/b.com/c.jpg,10,10,0):round_corner(5,0,0,0,1)/a.com/b.png";
  assertEquals(
    await buildThumborUrl({
      image: "a.com/b.png",
      crop: {
        top: 10,
        left: 10,
        bottom: 90,
        right: 90,
      },
      resize: {
        width: 40,
        height: 40,
      },
      filters: [watermark(watermarkImageUrl, 10, 10), roundCorner(5)],
    }),
    expected
  );
});

Deno.test(async function testComplexSafeBuild() {
  const watermarkImageUrl = await buildThumborUrl({
    image: "b.com/c.jpg",
    resize: { width: 20, height: 20 },
  });

  const expected =
    "/X_5ze5WdyTObULp4Toj6mHX-R1U=/10x10:90x90/40x40/filters:watermark(/unsafe/20x20/b.com/c.jpg,10,10,0):round_corner(5,255,255,255)/a.com/b.png";
  assertEquals(
    await buildThumborUrl({
      image: "a.com/b.png",
      key: safeKey,
      crop: {
        top: 10,
        left: 10,
        bottom: 90,
        right: 90,
      },
      resize: {
        width: 40,
        height: 40,
      },
      filters: [
        watermark(watermarkImageUrl, 10, 10),
        roundCorner(5, { r: 255, g: 255, b: 255 }),
      ],
    }),
    expected
  );
});

Deno.test(async function testBuildMeta() {
  const url = await buildThumborUrl({
    image: "a.com/b.png",
    endpoint: "metadata",
  });
  assertStringIncludes(url, "/meta/");
  assertEquals(url.startsWith("/meta/"), true);
});

Deno.test(async function testResize() {
  const url1 = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
  });
  assertEquals(url1, "/unsafe/10x5/a.com/b.png");

  const url2 = await buildThumborUrl({
    image: "b.com/c.png",
    resize: { width: ORIGINAL_SIZE, height: "orig" },
  });
  assertEquals(url2, "/unsafe/origxorig/b.com/c.png");
});

Deno.test(async function testResizeAndFitIn() {
  const url = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    fitIn: true,
  });
  assertEquals(url, "/unsafe/fit-in/10x5/a.com/b.png");
});

Deno.test(async function testResizeAndFitInFull() {
  const url = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    fitIn: "full-fit-in",
  });
  assertEquals(url, "/unsafe/full-fit-in/10x5/a.com/b.png");
});

Deno.test(async function testResizeAndFitInAdaptive() {
  const url = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    fitIn: "adaptive-fit-in",
  });
  assertEquals(url, "/unsafe/adaptive-fit-in/10x5/a.com/b.png");
});

Deno.test(async function testResizeAndFlip() {
  const url1 = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    flipHorizontally: true,
  });
  assertEquals(url1, "/unsafe/-10x5/a.com/b.png");

  const url2 = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    flipVertically: true,
  });
  assertEquals(url2, "/unsafe/10x-5/a.com/b.png");

  const url3 = await buildThumborUrl({
    image: "a.com/b.png",
    resize: { width: 10, height: 5 },
    flipHorizontally: true,
    flipVertically: true,
  });
  assertEquals(url3, "/unsafe/-10x-5/a.com/b.png");
});

Deno.test(async function testCrop() {
  const url = await buildThumborUrl({
    image: "a.com/b.png",
    crop: {
      top: 1,
      left: 2,
      bottom: 3,
      right: 4,
    },
  });
  assertEquals(url, "/unsafe/2x1:4x3/a.com/b.png");
});

Deno.test(async function testResizeAndSmart() {
  const url = await buildThumborUrl({
    image: "http://a.com/b.png",
    resize: { width: 10, height: 5 },
    smart: true,
  });
  assertEquals(url, "/unsafe/10x5/smart/http://a.com/b.png");
});

Deno.test(async function testResizeAndSmart() {
  const url = await buildThumborUrl({
    image: "http://a.com/b.png",
    resize: { width: 10, height: 5 },
    smart: true,
  });
  assertEquals(url, "/unsafe/10x5/smart/http://a.com/b.png");
});

Deno.test(async function testCannotFlipHorizontalWithoutResize() {
  // @ts-expect-error -- flip should not be allowed when resize is not set
  await buildThumborUrl({
    image: "http://a.com/b.png",
    flipHorizontally: true,
  });
  passTypeTest();
});

Deno.test(async function testCannotFlipVerticalWithoutResize() {
  // @ts-expect-error -- flip should not be allowed when resize is not set
  await buildThumborUrl({
    image: "http://a.com/b.png",
    resize: undefined,
    flipVertically: true,
  });
  passTypeTest();
});

Deno.test(async function testTrim() {
  const url = await buildThumborUrl({
    image: "http://a.com/b.png",
    trim: {
      value: "top-left",
      colorTolerance: 100,
    },
  });
  assertEquals(url, "/unsafe/trim:top-left:100/http://a.com/b.png");
});

Deno.test(async function testCannotAlignWithoutResize() {
  // @ts-expect-error -- align should not be allowed when resize is not set
  await buildThumborUrl({
    image: "http://a.com/b.png",
    resize: undefined,
    horizontalAlign: "center",
    verticalAlign: "middle",
  });
  passTypeTest();
});

Deno.test(async function testCannotIssueBadCrop() {
  const image = "http://a.com/b.png";
  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: -1, left: 0, bottom: 1, right: 1 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: 0, left: -1, bottom: 1, right: 1 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: 0, left: 0, bottom: -1, right: 1 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: 0, left: 0, bottom: 1, right: -1 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: 0, left: 1, bottom: 1, right: 0 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      crop: { top: 1, left: 0, bottom: 0, right: 1 },
    })
  );
});

Deno.test(async function testCannotIssueBadResize() {
  const image = "http://a.com/b.png";
  await assertRejects(() =>
    buildThumborUrl({
      image,
      resize: { width: -1, height: 5 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      resize: { width: 10, height: -400 },
    })
  );

  await assertRejects(() =>
    buildThumborUrl({
      image,
      resize: { width: 0, height: 0 },
    })
  );
});

Deno.test(function testFilterBrightnessInvalidValues() {
  assertThrows(() => brightness(-101));
  assertThrows(() => brightness(101));
});

Deno.test(function testFilterBrightnessFormat() {
  assertEquals(brightness(30), "brightness(30)");
});

Deno.test(function testFilterContrastInvalidValues() {
  assertThrows(() => contrast(-101));
  assertThrows(() => contrast(101));
});
