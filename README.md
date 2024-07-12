# @rsbuild/plugin-image-compress

An Rsbuild plugin to compress images via [@napi-rs/image](https://www.npmjs.com/package/@napi-rs/image) and [SVGO](https://www.npmjs.com/package/svgo).

With the image compression plugin, image assets used in the project can be compressed to reduce the output size without affecting the visual appearance of the image.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-image-compress">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-image-compress?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
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

## Options

The plugin accepts an array of compressor configuration options, each of which can be either a string or an object. The string can be the name of a built-in compressor and its default configuration enabled.
Or use the object format configuration and specify the compressor in the `use` field. The remaining fields of the object will be used as compressor configuration options.

By default, the plugin will enable `jpeg`, `png`, `ico` image compressors, which are equivalent to the following two examples:

```js
pluginImageCompress(["jpeg", "png", "ico"]);
```

```js
pluginImageCompress([{ use: "jpeg" }, { use: "png" }, { use: "ico" }]);
```

The default configuration can be overridden by specifying a configuration option.
For example, to allow the jpeg compressor to recognize new extension name and to set the quality of the png compressor.

```js
pluginImageCompress([
  { use: "jpeg", test: /\.(?:jpg|jpeg|jpe)$/ },
  { use: "png", minQuality: 50 },
  "ico",
]);
```

The default `png` compressor is lossy.
If you want to replace it with a lossless compressor, you can use the following configuration.

```js
pluginImageCompress(["jpeg", "pngLossless", "ico"]);
```

The list of configuration options will eventually be converted to the corresponding bundler loader configuration, so compressors follow the same bottom-to-top matching rule.

For example, the `png` compressor will take precedence over the `pngLossless` compressor for the following configuration:

```js
pluginImageCompress(["jpeg", "pngLossless", "ico", "png"]);
```

For more information on compressors, please visit [@napi-rs/image](https://image.napi.rs/docs).

## License

[MIT](./LICENSE).
