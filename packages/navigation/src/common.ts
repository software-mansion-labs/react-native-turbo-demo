import { WebScreenRule } from './types';

export function isRule(obj: unknown): obj is WebScreenRule {
  if (obj !== null && typeof obj === 'object') {
    return 'urlPattern' in obj;
  }
  return false;
}
