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

export type OptionCollection = {
  [K in Codecs]: K | FinalOptionCollection[K];
};

export type Options = OptionCollection[Codecs];

// Convert options - aligned with minimizer pattern, using include/exclude instead of condition
export type ConvertOptions<T extends Codecs = Codecs> = {
  use: OneOrMany<T>;
  test?: OneOrMany<RegExp>;
  include?: OneOrMany<RegExp>;
  exclude?: OneOrMany<RegExp>;
  to: Codecs;
  skipIfLarger?: boolean;
  maxFileSizeKB?: number;
} & CodecBaseOptions[T];

export interface OptimizeOptions {
  convert?: ConvertOptions<Codecs>[];
  compress?: Options[];
}

// Default conversion rules - convert common formats to modern formats
export const DEFAULT_CONVERT_OPTIONS: ConvertOptions<Codecs>[] = [
  {
    use: 'png',
    to: 'webp',
    quality: 80,
  },
  {
    use: 'jpeg',
    to: 'webp',
    quality: 80,
  },
  {
    use: 'png',
    to: 'avif',
    quality: 60,
  },
  {
    use: 'jpeg',
    to: 'avif',
    quality: 60,
  },
];

// Helper types for matching
export interface MatchObject {
  test?: OneOrMany<RegExp>;
  include?: OneOrMany<RegExp>;
  exclude?: OneOrMany<RegExp>;
}
