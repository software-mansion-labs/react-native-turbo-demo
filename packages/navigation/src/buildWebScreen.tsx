import React from 'react';
import WebScreen from './WebScreen';
import { PathConfigMap } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export interface WebScreenRule {
  urlPattern: string;
  title?: string;
  presentation?: NativeStackNavigationOptions['presentation'];
  component?: React.ElementType;
  options?: NativeStackNavigationOptions;
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

type ScreenConfig = {
  name: string;
  component: React.ComponentType;
  initialParams: {};
  options: NativeStackNavigationOptions;
};

function getScreens(
  baseURL: string,
  routes: WebScreenRuleMap,
  defaultComponent: (navProps: Record<string, unknown>) => JSX.Element
): Record<string, ScreenConfig> {
  let screens: Record<string, ScreenConfig> = {};
  Object.entries(routes).forEach(([routeName, rule]) => {
    if (isRule(rule)) {
      const { urlPattern, component, options, presentation, title } = rule;
      screens[routeName] = {
        name: routeName,
        // @ts-expect-error Use proper typing for main components
        component: component ?? defaultComponent,
        initialParams: { baseURL, path: urlPattern },
        options: { ...options, presentation, title },
      };
    } else {
      screens = {
        ...screens,
        ...getScreens(baseURL, rule.routes, defaultComponent),
      };
    }
  });
  return screens;
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

  return {
    linking: {
      prefixes: [baseURL],
      config: generateLinking(routes),
    },
    screens: getScreens(baseURL, routes, nativeComponent),
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
