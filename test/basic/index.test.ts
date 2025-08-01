import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild, loadConfig } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should compress image with use plugin-image-compress', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: (await loadConfig({ cwd: __dirname })).content,
  });

  await rsbuild.build();

  const jpeg = readFileSync(
    join(__dirname, 'dist/static/image/image.jpeg'),
    'utf-8',
  );
  const png = readFileSync(
    join(__dirname, 'dist/static/image/image.png'),
    'utf-8',
  );
  const svg = readFileSync(
    join(__dirname, 'dist/static/svg/mobile.svg'),
    'utf-8',
  );
  const avif = readFileSync(
    join(__dirname, 'dist/static/image/image.avif'),
    'utf-8',
  );

  const webp = readFileSync(
    join(__dirname, 'dist/static/image/image.webp'),
    'utf-8',
  );

  // const ico = names.find((item) => item.endsWith('.ico'))!;

  const assetsDir = join(__dirname, '../assets');
  const originJpeg = readFileSync(join(assetsDir, 'image.jpeg'), 'utf-8');
  const originPng = readFileSync(join(assetsDir, 'image.png'), 'utf-8');
  const originSvg = readFileSync(join(assetsDir, 'mobile.svg'), 'utf-8');
  const originAvif = readFileSync(join(assetsDir, 'image.avif'), 'utf-8');
  const originWebp = readFileSync(join(assetsDir, 'image.webp'), 'utf-8');

  // const originIco = readFileSync(join(assetsDir, 'image.ico'), 'utf-8');

  expect(jpeg.length).toBeLessThan(originJpeg.length);
  expect(png.length).toBeLessThan(originPng.length);
  expect(svg.length).toBeLessThan(originSvg.length);
  expect(avif.length).toBeLessThan(originAvif.length);
  expect(webp.length).toBeLessThan(originWebp.length);

  // TODO ico file size is not less than origin
  // expect(outputs[ico].length).toBeLessThan(originIco.length);
});
