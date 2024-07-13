import { assertEquals, assertThrows } from "@std/assert";
import {
  type Color,
  blur,
  brightness,
  contrast,
  equalize,
  fill,
  format,
  frame,
  grayscale,
  noise,
  noUpscale,
  quality,
  rgb,
  rotate,
  roundCorner,
  sharpen,
  stripIcc,
  watermark,
} from "./mod.ts";

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

Deno.test(function testFilterContrastFormat() {
  assertEquals(contrast(30), "contrast(30)");
});

Deno.test(function testFilterNoiseInvalidValues() {
  assertThrows(() => noise(-1));
  assertThrows(() => noise(101));
});

Deno.test(function testFilterNoiseFormat() {
  assertEquals(noise(30), "noise(30)");
});

Deno.test(function testFilterQualityInvalidValues() {
  assertThrows(() => quality(-1));
  assertThrows(() => quality(101));
});

Deno.test(function testFilterQualityFormat() {
  assertEquals(quality(30), "quality(30)");
});

Deno.test(function testFilterRgbInvalidValues() {
  assertThrows(() => rgb({ r: -101, g: 0, b: 0 }));
  assertThrows(() => rgb({ r: 101, g: 0, b: 0 }));
  assertThrows(() => rgb({ r: 0, g: -101, b: 0 }));
  assertThrows(() => rgb({ r: 0, g: 101, b: 0 }));
  assertThrows(() => rgb({ r: 0, g: 0, b: -101 }));
  assertThrows(() => rgb({ r: 0, g: 0, b: 101 }));
});

Deno.test(function testFilterRgbFormat() {
  assertEquals(rgb({ r: -30, g: 40, b: -75 }), "rgb(-30,40,-75)");
});

const WHITE: Color = { r: 255, g: 255, b: 255 };
Deno.test(function testFilterRoundCornerInvalidValues() {
  assertThrows(() => roundCorner(0));
  assertThrows(() => roundCorner(-50));
  assertThrows(() => roundCorner(1, -1, WHITE));
});

Deno.test(function testFilterRoundCornerFormat() {
  assertEquals(roundCorner(10), "round_corner(10,0,0,0,1)");
  assertEquals(roundCorner(10, "transparent"), "round_corner(10,0,0,0,1)");
  assertEquals(roundCorner(10, WHITE), "round_corner(10,255,255,255)");
  assertEquals(
    roundCorner(10, 15, { r: 255, g: 16, b: 16 }),
    "round_corner(10|15,255,16,16)"
  );
});

Deno.test(function testFilterWatermarkInvalidValues() {
  assertThrows(() => watermark(""));
  assertThrows(() => watermark("a.png", { x: 0, y: 0, transparency: -1 }));
  assertThrows(() => watermark("a.png", { x: 0, y: 0, transparency: 101 }));
});

Deno.test(function testFilterWatermarkFormat() {
  assertEquals(watermark("a.png"), "watermark(a.png,0,0,0)");
  assertEquals(
    watermark("a.png", { x: 20, y: 20 }),
    "watermark(a.png,20,20,0)"
  );
  assertEquals(
    watermark("a.png", { x: 20, y: 20, transparency: 50 }),
    "watermark(a.png,20,20,50)"
  );
});

Deno.test(function testFilterSharpenFormat() {
  assertEquals(sharpen(3, 4, { luminanceOnly: true }), "sharpen(3,4,true)");
  assertEquals(sharpen(3, 4, { luminanceOnly: false }), "sharpen(3,4,false)");
  assertEquals(
    sharpen(3.1, 4.2, { luminanceOnly: true }),
    "sharpen(3.1,4.2,true)"
  );
  assertEquals(
    sharpen(3.1, 4.2, { luminanceOnly: false }),
    "sharpen(3.1,4.2,false)"
  );
});

Deno.test(function testFilterFillingFormat() {
  assertEquals(fill("ff2020"), "fill(ff2020)");
  assertEquals(fill("red", { fillTransparent: false }), "fill(red)");
  assertEquals(fill("ff2020", { fillTransparent: true }), "fill(ff2020,1)");
  assertEquals(fill("auto"), "fill(auto)");
});

Deno.test(function testFilterFormatFormat() {
  assertEquals(format("avif"), "format(avif)");
});

Deno.test(function testFilterFrameInvalidValues() {
  assertThrows(() => frame(""));
});

Deno.test(function testFilterFrameFormat() {
  assertEquals(frame("a.png"), "frame(a.png)");
});

Deno.test(function testFilterBlurInvalidValues() {
  assertThrows(() => blur({ radius: 0 }));
  assertThrows(() => blur({ radius: 151 }));
  assertThrows(() => blur({ radius: 1, sigma: -1 }));
});

Deno.test(function testFilterBlurFormat() {
  assertEquals(blur({ radius: 1 }), "blur(1,0)");
  assertEquals(blur({ radius: 1, sigma: 0 }), "blur(1,0)");
  assertEquals(blur({ radius: 1, sigma: 1 }), "blur(1,1)");
});

Deno.test(function testFilterNoUpscale() {
  assertEquals(noUpscale(), "no_upscale()");
});

Deno.test(function testFilterStripIcc() {
  assertEquals(stripIcc(), "strip_icc()");
});

Deno.test(function testFilterGrayscale() {
  assertEquals(grayscale(), "grayscale()");
});

Deno.test(function testFilterEqualize() {
  assertEquals(equalize(), "equalize()");
});

Deno.test(function testFilterRotate() {
  assertEquals(rotate(90), "rotate(90)");
});
