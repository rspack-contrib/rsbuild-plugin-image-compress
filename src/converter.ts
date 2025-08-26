import { Buffer } from 'node:buffer';
import path from 'node:path';
import type { Rspack } from '@rsbuild/core';
import codecs from './codecs.js';
import type { Codecs, FinalOptions } from './types.js';

export class ImageConverterPlugin {
  name = 'rsbuild:image-converter';

  private convertedAssets = new Map<string, string>();

  constructor(private options: FinalOptions[]) {}

  async optimize(
    compiler: Rspack.Compiler,
    compilation: Rspack.Compilation,
    assets: Record<string, Rspack.sources.Source>,
  ): Promise<void> {
    const { RawSource } = compiler.webpack.sources;
    const { matchObject } = compiler.webpack.ModuleFilenameHelpers;

    const buildError = (error: unknown, file?: string, context?: string) => {
      const cause = error instanceof Error ? error : new Error();
      const message =
        file && context
          ? `"${file}" in "${context}" from Image Converter:\n${cause.message}`
          : cause.message;
      const ret = new compiler.webpack.WebpackError(message);

      if (error instanceof Error) {
        (ret as Error & { error: Error }).error = error;
      }

      return ret;
    };

    const handleAsset = async (name: string) => {
      const fileName = name.split('?')[0];

      const conversionOpt = this.options.find(
        (opt) => opt.conversion?.convertTo && matchObject(opt, fileName),
      );

      if (!conversionOpt?.conversion?.convertTo) {
        return;
      }

      const targetFormat = conversionOpt.conversion.convertTo;

      const ext = path.extname(fileName).toLowerCase().replace('.', '');
      if (ext === targetFormat) {
        return;
      }

      const asset = compilation.getAsset(name);
      if (!asset) {
        return;
      }

      const { source: inputSource } = asset;
      const input = inputSource.source();
      const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);

      try {
        const targetCodec = codecs[targetFormat];
        const targetOptions = {
          ...targetCodec.defaultOptions,
          ...conversionOpt,
        };

        const convertedBuffer = await targetCodec.handler(
          buffer,
          targetOptions,
        );

        const convertedPath = this.getConvertedPath(name, targetFormat);

        compilation.emitAsset(convertedPath, new RawSource(convertedBuffer));
        compilation.deleteAsset(name);

        this.convertedAssets.set(name, convertedPath);
      } catch (error) {
        compilation.errors.push(buildError(error, name, compiler.context));
      }
    };

    const promises = Object.keys(assets).map((name) => handleAsset(name));
    await Promise.all(promises);
  }

  private getConvertedPath(originalPath: string, targetFormat: Codecs): string {
    const ext = path.extname(originalPath);
    return originalPath.replace(new RegExp(`${ext}$`), `.${targetFormat}`);
  }

  apply(compiler: Rspack.Compiler): void {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE - 1, // Run before compression
        },
        (assets) => this.optimize(compiler, compilation, assets),
      );
    });
  }
}
