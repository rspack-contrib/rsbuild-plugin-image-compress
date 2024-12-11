import { Buffer } from 'node:buffer';
import {
  Transformer,
  compressJpeg,
  losslessCompressPng,
  pngQuantize,
} from '@napi-rs/image';
import svgo from 'svgo';
import type { Codec, Codecs } from '../types.js';

export const jpegCodec: Codec<'jpeg'> = {
  handler(buf, options) {
    return compressJpeg(buf, options);
  },
  defaultOptions: {
    test: /\.(?:jpg|jpeg)$/,
  },
};

export const pngCodec: Codec<'png'> = {
  handler(buf, options) {
    return pngQuantize(buf, options);
  },
  defaultOptions: {
    test: /\.png$/,
  },
};

export const pngLosslessCodec: Codec<'pngLossless'> = {
  handler(buf, options) {
    return losslessCompressPng(buf, options);
  },
  defaultOptions: {
    test: /\.png$/,
  },
};

export const icoCodec: Codec<'ico'> = {
  handler(buf) {
    return new Transformer(buf).ico();
  },
  defaultOptions: {
    test: /\.(?:ico|icon)$/,
  },
};

export const avifCodec: Codec<'avif'> = {
  handler(buf, options) {
    return new Transformer(buf).avif(options);
  },
  defaultOptions: {
    test: /\.avif$/,
  },
};

export const svgCodec: Codec<'svg'> = {
  async handler(buf, options) {
    const result = svgo.optimize(buf.toString(), options);
    return Buffer.from(result.data);
  },
  defaultOptions: {
    test: /\.svg$/,
  },
};

// biome-ignore lint/suspicious/noExplicitAny:allow any
const codecs: Record<Codecs, Codec<any>> = {
  jpeg: jpegCodec,
  png: pngCodec,
  pngLossless: pngLosslessCodec,
  ico: icoCodec,
  svg: svgCodec,
  avif: avifCodec,
};

export default codecs;
