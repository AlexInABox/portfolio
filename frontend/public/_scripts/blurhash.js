// NOTE: This file is entirely AI generated.

const BASE83 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^{|}~';

const decodeBase83 = (str) => {
  let val = 0;
  for (let i = 0; i < str.length; i++) val = val * 83 + BASE83.indexOf(str[i]);
  return val;
};

const sRGBToLinear = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linearToSRGB = (v) => Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
const signPow = (val, exp) => Math.sign(val) * Math.pow(Math.abs(val), exp);

function decodeDC(val) {
  return [sRGBToLinear(val >> 16), sRGBToLinear((val >> 8) & 255), sRGBToLinear(val & 255)];
}

function decodeAC(val, maxAC) {
  return [
    signPow((Math.floor(val / 361) - 9) / 9, 2) * maxAC,
    signPow(((Math.floor(val / 19) % 19) - 9) / 9, 2) * maxAC,
    signPow(((val % 19) - 9) / 9, 2) * maxAC,
  ];
}

export function decodeBlurhash(blurhash, width, height) {
  const sizeFlag = decodeBase83(blurhash[0]);
  const numX = (sizeFlag % 9) + 1;
  const numY = Math.floor(sizeFlag / 9) + 1;
  const maxAC = (decodeBase83(blurhash[1]) + 1) / 166;
  const colors = [decodeDC(decodeBase83(blurhash.substring(2, 6)))];

  for (let i = 1; i < numX * numY; i++) {
    colors.push(decodeAC(decodeBase83(blurhash.substring(4 + i * 2, 6 + i * 2)), maxAC));
  }

  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let j = 0; j < numY; j++) {
        for (let i = 0; i < numX; i++) {
          const basis = Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
          const color = colors[i + j * numX];
          r += color[0] * basis;
          g += color[1] * basis;
          b += color[2] * basis;
        }
      }
      const idx = 4 * (x + y * width);
      pixels[idx] = linearToSRGB(r);
      pixels[idx + 1] = linearToSRGB(g);
      pixels[idx + 2] = linearToSRGB(b);
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}
