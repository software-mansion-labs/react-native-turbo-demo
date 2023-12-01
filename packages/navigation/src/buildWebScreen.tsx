import React from 'react';
import WebScreen from './WebScreen';
import { PathConfigMap } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
type StackType =
  | ReturnType<typeof createNativeStackNavigator>
  | ReturnType<typeof createBottomTabNavigator>;

export function findRouteInWebScreenConfig(
  routes: WebScreenRuleMap | undefined,
  name: string
): WebScreenRuleMap | undefined {
  if (!routes) return undefined;
  for (const key of Object.keys(routes)) {
    const route = routes[key];
    if (key === name) {
      if (!isRule(route)) {
        return route?.routes;
      }
      return undefined;
    }
    if (!isRule(route)) {
      const foundRoute = findRouteInWebScreenConfig(route?.routes, name);
      if (foundRoute) return foundRoute;
    }
  }
  return undefined;
}

export function webStackScreen(
  Stack: StackType,
  config: WebScreenRuleConfig,
  key?: string
) {
  const { routes } = config;
  const { baseURL, webScreenComponent } = config;
  const defaultComponent = buildWebviewComponent(baseURL, webScreenComponent);

  const filteredRoutes = key ? findRouteInWebScreenConfig(routes, key) : routes;
  if (filteredRoutes)
    return (
      <Stack.Group>
        {Object.entries(filteredRoutes).map(([routeName, rule]) => {
          if (isRule(rule)) {
            const { urlPattern, component, options, presentation, title } =
              rule;
            return (
              <Stack.Screen
                key={routeName}
                name={routeName}
                //  @ts-expect-error Use proper typing for main components
                component={component ?? defaultComponent}
                initialParams={{ baseURL, path: urlPattern }}
                //  @ts-expect-error Use proper typing for main components
                options={{ ...options, presentation, title }}
              />
            );
          }
          return null;
        })}
      </Stack.Group>
    );
  return null;
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
