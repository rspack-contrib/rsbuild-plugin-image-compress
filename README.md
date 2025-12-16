# @rsbuild/plugin-image-compress

An Rsbuild plugin to compress images via [@napi-rs/image](https://www.npmjs.com/package/@napi-rs/image) and [SVGO](https://www.npmjs.com/package/svgo).

With the image compression plugin, image assets used in the project can be compressed to reduce the output size without affecting the visual appearance of the image.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-image-compress">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-image-compress?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@rsbuild/plugin-image-compress?minimal=true"><img src="https://img.shields.io/npm/dm/@rsbuild/plugin-image-compress.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Usage

Install:

```bash
npm add @rsbuild/plugin-image-compress -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginImageCompress } from "@rsbuild/plugin-image-compress";

export default {
  plugins: [pluginImageCompress()],
};
```

This plugin is compatible with both Rsbuild and Rspack. If you are using Rspack instead of Rsbuild, you can import the `ImageMinimizerPlugin` from the package, see [Rspack Usage](#rspack-usage).

## Default Compressors

By default, the plugin will enable `jpeg`, `png`, `ico` image compressors, which are equivalent to the following two examples:

```js
pluginImageCompress(["jpeg", "png", "ico"]);
```

```js
pluginImageCompress([{ use: "jpeg" }, { use: "png" }, { use: "ico" }]);
```

## Supported Compressors

The plugin supports the following compressors:

- `jpeg`: For JPEG images.
- `png`: For PNG images.
- `pngLossless`: For PNG images with lossless compression.
- `ico`: For ICO images.
- `svg`: For SVG images.
- `avif`: For AVIF images.
- `webp`: For WEBP images.

Only SVG are compressed by `svgo`, other compressors are compressed by `@napi-rs/image`.

## Options

The plugin accepts an array of compressor configuration options, each of which can be either a string or an object. The string can be the name of a built-in compressor and its default configuration enabled.

Or use the object format configuration and specify the compressor in the `use` field. The remaining fields of the object will be used as compressor configuration options.

The default configuration can be overridden by specifying a configuration option.
For example, to allow the jpeg compressor to recognize new extension name and to set the quality of the png compressor.

```js
pluginImageCompress([
  // Options for @napi-rs/image `compressJpeg` method
  { use: "jpeg", test: /\.(?:jpg|jpeg|jpe)$/ },
  // Options for @napi-rs/image `pngQuantize` method
  { use: "png", minQuality: 50 },
  // Options for @napi-rs/image `avif` method
  { use: "avif", quality: 80 },
  // Options for @napi-rs/image `webp` method
  { use: "webp", quality: 80 },
  // Options for svgo
  { use: "svg", floatPrecision: 2 },
  // No options yet
  { use: "ico" },
]);
```

For more information on compressors, please visit [@napi-rs/image](https://image.napi.rs/docs).

## Lossless PNG

The default `png` compressor is lossy. If you want to replace it with a lossless compressor, you can use the following configuration.

```js
pluginImageCompress(["jpeg", "pngLossless", "ico"]);
```

The list of configuration options will eventually be converted to the corresponding bundler loader configuration, so compressors follow the same bottom-to-top matching rule.

For example, the `png` compressor will take precedence over the `pngLossless` compressor for the following configuration:

```js
pluginImageCompress(["jpeg", "pngLossless", "ico", "png"]);
```

## Rspack Usage

The plugin is also compatible with Rspack.

If you are using Rspack instead of Rsbuild, you can import the `ImageMinimizerPlugin` from the package, use it in the [optimization.minimizer](https://rspack.rs/config/optimization#optimizationminimizer) array.

```ts
// rspack.config.mjs
import { ImageMinimizerPlugin } from "@rsbuild/plugin-image-compress";
import { defineConfig } from "@rspack/cli";

export default defineConfig({
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  optimization: {
    minimizer: [
      // Use `...` to preserve the default JS and CSS minimizers of Rspack
      "...",
      // Add the image minimizer plugins
      new ImageMinimizerPlugin({
        use: "jpeg",
        test: /\.(?:jpg|jpeg)$/,
      }),
      new ImageMinimizerPlugin({
        use: "png",
        test: /\.png$/,
        maxQuality: 50,
      }),
      new ImageMinimizerPlugin({
        use: "avif",
        test: /\.avif$/,
        quality: 80,
      }),
      new ImageMinimizerPlugin({
        use: "webp",
        test: /\.webp$/,
        quality: 80,
      }),
      new ImageMinimizerPlugin({
        use: "svg",
        test: /\.svg$/,
        floatPrecision: 2,
      }),
      new ImageMinimizerPlugin({
        use: "ico",
        test: /\.(?:ico|icon)$/,
      }),
    ],
  },
});
```

## License

[MIT](./LICENSE).
