import assert from 'node:assert';
import type { RsbuildPlugin } from '@rsbuild/core';
import { ImageMinimizerPlugin } from './minimizer.js';
import type { Codecs, Options } from './types.js';
import { withDefaultOptions } from './utils.js';

export type PluginImageCompressOptions = Options[];
export const DEFAULT_OPTIONS: Codecs[] = ['jpeg', 'png', 'ico'];

export interface IPluginImageCompress {
  (...options: Options[]): RsbuildPlugin;
  (options: Options[]): RsbuildPlugin;
}

const castOptions = (args: (Options | Options[])[]): Options[] => {
  const head = args[0];
  // expect [['png', { use: 'jpeg' }]]
  if (Array.isArray(head)) {
    return head;
  }
  // expect ['png', { use: 'jpeg' }]
  const ret: Options[] = [];
  for (const arg of args) {
    assert(!Array.isArray(arg));
    ret.push(arg);
  }
  return ret;
};

const normalizeOptions = (options: Options[]) => {
  const opts = options.length ? options : DEFAULT_OPTIONS;
  const normalized = opts.map((opt) => withDefaultOptions(opt));
  return normalized;
};

export const PLUGIN_IMAGE_COMPRESS_NAME = 'rsbuild:image-compress';

export { ImageMinimizerPlugin };

/** Options enable by default: {@link DEFAULT_OPTIONS} */
export const pluginImageCompress: IPluginImageCompress = (
  ...args
): RsbuildPlugin => ({
  name: PLUGIN_IMAGE_COMPRESS_NAME,

  setup(api) {
    const opts = normalizeOptions(castOptions(args));

    api.modifyBundlerChain((chain, { isDev }) => {
      if (isDev) {
        return;
      }

      chain.optimization.minimize(true);

      for (const opt of opts) {
        chain.optimization
          .minimizer(`image-compress-${opt.use}`)
          .use(ImageMinimizerPlugin, [opt]);
      }
    });
  },
});
