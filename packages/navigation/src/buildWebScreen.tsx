import React from 'react';
import type { ScreenProps } from 'react-native-screens';
import WebScreen from './WebScreen';

export interface WebScreenRule {
  urlPattern: string;
  title?: string;
  presentation?: ScreenProps['stackPresentation'];
}

export type WebScreenRuleMap<ParamList extends {}> = {
  [RouteName in keyof ParamList]?: NonNullable<WebScreenRule>;
};

export type WebScreenRuleConfig<ParamList extends {}> = {
  baseURL: string;
  routes: WebScreenRuleMap<ParamList>;
};

const buildWebviewComponent = (baseURL: string) => (navProps: any) =>
  <WebScreen {...navProps} baseURL={baseURL} />;

export const buildWebScreen = <ParamsList extends {}>({
  routes,
  baseURL,
}: WebScreenRuleConfig<ParamsList>) => {
  const screens = Object.entries(routes).reduce((prev, entry) => {
    const [routeName, route] = entry as [string, WebScreenRule];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { urlPattern, ...options } = route;

    return {
      ...prev,
      [routeName]: {
        name: routeName,
        component: buildWebviewComponent(baseURL),
        options,
      },
    };
  }, {} as { [route in keyof ParamsList]: { name: keyof ParamsList; component: any } });

  const linkingConfig = Object.entries(routes).reduce((prev, entry) => {
    const [routeName, route] = entry as [string, WebScreenRule];
    return {
      ...prev,
      [routeName]: route.urlPattern,
    };
  }, {});

  return {
    linking: {
      prefixes: [baseURL],
      config: {
        screens: {
          ...linkingConfig,
        },
      },
    },
    screens,
  };
};
