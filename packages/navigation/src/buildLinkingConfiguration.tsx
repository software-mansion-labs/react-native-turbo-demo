import { PathConfigMap } from '@react-navigation/native';
import { WebScreenRuleMap, WebScreenRuleConfig } from './types';
import { isRule } from './common';

function generateLinking<ParamList extends {}>(
  rules: WebScreenRuleMap
): { screens: PathConfigMap<ParamList> } {
  const config: PathConfigMap<ParamList> = {};
  Object.entries(rules).forEach(([key, rule]) => {
    const paramKey = key as keyof ParamList;
    if (isRule(rule)) {
      // @ts-expect-error use proper key typing
      config[paramKey] = rule.urlPattern;
    } else {
      // @ts-expect-error use proper key typing
      config[paramKey] = generateLinking<ParamList>(rule.routes);
    }
  });
  return { screens: config };
}

export default function buildLinkingConfiguration({
  routes,
  baseURL,
}: WebScreenRuleConfig) {
  return {
    prefixes: [baseURL],
    config: generateLinking(routes),
  };
}
