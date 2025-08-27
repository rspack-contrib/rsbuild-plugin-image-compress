import type { Buffer } from 'node:buffer';
import type {
  AvifConfig,
  JpegCompressOptions,
  PNGLosslessOptions,
  PngQuantOptions,
} from '@napi-rs/image';
import type { Config as SvgoConfig } from 'svgo';

export type OneOrMany<T> = T | T[];

export interface WebpTransformOptions {
  quality?: number;
  signal?: AbortSignal;
}

export interface CodecBaseOptions {
  jpeg: JpegCompressOptions;
  png: PngQuantOptions;
  pngLossless: PNGLosslessOptions;
  ico: Record<string, unknown>;
  svg: SvgoConfig;
  avif: AvifConfig;
  webp: WebpTransformOptions;
}

export interface BaseCompressOptions<T extends Codecs> {
  use: T;
  test?: OneOrMany<RegExp>;
  include?: OneOrMany<RegExp>;
  exclude?: OneOrMany<RegExp>;
}

export type FinalOptionCollection = {
  [K in Codecs]: BaseCompressOptions<K> & CodecBaseOptions[K];
};

export type FinalOptions = FinalOptionCollection[Codecs];

export interface Codec<T extends Codecs> {
  handler: (buf: Buffer, options: CodecBaseOptions[T]) => Promise<Buffer>;
  defaultOptions: Omit<FinalOptionCollection[T], 'use'>;
}

export type Codecs = keyof CodecBaseOptions;

export type ConvertibleCodecs = Exclude<Codecs, 'svg' | 'ico'>;

export type OptionCollection = {
  [K in Codecs]: K | FinalOptionCollection[K];
};

export type Options = OptionCollection[Codecs];

export type ConvertOptions<T extends ConvertibleCodecs = ConvertibleCodecs> = {
  use: OneOrMany<T>;
  test?: OneOrMany<RegExp>;
  include?: OneOrMany<RegExp>;
  exclude?: OneOrMany<RegExp>;
  to: ConvertibleCodecs;
  skipIfLarger?: boolean;
  maxFileSizeKB?: number;
} & CodecBaseOptions[T];

export interface OptimizeOptions {
  convert?: ConvertOptions<ConvertibleCodecs>[];
  compress?: Options[];
}

export const DEFAULT_CONVERT_OPTIONS: ConvertOptions<ConvertibleCodecs>[] = [
  {
    use: 'png',
    to: 'webp',
    quality: 80,
    skipIfLarger: true,
  },
  {
    use: 'jpeg',
    to: 'webp',
    quality: 80,
    skipIfLarger: true,
  },
  {
    use: 'png',
    to: 'avif',
    quality: 60,
    skipIfLarger: true,
  },
  {
    use: 'jpeg',
    to: 'avif',
    quality: 60,
    skipIfLarger: true,
  },
];

export interface MatchObject {
  test?: OneOrMany<RegExp>;
  include?: OneOrMany<RegExp>;
  exclude?: OneOrMany<RegExp>;
}
