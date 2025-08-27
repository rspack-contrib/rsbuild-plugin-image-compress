import { defineConfig } from '@rsbuild/core';
import { pluginImageConvert } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageConvert([
      {
        use: 'jpeg',
        to: 'jpeg',
        quality: 30,
      },
      {
        use: 'webp',
        to: 'webp',
        quality: 30,
      },
    ]),
  ],
  output: {
    filename: {
      image: '[name][ext]',
    },
  },
});
