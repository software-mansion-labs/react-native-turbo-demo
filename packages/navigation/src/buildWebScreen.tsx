import React from 'react';
import type { ScreenProps } from 'react-native-screens';
import WebScreen from './WebScreen';
import { merge } from 'lodash';
import { PathConfigMap } from '@react-navigation/native';

export interface WebScreenRule {
  urlPattern: string;
  title?: string;
  presentation?: ScreenProps['stackPresentation'];
}

export type WebScreenRuleMap = {
  [key: string]:
    | WebScreenRule
    | Omit<WebScreenRuleConfig, 'baseURL' | 'webScreenComponent'>;
};

export type WebScreenRuleConfig = {
  baseURL: string;
  routes: WebScreenRuleMap;
  webScreenComponent?: React.ElementType;
};

function buildWebviewComponent(
  baseURL: string,
  Component: React.ElementType = WebScreen
) {
  return (navProps: Record<string, unknown>) => (
    <Component {...navProps} baseURL={baseURL} />
  );
}

function isRule(obj: unknown): obj is WebScreenRule {
  if (obj !== null && typeof obj === 'object') {
    return 'urlPattern' in obj;
  }
  return false;
}

function getScreens(
  baseURL: string,
  routes: WebScreenRuleMap,
  component: (navProps: Record<string, unknown>) => JSX.Element
): {
  screens: {
    [key: string]: any;
  };
} {
  return Object.entries(routes).reduce(
    (prev, entry) => {
      const [routeName, route] = entry as [
        string,
        WebScreenRule | Omit<WebScreenRuleConfig, 'baseURL'>
      ];

      if (isRule(route)) {
        const { urlPattern, ...options } = route;

        return merge(prev, {
          screens: {
            [routeName]: {
              name: routeName,
              component,
              initialParams: { baseURL, path: urlPattern },
              options: { ...options },
            },
          },
        });
      } else {
        const { routes: nestedRoutes } = route;

        const { screens } = getScreens(baseURL, nestedRoutes, component);

        return merge(prev, {
          screens,
        });
      }
    },
    { screens: {} }
  );
}

export function generateLinking<ParamList extends {}>(
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

export function buildWebScreen({
  routes,
  baseURL,
  webScreenComponent,
}: WebScreenRuleConfig) {
  const nativeComponent = buildWebviewComponent(baseURL, webScreenComponent);

  const { screens } = getScreens(baseURL, routes, nativeComponent);

  return {
    linking: {
      prefixes: [baseURL],
      config: generateLinking(routes),
    },
    screens,
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
