import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadConfigFromDir(configDir: string) {
  const { loadConfig } = await import('@rsbuild/core');
  return loadConfig({ cwd: configDir });
}

test('should convert images to WebP format', async () => {
  const configDir = join(__dirname, 'webp');
  const config = await loadConfigFromDir(configDir);

  const rsbuild = await createRsbuild({
    cwd: configDir,
    rsbuildConfig: config.content,
  });

  await rsbuild.build();

  // Check that WebP is bundled
  const distDir = join(configDir, 'dist/static/image');

  // the those webp files should exist
  const jpegToWebp = readFileSync(join(distDir, 'source-jpeg.webp'));
  const pngToWebp = readFileSync(join(distDir, 'source-png.webp'));

  // and not be empty empty
  expect(jpegToWebp.length).toBeGreaterThan(0);
  expect(pngToWebp.length).toBeGreaterThan(0);

  // and have the right magic bytes that determin type
  // some reference, a better one would be better but I cannot find.
  // https://skia.googlesource.com/external/github.com/google/wuffs/+/HEAD/release/c/wuffs-v0.3.c
  // a bit overkill to check obscure magic bytes
  // but it guarantees no bug swaping conversion types, extension & size are no guarantees
  expect(jpegToWebp.readUInt32BE(0)).toBe(0x52494646); // RIFF
  expect(jpegToWebp.readUInt32BE(8)).toBe(0x57454250); // WEBP

  expect(pngToWebp.readUInt32BE(0)).toBe(0x52494646); // RIFF
  expect(pngToWebp.readUInt32BE(8)).toBe(0x57454250); // WEBP
});

test('should convert source images to AVIF format', async () => {
  const configDir = join(__dirname, 'avif');
  const config = await loadConfigFromDir(configDir);

  const rsbuild = await createRsbuild({
    cwd: configDir,
    rsbuildConfig: config.content,
  });

  await rsbuild.build();

  const distDir = join(configDir, 'dist/static/image');

  const avifContent = readFileSync(join(distDir, 'image.avif'));
  expect(avifContent.length).toBeGreaterThan(0);

  expect(avifContent.readUInt32BE(4)).toBe(0x66747970); //ftyp
  expect(avifContent.readUInt32BE(8)).toBe(0x61766966); // avif
});

test('should produce smaller files with lower quality settings', async () => {
  // a naive way to check that option settings are honored
  // TODO: unit tests shall cover lower level functions directly
  // end to end tests never end
  const highQualityDir = join(__dirname, 'high-quality');
  const highQualityConfig = await loadConfigFromDir(highQualityDir);

  const rsbuildHighQuality = await createRsbuild({
    cwd: highQualityDir,
    rsbuildConfig: highQualityConfig.content,
  });
  await rsbuildHighQuality.build();

  const lowQualityDir = join(__dirname, 'low-quality');
  const lowQualityConfig = await loadConfigFromDir(lowQualityDir);

  const rsbuildLowQuality = await createRsbuild({
    cwd: lowQualityDir,
    rsbuildConfig: lowQualityConfig.content,
  });
  await rsbuildLowQuality.build();

  const highQualitySize = readFileSync(
    join(highQualityDir, 'dist/static/image/image.webp'),
  ).length;
  const lowQualitySize = readFileSync(
    join(lowQualityDir, 'dist/static/image/image.webp'),
  ).length;

  expect(lowQualitySize).toBeLessThan(highQualitySize);
});

test('should not convert images in development mode', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  try {
    const configDir = join(__dirname, 'webp');
    const config = await loadConfigFromDir(configDir);

    const rsbuild = await createRsbuild({
      cwd: configDir,
      rsbuildConfig: config.content,
    });

    await rsbuild.build();

    const distDir = join(configDir, 'dist/static/image');

    expect(() => readFileSync(join(distDir, 'image.webp'))).toThrow();

    // let's also check the original images are actually there
    // TODO: reconsider and move,
    // not sure an rsbuild plugin can even potentially touch sources.
    const jpegContent = readFileSync(join(distDir, 'source-jpeg.jpeg'));
    const pngContent = readFileSync(join(distDir, 'source-png.png'));
    expect(jpegContent.length).toBeGreaterThan(0);
    expect(pngContent.length).toBeGreaterThan(0);
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});
