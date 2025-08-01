import { defineConfig } from '@rsbuild/core';
import { pluginImageCompress } from '@rsbuild/plugin-image-compress';

export default defineConfig({
  plugins: [pluginImageCompress(['jpeg', 'png', 'ico', 'svg', 'avif', 'webp'])],
  output: {
    filename: {
      svg: '[name][ext]',
      image: '[name][ext]',
    },
  },
});
