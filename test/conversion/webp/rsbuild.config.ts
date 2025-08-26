import { defineConfig } from '@rsbuild/core';
import { pluginImageCompress } from '../../../src/index';

export default defineConfig({
  plugins: [
    pluginImageCompress(
      {
        use: 'png',
        test: /\.png$/,
        conversion: {
          convertTo: 'webp',
        },
      },
      {
        use: 'jpeg',
        test: /\.jpeg$/,
        conversion: {
          convertTo: 'webp',
        },
      },
    ),
  ],
  output: {
    filename: {
      image: '[name][ext]',
    },
  },
});
