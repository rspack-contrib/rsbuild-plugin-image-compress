import assert from 'node:assert';
import type { Rspack } from '@rsbuild/core';
import codecs from './codecs.js';
import type { FinalOptions, Options } from './types.js';

export const withDefaultOptions = (opt: Options): FinalOptions => {
  const options = typeof opt === 'string' ? { use: opt } : opt;
  const { defaultOptions } = codecs[options.use];
  const ret = { ...defaultOptions, ...options };
  assert('test' in ret);
  return ret;
};

export const buildError = (
  compiler: Rspack.Compiler,
  error: unknown,
  file?: string,
  context?: string,
) => {
  const cause = error instanceof Error ? error : new Error(String(error));
  const message =
    file && context
      ? `Image conversion failed for "${file}" in "${context}": ${cause.message}`
      : `Image conversion failed: ${cause.message}`;

  const ret = new compiler.webpack.WebpackError(message);

  if (error instanceof Error) {
    (ret as Error & { error: Error }).error = error;
  }

  return ret;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};
