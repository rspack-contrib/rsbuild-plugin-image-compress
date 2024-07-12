import { defineConfig } from '@rsbuild/core';
import { pluginImageCompress } from '../src';

export default defineConfig({
  plugins: [pluginImageCompress()],
});
