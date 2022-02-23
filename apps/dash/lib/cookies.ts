import { NextPageContext } from 'next';

export const parseCookies = (str: string) => {
  const trimmed = str.trim();

  if (trimmed.length === 0) {
    return {};
  }

  const cookies: { [key: string]: string } = {};

  trimmed.split(/; ?/).forEach((cookie) => {
    const [key, value = ''] = cookie.split('=').map(decodeURIComponent);
    cookies[key] = value;
  });

  return cookies;
};

export const parseContextCookies = (ctx: NextPageContext) => {
  const cookieStr = ctx.req?.headers.cookie || '';
  return parseCookies(cookieStr);
};
