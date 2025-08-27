import { Buffer } from 'node:buffer';
import path from 'node:path';
import type { Rspack } from '@rsbuild/core';
import codecs from './codecs.js';
import type { Codecs, ConvertOptions } from './types.js';
import { buildError, formatFileSize } from './utils.js';

export const IMAGE_CONVERTER_PLUGIN_NAME = 'rsbuild:image-converter' as const;

export class ImageConverterPlugin {
  name = IMAGE_CONVERTER_PLUGIN_NAME;

  private options: ConvertOptions[];

  constructor(options: ConvertOptions[] | ConvertOptions) {
    this.options = Array.isArray(options) ? options : [options];
  }

  private shouldConvert(
    fileName: string,
    originalFormat: string,
    option: ConvertOptions,
    compiler: Rspack.Compiler,
  ): boolean {
    const { matchObject } = compiler.webpack.ModuleFilenameHelpers;

    const matchProps = {
      test: option.test,
      include: option.include,
      exclude: option.exclude,
    };

    if (!matchObject(matchProps, fileName)) {
      return false;
    }

    const useCodecs = Array.isArray(option.use) ? option.use : [option.use];
    if (!useCodecs.includes(originalFormat as Codecs)) {
      return false;
    }

    return true;
  }

  async optimize(
    compiler: Rspack.Compiler,
    compilation: Rspack.Compilation,
    assets: Record<string, Rspack.sources.Source>,
  ): Promise<void> {
    const { RawSource } = compiler.webpack.sources;

    const handleAsset = async (name: string) => {
      const fileName = name.split('?')[0];
      const ext = path
        .extname(fileName)
        .toLowerCase()
        .replace('.', '') as Codecs;

      const assetInfo = compilation.getAsset(name)?.info;
      if (assetInfo?.converted) {
        return;
      }

      // Find the first matching option for this asset
      const matchingOption = this.options.find((option) =>
        this.shouldConvert(fileName, ext, option, compiler),
      );

      if (!matchingOption) {
        return;
      }

      const asset = compilation.getAsset(name);
      if (!asset) {
        return;
      }

      const { source: inputSource, info } = asset;
      const input = inputSource.source();
      const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);

      if (
        matchingOption.maxFileSizeKB &&
        buffer.length > matchingOption.maxFileSizeKB * 1024
      ) {
        compilation.warnings.push(
          buildError(
            compiler,
            new Error(
              `File too large for conversion (${formatFileSize(buffer.length)} > ${matchingOption.maxFileSizeKB}KB)`,
            ),
            name,
            compiler.context,
          ),
        );
        return;
      }

      try {
        const targetCodec = codecs[matchingOption.to];
        // Extract only the codec-specific options (exclude conversion-specific options)
        const { to, skipIfLarger, maxFileSizeKB, ...codecOptions } =
          matchingOption;
        const targetOptions = {
          ...targetCodec.defaultOptions,
          ...codecOptions,
        };

        const convertedBuffer = await targetCodec.handler(
          buffer,
          targetOptions,
        );

        if (
          matchingOption.skipIfLarger &&
          convertedBuffer.length > buffer.length
        ) {
          compilation.warnings.push(
            buildError(
              compiler,
              new Error(
                `Conversion resulted in larger file (${formatFileSize(convertedBuffer.length)} > ${formatFileSize(buffer.length)})`,
              ),
              name,
              compiler.context,
            ),
          );
          return;
        }

        const convertedPath = this.getConvertedPath(name, matchingOption.to);

        compilation.deleteAsset(name);

        compilation.emitAsset(convertedPath, new RawSource(convertedBuffer), {
          ...info,
          converted: true,
          originalFormat: ext,
          convertedFormat: matchingOption.to,
        });
      } catch (error) {
        compilation.errors.push(
          buildError(compiler, error, name, compiler.context),
        );
      }
    };

    const promises = Object.keys(assets)
      .filter((name) => !name.includes('?url') && !name.includes('?inline'))
      .map((name) => handleAsset(name));

    await Promise.all(promises);
  }

  private getConvertedPath(originalPath: string, targetFormat: Codecs): string {
    const ext = path.extname(originalPath);
    return originalPath.replace(new RegExp(`${ext}$`), `.${targetFormat}`);
  }

  apply(compiler: Rspack.Compiler): void {
    const handleCompilation = (compilation: Rspack.Compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => this.optimize(compiler, compilation, assets),
      );

      compilation.hooks.statsPrinter.tap(this.name, (stats) => {
        stats.hooks.print
          .for('asset.info.converted')
          .tap(
            IMAGE_CONVERTER_PLUGIN_NAME,
            (converted, { green, formatFlag }) =>
              converted && green && formatFlag
                ? green(formatFlag('converted'))
                : '',
          );
      });
    };
    compiler.hooks.compilation.tap(this.name, handleCompilation);
  }
}
