// TODO: remove magic numbers from test suite
// TODO: confirm all those early bites are correct
// I don't think they need to be reliable, that's for the image lib to make sure
import { readFileSync } from 'node:fs';

export function isWebP(buffer: Buffer): boolean {
  return (
    buffer.readUInt32BE(0) === 0x52494646 && // RIFF
    buffer.readUInt32BE(8) === 0x57454250
  ); // WEBP
}

export function isAVIF(buffer: Buffer): boolean {
  return (
    buffer.readUInt32BE(4) === 0x66747970 && // ftyp
    buffer.readUInt32BE(8) === 0x61766966
  ); // avif
}

export function isJPEG(buffer: Buffer): boolean {
  return buffer.readUInt16BE(0) === 0xffd8; // that's JPEG SOI marker
}

export function isPNG(buffer: Buffer): boolean {
  return buffer.readUInt32BE(0) === 0x89504e47; // PNG sign
}

export function getFileSize(filePath: string): number {
  return readFileSync(filePath).length;
}
