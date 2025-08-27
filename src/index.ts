import assert from 'node:assert';
import type { RsbuildPlugin } from '@rsbuild/core';
import { ImageConverterPlugin } from './converter.js';
import { ImageMinimizerPlugin } from './minimizer.js';
import type {
  Codecs,
  ConvertOptions,
  OptimizeOptions,
  Options,
} from './types.js';
import { withDefaultOptions } from './utils.js';

export type PluginImageCompressOptions = Options[];
export const DEFAULT_OPTIONS: Codecs[] = ['jpeg', 'png', 'ico'];

export interface IPluginImageCompress {
  (...options: Options[]): RsbuildPlugin;
  (options: Options[]): RsbuildPlugin;
}

export interface IPluginImageConvert {
  (...options: ConvertOptions[]): RsbuildPlugin;
  (options: ConvertOptions[]): RsbuildPlugin;
}

export type IPluginImageOptimize = (options: OptimizeOptions) => RsbuildPlugin;

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

const castConvertOptions = (
  args: (ConvertOptions | ConvertOptions[])[],
): ConvertOptions[] => {
  const head = args[0];
  if (Array.isArray(head)) {
    return head;
  }
  const ret: ConvertOptions[] = [];
  for (const arg of args) {
    assert(!Array.isArray(arg));
    ret.push(arg);
  }
  return ret;
};

const normalizeOptions = (options: Options[]) => {
  const opts = options.length ? options : DEFAULT_OPTIONS;
  return opts.map((opt) => withDefaultOptions(opt));
};

const normalizeConvertOptions = (
  options: ConvertOptions[],
): ConvertOptions[] => {
  return options.map((option) => {
    const baseOptions = withDefaultOptions({
      use: Array.isArray(option.use) ? option.use[0] : option.use,
    } as Options);
    return {
      ...baseOptions,
      use: option.use,
      to: option.to,
      skipIfLarger: option.skipIfLarger,
      maxFileSizeKB: option.maxFileSizeKB,
    } as ConvertOptions;
  });
};

export const PLUGIN_IMAGE_COMPRESS_NAME = 'rsbuild:image-compress';
export const PLUGIN_IMAGE_CONVERT_NAME = 'rsbuild:image-convert';
export const PLUGIN_IMAGE_OPTIMIZE_NAME = 'rsbuild:image-optimize';

export { ImageMinimizerPlugin, ImageConverterPlugin };

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

export const pluginImageConvert: IPluginImageConvert = (
  ...args
): RsbuildPlugin => ({
  name: PLUGIN_IMAGE_CONVERT_NAME,

  setup(api) {
    const opts = normalizeConvertOptions(castConvertOptions(args));

    api.modifyBundlerChain((chain, { isDev }) => {
      if (isDev) return;

      chain.plugin('image-converter').use(ImageConverterPlugin, [opts]);
    });

    api.modifyRspackConfig((_, { addRules }) => {
      const targetFormats = opts.map((option) => option.to);
      const uniqueFormats = [...new Set(targetFormats)];

      for (const format of uniqueFormats) {
        addRules([
          {
            test: new RegExp(`\\.${format}$`),
            type: 'asset/resource',
          },
        ]);
      }
    });
  },
});

export const pluginImageOptimize: IPluginImageOptimize = (
  options,
): RsbuildPlugin => ({
  name: PLUGIN_IMAGE_OPTIMIZE_NAME,

  setup(api) {
    const { convert = [], compress = [] } = options;
    const normalizedConvertOptions = normalizeConvertOptions(convert);

    if (convert.length > 0) {
      api.modifyBundlerChain((chain, { isDev }) => {
        if (isDev) return;
        chain
          .plugin('image-converter')
          .use(ImageConverterPlugin, [normalizedConvertOptions]);
      });

      api.modifyRspackConfig((_, { addRules }) => {
        const targetFormats = convert.map((option) => option.to);
        const uniqueFormats = [...new Set(targetFormats)];

        for (const format of uniqueFormats) {
          addRules([
            {
              test: new RegExp(`\\.${format}$`),
              type: 'asset/resource',
            },
          ]);
        }
      });
    }

    if (compress.length > 0) {
      const opts = normalizeOptions(castOptions(compress));

      api.modifyBundlerChain((chain, { isDev }) => {
        if (isDev) return;

        chain.optimization.minimize(true);

        for (const opt of opts) {
          chain.optimization
            .minimizer(`image-compress-${opt.use}`)
            .use(ImageMinimizerPlugin, [opt]);
        }
      });
    }
  },
});

export const pluginImageCompressWithConversion = pluginImageOptimize;
