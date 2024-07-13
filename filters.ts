import type { ImageFormat } from "./mod.ts";

function checkInclusiveRange(
  value: number,
  min: number,
  max: number,
  label = "Amount"
): void {
  if (value < min || value > max) {
    throw new RangeError(
      `${label} must be between ${min} and ${max}, inclusive.`
    );
  }
}

/**
 * This filter increases or decreases the image brightness.
 *
 * @param amount -100 to 100 - The amount (in %) to change the image brightness. Positive numbers
 * make the image brighter and negative numbers make the image darker.
 * @throws {RangeError} if `amount` outside bounds.
 */
export function brightness(amount: number): string {
  checkInclusiveRange(amount, -100, 100);
  return `brightness(${amount})`;
}

/**
 * The filter increases or decreases the image contrast.
 *
 * @param amount -100 to 100 - The amount (in %) to change the image contrast. Positive numbers
 * increase contrast and negative numbers decrease contrast.
 * @throws {RangeError} if `amount` outside bounds.
 */
export function contrast(amount: number): string {
  checkInclusiveRange(amount, -100, 100);
  return `contrast(${amount})`;
}

/**
 * This filter adds noise to the image.
 *
 * @param amount 0 to 100 - The amount (in %) of noise to add to the image.
 * @throws {RangeError} if `amount` outside bounds.
 */
export function noise(amount: number): string {
  checkInclusiveRange(amount, 0, 100);
  return `noise(${amount})`;
}

/**
 * This filter changes the overall quality of the JPEG image (does nothing for PNGs or GIFs).
 *
 * @param amount 0 to 100 - The quality level (in %) that the end image will feature.
 * @throws {RangeError} if `amount` outside bounds.
 */
export function quality(amount: number): string {
  checkInclusiveRange(amount, 0, 100);
  return `quality(${amount})`;
}

export interface Color {
  /** Amount of red in the color */
  r: number;
  /** Amount of green in the color */
  g: number;
  /** Amount of blue in the color */
  b: number;
}

/**
 * This filter changes the amount of color in each of the three channels.
 *
 * @param color Amounts that can range from -100 to 100 in percentage.
 * @param color.r The amount of redness in the picture. Can range from -100 to 100 in percentage.
 * @param color.g The amount of greenness in the picture. Can range from -100 to 100 in percentage.
 * @param color.b The amount of blueness in the picture. Can range from -100 to 100 in percentage.
 * @throws {RangeError} if `r`, `g`, or `b` are outside of bounds.
 */
export function rgb(color: Color): string {
  const { r, g, b } = color;
  checkInclusiveRange(r, -100, 100, "Red value");
  checkInclusiveRange(g, -100, 100, "Green value");
  checkInclusiveRange(b, -100, 100, "Blue value");
  return `rgb(${r},${g},${b})`;
}

/**
 * This filter adds rounded corners to the image using the specified color as the background.
 *
 * @param radius amount of pixels to use as radius.
 * @param color fill color for clipped region. Defaults to transparent.
 * @param color.r The amount of redness in the fill color. Can range from 0 to 255.
 * @param color.g The amount of greenness in the fill color. Can range from 0 to 255.
 * @param color.b The amount of blueness in the fill color. Can range from 0 to 255.
 */
export function roundCorner(
  radiusInner: number,
  color?: Color | "transparent"
): string;
/**
 * This filter adds rounded corners to the image using the specified color as the background.
 *
 * @param radiusInner amount of pixels to use as radius.
 * @param radiusOuter specifies the second value for the ellipse used for the radius. Use 0 for
 * no value.
 * @param color fill color for clipped region. Defaults to transparent.
 * @param color.r The amount of redness in the fill color. Can range from 0 to 255.
 * @param color.g The amount of greenness in the fill color. Can range from 0 to 255.
 * @param color.b The amount of blueness in the fill color. Can range from 0 to 255.
 */
export function roundCorner(
  radiusInner: number,
  radiusOuter: number,
  color: Color | "transparent"
): string;
export function roundCorner(
  radiusInner: number,
  radiusOuterOrColor?: number | Color | "transparent",
  maybeColor?: Color | "transparent"
): string {
  let radiusOuter = 0;
  let color: Color | "transparent" | undefined;
  if (typeof radiusOuterOrColor === "number") {
    radiusOuter = radiusOuterOrColor;
    color = maybeColor;
  } else {
    color = radiusOuterOrColor;
  }

  if (color === "transparent") {
    color = undefined;
  }

  if (radiusInner < 1) {
    throw new RangeError("Inner radius must be greater than zero.");
  }
  if (radiusOuter < 0) {
    throw new RangeError("Outer radius must be greater than or equal to zero.");
  }
  let filter = `round_corner(${radiusInner}`;
  if (radiusOuter > 0) {
    filter += `|${radiusOuter}`;
  }
  if (color) {
    filter += `,${color.r},${color.g},${color.b})`;
  } else {
    filter += ",0,0,0,1)";
  }
  return filter;
}

/**
 * This filter adds a watermark to the image at (0, 0).
 *
 * @param imageUrl Watermark image URL. It is very important to understand that the same image
 * loader that Thumbor uses will be used here.
 * @throws {RangeError} if `imageUrl` is blank.
 */
export function watermark(imageUrl: string): string;
/**
 * This filter adds a watermark to the image.
 *
 * @param imageUrl Watermark image URL. It is very important to understand that the same image
 * loader that Thumbor uses will be used here.
 * @param x Horizontal position that the watermark will be in. Positive numbers indicate position
 * from the left and negative numbers indicate position from the right.
 * @param y Vertical position that the watermark will be in. Positive numbers indicate position
 * from the top and negative numbers indicate position from the bottom.
 * @param transparency Watermark image transparency. Should be a number between 0 (fully opaque)
 * and 100 (fully transparent).
 * @throws {RangeError} if `imageUrl` is blank.
 */
export function watermark(
  imageUrl: string,
  x: number,
  y: number,
  transparency?: number
): string;
export function watermark(
  imageUrl: string,
  x: number = 0,
  y: number = 0,
  transparency: number = 0
): string {
  if (!imageUrl) {
    throw new TypeError("Image URL must not be blank.");
  }
  checkInclusiveRange(transparency, 0, 100, "Transparency");
  return `watermark(${imageUrl},${x},${y},${transparency})`;
}

/**
 * This filter enhances apparent sharpness of the image. It's heavily based on Marco Rossini's
 * excellent Wavelet sharpen GIMP plugin. Check http://registry.gimp.org/node/9836 for details
 * about how it work.
 *
 * @param amount Sharpen amount. Typical values are between 0.0 and 10.0.
 * @param radius Sharpen radius. Typical values are between 0.0 and 2.0.
 * @param options Named options.
 * @param options.luminanceOnly Sharpen only luminance channel.
 */
export function sharpen(
  amount: number,
  radius: number,
  options: {
    luminanceOnly: boolean;
  }
): string {
  return `sharpen(${amount},${radius},${options.luminanceOnly})`;
}

/**
 * This filter permit to return an image sized exactly as requested wherever is its ratio by
 * filling with chosen color the missing parts. Usually used with "fit-in" or "adaptive-fit-in"
 *
 * @param color the color name (like in HTML) or hexadecimal RGB expression without the '#' character.
 * (see https://en.wikipedia.org/wiki/Web_colors for example).
 * If `color` is "transparent" and the image format, supports transparency the filling color is transparent.
 * If `color` is "auto", a color is smartly chosen (based on the image pixels) as the filling color.
 * If `color` is "blur", the filling color is a blurred version of the image.
 * @param options Named options.
 * @param options.fillTransparent Specify whether transparent areas of the image should be filled or not. This argument is optional and the default value is false.
 */
export function fill(
  color: string | "auto" | "blur" | "transparent",
  options: { fillTransparent?: boolean } = {}
): string {
  return `fill(${color}${options.fillTransparent ? ",1" : ""})`;
}

/**
 * Specify the output format of the image.
 *
 * @see {@link ImageFormat}
 */
export function format(format: ImageFormat): string {
  return `format(${format})`;
}

/**
 * This filter uses a 9-patch to overlay the image.
 *
 * @param imageUrl Watermark image URL.
 */
export function frame(imageUrl: string): string {
  if (!imageUrl) {
    throw new TypeError("Image URL must not be blank.");
  }
  return `frame(${imageUrl})`;
}

/** This filter strips the ICC profile from the image. */
export const stripIcc = () => "strip_icc()";

/** This filter changes the image to grayscale. */
export const grayscale = () => "grayscale()";

/** This filter equalizes the color distribution in the image. */
export const equalize = () => "equalize()";

/**
 * This filter adds a blur effect to the image using the specified radius and sigma.
 * @param radius Radius used in the gaussian function to generate a matrix, maximum value is 150.
 *               The bigger the radius more blurred will be the image.
 * @param sigma Sigma used in the gaussian function.
 */
export function blur(radius: number, sigma = 0): string {
  checkInclusiveRange(radius, 1, 150, "Radius");
  if (sigma < 0) {
    throw new RangeError("Sigma must be greater than zero.");
  }
  return `blur(${radius},${sigma})`;
}

/** This filter tells thumbor not to upscale your images. */
export const noUpscale = () => "no_upscale()";

/**
 * This filter rotates the given image according to the angle passed.
 * @param angle The euler angle to rotate the image by.
 * Numbers greater or equal than 360 will be transformed to a equivalent angle between 0 and 359.
 */
export const rotate = (angle: number): string => `rotate(${angle})`;
