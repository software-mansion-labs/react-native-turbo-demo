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

// WIP: More intelligent type based on ScreenParams types
// export type WebScreenRuleMap<ParamList> = {
//   [RouteName in keyof ParamList]?: NonNullable<
//     ParamList[RouteName]
//   > extends NavigatorScreenParams<infer T>
//     ? Omit<WebScreenRuleConfig<T>, 'baseURL'>
//     : WebScreenRule;
// };
// type NestedTabParamsList = {
//   [Routes.NestedTabNative]: undefined;
//   [Routes.NestedTabWeb]: undefined;
// };
// type ParamsList = {
//   [Routes.New]: undefined;
//   [Routes.WebviewInitial]: undefined;
//   [Routes.NumbersScreen]: undefined;
//   [Routes.NotFound]: undefined;
//   [Routes.SuccessScreen]: undefined;
//   [Routes.NonExistentScreen]: undefined;
//   [Routes.SignIn]: undefined;
//   [Routes.Fallback]: undefined;
//   [Routes.NestedTab]: NavigatorScreenParams<NestedTabParamsList>;
// };
