# @rsbuild/plugin-image-compress

An Rsbuild plugin to compress images via [@napi-rs/image](https://www.npmjs.com/package/@napi-rs/image) and [SVGO](https://www.npmjs.com/package/svgo).

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

### foo

Some description.

- Type: `string`
- Default: `undefined`
- Example:

```js
pluginImageCompress({
  foo: "bar",
});
```

## License

[MIT](./LICENSE).
