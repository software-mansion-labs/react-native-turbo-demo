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

interface WebScreenRuleList {
  type?: undefined | 'modalFlow';
  routes: WebScreenRuleMap;
}

export type WebScreenRuleMap = {
  [key: string]: WebScreenRule | WebScreenRuleList;
};

export type WebScreenRuleConfig = {
  baseURL: string;
  routes: WebScreenRuleMap;
  webScreenComponent?: React.ElementType;
};

export function buildWebviewComponent(
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

export function buildLinkingConfiguration({
  routes,
  baseURL,
}: WebScreenRuleConfig) {
  return {
    prefixes: [baseURL],
    config: generateLinking(routes),
  };
}
type StackType =
  | ReturnType<typeof createNativeStackNavigator>
  | ReturnType<typeof createBottomTabNavigator>;

function findRouteInWebScreenConfig(
  routes: WebScreenRuleMap | undefined,
  name: string
): WebScreenRuleList | undefined {
  if (!routes) return undefined;
  for (const key of Object.keys(routes)) {
    const route = routes[key];
    if (key === name) {
      if (!isRule(route)) {
        return route;
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

function stackGroup({
  Stack,
  routes,
  config,
}: {
  Stack: StackType;
  routes: WebScreenRuleMap;
  config: WebScreenRuleConfig;
}) {
  const { baseURL, webScreenComponent } = config;
  const defaultComponent = buildWebviewComponent(baseURL, webScreenComponent);

  return (
    <Stack.Group>
      {Object.entries(routes).map(([routeName, rule]) => {
        if (isRule(rule)) {
          const { urlPattern, component, options, presentation, title } = rule;
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
}

function stackNavigator({
  Stack,
  routes,
  config,
}: {
  Stack: StackType;
  routes: WebScreenRuleMap;
  config: WebScreenRuleConfig;
}) {
  return () => (
    <Stack.Navigator>
      {stackGroup({ Stack, routes: routes, config })}
    </Stack.Navigator>
  );
}

export function webStackScreen(
  Stack: StackType,
  config: WebScreenRuleConfig,
  key?: string
) {
  const { routes } = config;

  if (key) {
    const filteredRoutes = findRouteInWebScreenConfig(routes, key);

    if (filteredRoutes?.type === 'modalFlow') {
      return (
        <Stack.Screen
          name={key}
          component={stackNavigator({
            Stack,
            routes: filteredRoutes?.routes,
            config,
          })}
          options={{ title: 'Flow screen', presentation: 'modal' }}
        />
      );
    } else if (filteredRoutes?.routes) {
      return stackGroup({ Stack, routes: filteredRoutes?.routes, config });
    }
  } else {
    return stackGroup({ Stack, routes: config.routes, config });
  }
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
