import { defineConfig } from '@rsbuild/core';
import { pluginImageConvert } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageConvert([
      {
        use: 'png',
        to: 'avif',
        quality: 80,
      },
    ]),
  ],
  output: {
    filename: {
      image: '[name][ext]',
    },
  },
});
