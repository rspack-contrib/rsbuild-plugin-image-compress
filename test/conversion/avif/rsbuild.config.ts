import { defineConfig } from '@rsbuild/core';
import { pluginImageConvert } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageConvert([
      {
        use: 'jpeg',
        to: 'avif',
        test: /\.(jpg|jpeg)$/,
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
