import { defineConfig } from '@rsbuild/core';
import { pluginImageCompress } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageCompress({
      use: 'jpeg',
      test: /\.(jpg|jpeg)$/,
      conversion: {
        convertTo: 'webp',
      },
      quality: 90,
    }),
  ],
  output: {
    filename: {
      image: '[name][ext]',
    },
  },
});
