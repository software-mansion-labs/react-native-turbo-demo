import * as extractPathFromURLLib from '@react-navigation/native/src/extractPathFromURL';

// extractPathFromURL export changes between v6 and v7 of @react-navigation/native
export const extractPathFromURL: (
  prefixes: string[],
  url: string
) => string | undefined =
  // @ts-ignore different export type for react-navigation v7
  // eslint-disable-next-line import/namespace
  extractPathFromURLLib.default || extractPathFromURLLib.extractPathFromURL;
