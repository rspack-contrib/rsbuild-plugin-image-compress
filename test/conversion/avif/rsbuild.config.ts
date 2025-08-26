import { defineConfig } from '@rsbuild/core';
import { pluginImageCompress } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageCompress({
      use: 'jpeg',
      test: /\.(jpg|jpeg)$/,
      conversion: {
        convertTo: 'avif',
      },
    }),
  ],
  output: {
    filename: {
      image: '[name][ext]',
    },
  },
});
