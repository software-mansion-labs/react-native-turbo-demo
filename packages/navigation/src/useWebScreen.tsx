import React, { useCallback } from 'react';
import WebScreen from './WebScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { WebScreenRuleMap, WebScreenRuleConfig } from './types';
import { isRule } from './common';

type NavigatorType =
  | ReturnType<typeof createNativeStackNavigator>
  | ReturnType<typeof createBottomTabNavigator>;

function buildWebviewComponent(
  baseURL: string,
  Component: React.ElementType = WebScreen
) {
  return (navProps: Record<string, unknown>) => (
    <Component {...navProps} baseURL={baseURL} />
  );
}

function findRouteInWebScreenConfig(
  routes: WebScreenRuleMap | undefined,
  name: string
): WebScreenRuleMap | undefined {
  if (!routes) {
    return undefined;
  }
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
      if (foundRoute) {
        return foundRoute;
      }
    }
  }
  return undefined;
}

function groupScreens(
  Navigator: NavigatorType,
  key: string | undefined,
  config: WebScreenRuleConfig
) {
  const { routes } = config;
  const { baseURL, webScreenComponent } = config;
  const defaultComponent = buildWebviewComponent(baseURL, webScreenComponent);

  const filteredRoutes = key ? findRouteInWebScreenConfig(routes, key) : routes;
  if (filteredRoutes)
    return (
      <Navigator.Group>
        {Object.entries(filteredRoutes).map(([routeName, rule]) => {
          if (isRule(rule)) {
            const { urlPattern, component, options } = rule;
            return (
              <Navigator.Screen
                key={routeName}
                name={routeName}
                //  @ts-expect-error Use proper typing for main components
                component={component ?? defaultComponent}
                initialParams={{ baseURL, path: urlPattern }}
                //  @ts-expect-error Use proper typing for main components
                options={options}
              />
            );
          }
          return null;
        })}
      </Navigator.Group>
    );
  return null;
}

type UseWebScreensParams = { navigator: NavigatorType } & (
  | { route: string; fallback?: never }
  | { route?: never; fallback: boolean }
);

export default function useWebScreen(config: WebScreenRuleConfig) {
  const webScreens = useCallback(
    ({ navigator, route, fallback }: UseWebScreensParams) => {
      return groupScreens(navigator, fallback ? undefined : route, config);
    },
    [config]
  );
  return { webScreens };
}
