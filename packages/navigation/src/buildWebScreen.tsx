import React from 'react';
import type { ScreenProps } from 'react-native-screens';
import WebScreen from './WebScreen';
import { merge } from 'lodash';

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

const buildWebviewComponent =
  (baseURL: string, Component: React.ElementType = WebScreen) =>
  (navProps: Record<string, unknown>) =>
    <Component {...navProps} baseURL={baseURL} />;

const isRule = (obj: unknown): obj is WebScreenRule => {
  if (obj !== null && typeof obj === 'object') {
    return 'urlPattern' in obj;
  }
  return false;
};

const getLinkingAndScreens = (
  baseURL: string,
  routes: WebScreenRuleMap,
  component: (navProps: Record<string, unknown>) => JSX.Element
): {
  screens: {
    [key: string]: any;
  };
  linking: Record<string, string>;
} => {
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
          linking: {
            [routeName]: urlPattern,
          },
        });
      } else {
        const { routes: nestedRoutes } = route;

        const { screens, linking } = getLinkingAndScreens(
          baseURL,
          nestedRoutes,
          component
        );

        return merge(prev, {
          screens,
          linking: {
            [routeName]: {
              screens: linking,
            },
          },
        });
      }
    },
    { screens: {}, linking: {} }
  );
};

export const buildWebScreen = ({
  routes,
  baseURL,
  webScreenComponent,
}: WebScreenRuleConfig) => {
  const nativeComponent = buildWebviewComponent(baseURL, webScreenComponent);

  const { linking, screens } = getLinkingAndScreens(
    baseURL,
    routes,
    nativeComponent
  );

  return {
    linking: {
      prefixes: [baseURL],
      config: {
        screens: {
          ...linking,
        },
      },
    },
    screens,
  };
};

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
