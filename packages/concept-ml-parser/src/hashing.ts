import { subtle } from './crypto';

const charset = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

const charmap = new Map<string, number>(charset.map((char, i) => [char, i]));

export const getAlphaHash = (
  input: string,
  options: {
    getHash?: (str: string) => string | Promise<string>;
  } = {},
) => {
  const { getHash = defaultHashAlgo } = options;
  return Promise.resolve(getHash(input));
};

export const stripString = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
};

export const defaultHashAlgo = async (str: string) => {
  return getAlphaRank(str) + '-' + (await getDigest(str)).slice(0, 6);
};

export const getDigest = async (
  str: string,
  algorithm: string = 'SHA-256',
): Promise<string> => {
  const ab = await subtle.digest(algorithm, Buffer.from(str));
  const view = new Uint8Array(ab);

  return Array.from(view)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const getAlphaRank = (str: string, cutoff = 64): string => {
  const SCORE_LENGTH = 8;
  const stripped = stripString(str);

  if (stripped.length <= cutoff + SCORE_LENGTH) {
    return stripped;
  }

  let total = 0;

  stripped
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '')
    .slice(cutoff, cutoff * 3)
    .split('')
    .forEach((char, i) => {
      const n = charmap.get(char) || 0;
      total += n / (i + 1) ** 4;
    });

  const score = Math.floor(total * 10 ** SCORE_LENGTH)
    .toString()
    .slice(0, SCORE_LENGTH)
    .padStart(SCORE_LENGTH, '0');

  return stripString(str).slice(0, cutoff) + '-' + score;
};
