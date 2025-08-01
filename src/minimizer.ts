import { Buffer } from 'node:buffer';
import type { Rspack } from '@rsbuild/core';
import Codecs from './codecs.js';
import type { FinalOptions } from './types.js';

export const IMAGE_MINIMIZER_PLUGIN_NAME =
  '@rsbuild/plugin-image-compress/minimizer' as const;

export interface MinimizedResult {
  source: Rspack.sources.RawSource;
}

export class ImageMinimizerPlugin {
  name: string = IMAGE_MINIMIZER_PLUGIN_NAME;

  options: FinalOptions;

  constructor(options: FinalOptions) {
    this.options = options;
  }

  async optimize(
    compiler: Rspack.Compiler,
    compilation: Rspack.Compilation,
    assets: Record<string, Rspack.sources.Source>,
  ): Promise<void> {
    const cache = compilation.getCache(IMAGE_MINIMIZER_PLUGIN_NAME);
    const { RawSource } = compiler.webpack.sources;
    const { matchObject } = compiler.webpack.ModuleFilenameHelpers;

    const buildError = (error: unknown, file?: string, context?: string) => {
      const cause = error instanceof Error ? error : new Error();
      const message =
        file && context
          ? `"${file}" in "${context}" from Image Minimizer:\n${cause.message}`
          : cause.message;
      const ret = new compiler.webpack.WebpackError(message);

      if (error instanceof Error) {
        (ret as Error & { error: Error }).error = error;
      }

      return ret;
    };

    const codec = Codecs[this.options.use];
    if (!codec) {
      compilation.errors.push(
        buildError(new Error(`Codec ${this.options.use} is not supported`)),
      );
    }
    const opts = { ...codec.defaultOptions, ...this.options };

    const handleAsset = async (name: string) => {
      const info = compilation.getAsset(name)?.info;
      const fileName = name.split('?')[0];

      // 1. Skip double minimize assets from child compilation
      // 2. Test file by options (e.g. test, include, exclude)
      if (info?.minimized || !matchObject(opts, fileName)) {
        return;
      }

      const asset = compilation.getAsset(name);
      if (!asset) {
        return;
      }
      const { source: inputSource } = asset;

      // @ts-expect-error Hash type mismatch
      const eTag = cache.getLazyHashedEtag(inputSource);
      const cacheItem = cache.getItemCache(name, eTag);
      let result = await cacheItem.getPromise<MinimizedResult | undefined>();

      try {
        if (!result) {
          const input = inputSource.source();
          const buf = await codec.handler(
            typeof input === 'string' ? Buffer.from(input) : input,
            opts,
          );
          result = { source: new RawSource(buf) };
          await cacheItem.storePromise(result);
        }
        compilation.updateAsset(name, result.source, { minimized: true });
      } catch (error) {
        compilation.errors.push(buildError(error, name, compiler.context));
      }
    };
    const promises = Object.keys(assets).map((name) => handleAsset(name));
    await Promise.all(promises);
  }

  apply(compiler: Rspack.Compiler): void {
    const handleCompilation = (compilation: Rspack.Compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          // @ts-expect-error unsupported by Rspack
          additionalAssets: true,
        },
        (assets) => this.optimize(compiler, compilation, assets),
      );

      compilation.hooks.statsPrinter.tap(this.name, (stats) => {
        stats.hooks.print
          .for('asset.info.minimized')
          .tap(
            '@rsbuild/plugin-image-compress',
            (minimized, { green, formatFlag }) =>
              minimized && green && formatFlag
                ? green(formatFlag('minimized'))
                : '',
          );
      });
    };
    compiler.hooks.compilation.tap(this.name, handleCompilation);
  }
}
