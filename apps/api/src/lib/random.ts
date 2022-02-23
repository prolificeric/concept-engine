export const createRandomId = (length?: number) => {
  return createRandomTimePrefixedId(length);
};

export const createRandomAlphaNumericString = (length: number = 12): string => {
  let str = '';

  while (str.length < length) {
    const r = Math.floor(Math.random() * 62);
    str += toAlphaNumericString(r);
  }

  return str;
};

export const createRandomTimePrefixedId = (
  length: number = 16,
  date = new Date(),
): string => {
  if (length < 16) {
    throw new Error('Length must be at least 12');
  }

  let str = '';

  // The date/time with the year's first two digits omitted, numbers only
  const nowStr = date
    .toJSON()
    .slice(2)
    .replace(/[^0-9]+/g, '');

  for (let i = 0; i < nowStr.length; i += 2) {
    const slice = nowStr.slice(i, i + 2);
    str += toAlphaNumericString(parseInt(slice, 10));
  }

  while (str.length < length) {
    const r = Math.floor(Math.random() * 62);
    str += toAlphaNumericString(r);
  }

  return str;
};

export const toAlphaNumericString = (value: number): string => {
  const which = value % 62;

  if (which < 10) {
    return String(which);
  }

  if (which < 36) {
    return String.fromCharCode(which + 55);
  }

  return String.fromCharCode(which + 29).toLowerCase();
};
