import React, { useCallback } from 'react';
import WebScreen from './WebScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { WebScreenRuleMap, WebScreenRuleConfig } from './types';
import { isRule } from './common';

type StackType =
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

function webStackScreen(
  Stack: StackType,
  key: string | undefined,
  config: WebScreenRuleConfig
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

export default function useWebScreen(config: WebScreenRuleConfig) {
  const webScreens = useCallback(
    (Stack: StackType, key?: string) => webStackScreen(Stack, key, config),
    [config]
  );
  return { webScreens };
}
