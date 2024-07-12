import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginImageCompress } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should compress image with use plugin-image-compress', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginImageCompress()],
    },
  });

  await expect(rsbuild.build()).resolves.toBeDefined();

  const jpeg = readFileSync(
    join(__dirname, 'dist/static/image/image.jpeg'),
    'utf-8',
  );
  const png = readFileSync(
    join(__dirname, 'dist/static/image/image.png'),
    'utf-8',
  );
  const svg = readFileSync(
    join(__dirname, 'dist/static/image/mobile.svg'),
    'utf-8',
  );
  // const ico = names.find((item) => item.endsWith('.ico'))!;

  const assetsDir = join(__dirname, '../assets');
  const originJpeg = readFileSync(join(assetsDir, 'image.jpeg'), 'utf-8');
  const originPng = readFileSync(join(assetsDir, 'image.png'), 'utf-8');
  const originSvg = readFileSync(join(assetsDir, 'mobile.svg'), 'utf-8');
  // const originIco = readFileSync(join(assetsDir, 'image.ico'), 'utf-8');

  expect(outputs[jpeg].length).toBeLessThan(originJpeg.length);
  expect(outputs[png].length).toBeLessThan(originPng.length);
  expect(outputs[svg].length).toBeLessThan(originSvg.length);
  // TODO ico file size is not less than origin
  // expect(outputs[ico].length).toBeLessThan(originIco.length);
});
