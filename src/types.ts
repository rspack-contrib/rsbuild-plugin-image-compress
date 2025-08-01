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
