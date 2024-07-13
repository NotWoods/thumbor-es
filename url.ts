import { encodeBase64 } from "jsr:@std/encoding/base64";
import { hmacSha1 } from "./hmac.ts";

/** Original size for image width or height. **/
export const ORIGINAL_SIZE = "orig";
/** Original size for image width or height. **/
export type OriginalSize = typeof ORIGINAL_SIZE;

/** Horizontal alignment for crop positioning. */
export type HorizontalAlign = "left" | "center" | "right";
/** Vertical alignment for crop positioning. */
export type VerticalAlign = "top" | "middle" | "bottom";

/** Orientation from where to get the pixel color for trim. */
export type TrimPixelColor = "top-left" | "bottom-right";

/** Image formats supported by Thumbor. */
export type ImageFormat = "webp" | "jpeg" | "avif" | "heic" | "png";

/** Style of resizing for 'fit-in'. */
export type FitInStyle = "fit-in" | "full-fit-in" | "adaptive-fit-in";

export interface ThumborUrlOptions {
  /**
   * Crop the image between two points.
   *
   * @throws {RangeError} if `top` or `left` are less than zero or
   * `bottom` or `right` are less than one or less than `top` or `left`, respectively.
   */
  crop?: {
    /** Top bound */
    top: number;
    /** Left bound */
    left: number;
    /** Bottom bound */
    bottom: number;
    /** Right bound */
    right: number;
  };
  /**
   * Removing surrounding space in image.
   */
  trim?:
    | boolean
    | {
        /** orientation from where to get the pixel color. */
        value: TrimPixelColor;
        /**
         * 0 - 442. This is the euclidian distance
         * between the colors of the reference pixel and the surrounding pixels is used.
         * @default 0
         */
        colorTolerance?: number;
      };
  /**
   * Constrain the image size inside the resized box, scaling as needed.
   *
   * fit-in means that the generated image should not be auto-cropped and otherwise just fit in an imaginary box specified by ExF.
   * If a full fit-in is specified, then the largest size is used for cropping (width instead of height, or the other way around).
   * If adaptive fit-in is specified, it inverts requested width and height if it would get a better image definition;
   *
   * `true` is equivalent to `fit-in`.
   */
  fitIn?: FitInStyle | boolean;
  /**
   * Use smart cropping for determining the important portion of an image.
   */
  smart?: boolean;
  /**
   * Add one or more filters to the image.
   *
   * If you have custom filters you can supply them as a string. (e.g. `"my_filter(1,2,3)"`).
   *
   * @param filters Filter strings.
   * @see {@link import('./filters.ts')} for available filters.
   *
   * @throws {TypeError} if any of the filters are a blank string.
   */
  filters?: readonly string[];
}

/** These options are only available if the image will be resized. */
export interface ThumborUrlResizedOptions extends ThumborUrlOptions {
  /**
   * Flip the image horizontally.
   */
  flipHorizontally?: boolean;
  /**
   * Flip the image vertically.
   */
  flipVertically?: boolean;
  /**
   * Set the horizontal alignment for the image when image gets cropped by resizing.
   */
  horizontalAlign?: HorizontalAlign;
  /**
   * Set the vertical alignment for the image when image gets cropped by resizing.
   */
  verticalAlign?: VerticalAlign;
}

export interface ResizeOptions {
  width: number | OriginalSize;
  height: number | OriginalSize;
}

export interface BaseBuildThumborUrlOptions {
  /**
   * Path to the image to be processed by Thumbor.
   */
  image: string;
  /**
   * Hostname of the Thumbor server, such as `http://localhost:8888` or `https://thumbor.example.com`.
   * If provided, the URL will be generated as an absolute URL.
   * If not provided, the URL will be generated as a relative URL.
   */
  host?: string;
  /**
   * Security key used to sign secure URLs.
   * Should be kept secret and have corresponding configuration on the Thumbor server.
   * @see https://thumbor.readthedocs.io/en/latest/configuration.html#security-key
   *
   * If not provided, the URL will be generated as an unsafe URL.
   * @see https://thumbor.readthedocs.io/en/latest/configuration.html#allow-unsafe-url
   */
  key?: string;
  /**
   * Either retrieve the image (default) or the metadata of the image.
   * @see https://thumbor.readthedocs.io/en/latest/usage.html#image-endpoint
   * @see https://thumbor.readthedocs.io/en/latest/usage.html#metadata-endpoint
   */
  endpoint?: "image" | "metadata";
  /**
   * Resize the image to be a specific width and height.
   * How it is resized can be further configured with other options.
   */
  resize?: ResizeOptions;
}

export function buildThumborUrl(
  args: BaseBuildThumborUrlOptions & { resize?: undefined } & ThumborUrlOptions
): Promise<string>;
export function buildThumborUrl(
  args: BaseBuildThumborUrlOptions & {
    resize: ResizeOptions;
  } & ThumborUrlResizedOptions
): Promise<string>;
export async function buildThumborUrl({
  image,
  host,
  key,
  endpoint,
  resize,
  ...options
}: BaseBuildThumborUrlOptions & ThumborUrlResizedOptions): Promise<string> {
  const {
    smart: isSmart,
    flipHorizontally,
    flipVertically,
    horizontalAlign: cropHorizontalAlign,
    verticalAlign: cropVerticalAlign,
    filters = [],
  } = options;
  const fitInStyle = options.fitIn === true ? "fit-in" : options.fitIn;

  // #region Validation

  if (!image) {
    throw new TypeError("Image must not be blank.");
  }
  if (filters.some((filter) => !filter.trim())) {
    throw new TypeError("Filter must not be blank.");
  }

  if (resize) {
    const { width, height } = resize;
    if (typeof width === "number" && width < 0) {
      throw new RangeError("Width must be a positive number.");
    }
    if (typeof height === "number" && height < 0) {
      throw new RangeError("Height must be a positive number.");
    }
    if (width === 0 && height === 0) {
      throw new RangeError("Both width and height must not be zero.");
    }
  }

  if (options.crop) {
    const { top, left, bottom, right } = options.crop;
    if (top < 0) {
      throw new Error("Top must be greater or equal to zero.");
    }
    if (left < 0) {
      throw new Error("Left must be greater or equal to zero.");
    }
    if (bottom < 1 || bottom <= top) {
      throw new Error("Bottom must be greater than zero and top.");
    }
    if (right < 1 || right <= left) {
      throw new Error("Right must be greater than zero and left.");
    }
  }

  const isTrim = !!options.trim;
  let trimPixelColor: TrimPixelColor | undefined;
  let trimColorTolerance: number = 0;
  if (options.trim && options.trim !== true) {
    const { value, colorTolerance = 0 } = options.trim;
    if (colorTolerance < 0 || colorTolerance > 442) {
      throw new RangeError("Color tolerance must be between 0 and 442.");
    }
    if (colorTolerance > 0 && !value) {
      throw new TypeError("Trim pixel color value must be defined.");
    }
    trimPixelColor = value;
    trimColorTolerance = colorTolerance;
  }

  // #endregion

  const meta = endpoint === "metadata";
  const assembleConfig = () => {
    let config = "";

    if (meta) {
      config += "meta/";
    }

    if (isTrim) {
      config += "trim";
      if (trimPixelColor) {
        config += `:${trimPixelColor}`;
        if (trimColorTolerance) {
          config += `:${trimColorTolerance}`;
        }
      }
      config += "/";
    }

    if (options.crop) {
      const { top, left, bottom, right } = options.crop;
      config += `${left}x${top}:${right}x${bottom}/`;
    }

    if (fitInStyle) {
      config += `${fitInStyle}/`;
    }

    if (resize) {
      if (flipHorizontally) {
        config += "-";
      }
      if (resize.width !== undefined) {
        config += `${resize.width}`;
      }
      config += "x";
      if (flipVertically) {
        config += "-";
      }
      if (resize.height !== undefined) {
        config += `${resize.height}`;
      }
      if (cropHorizontalAlign) {
        config += `/${cropHorizontalAlign}`;
      }
      if (cropVerticalAlign) {
        config += `/${cropVerticalAlign}`;
      }
      config += "/";
    }

    if (isSmart) {
      config += "smart/";
    }

    if (filters.length > 0) {
      config += `filters:${filters.join(":")}/`;
    }

    return config + image;
  };

  const config = assembleConfig();
  let path: string;
  if (key) {
    // If key is provided, return a safe URL.
    const encrypted = await hmacSha1(config, key);
    const encoded = encodeBase64(encrypted)
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    path = `${encoded}/${config}`;
  } else {
    path = meta ? config : `unsafe/${config}`;
  }

  // If host is provided, prepend it to the path.
  if (host) {
    return new URL(path, host).href;
  } else {
    return `/${path}`;
  }
}
