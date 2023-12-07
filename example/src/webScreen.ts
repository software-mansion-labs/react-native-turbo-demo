import { WebScreenRuleConfig } from 'react-native-web-screen';
import WebView from './WebView';
import { Routes } from './webScreenRoutes';
import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<{}>['config'] = {
  screens: {
    [Routes.BottomTabs]: {
      screens: {
        [Routes.WebviewInitial]: '',
      },
    },
    [Routes.New]: 'new',
    [Routes.SuccessScreen]: 'success',
    [Routes.One]: 'one',
    [Routes.NumbersScreen]: 'numbers',
    [Routes.SignIn]: 'signin',
    [Routes.Share]: 'share',
    [Routes.NestedTab]: {
      screens: {
        [Routes.NestedTabWeb]: 'nested',
      },
    },
    [Routes.Fallback]: '*',
  },
};
export const baseURL = 'http://localhost:45678/';

export const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://localhost:45678/',
  routes: {
    [Routes.BottomTabs]: {
      routes: {
        [Routes.WebviewInitial]: {
          urlPattern: '',
          title: 'React Native Web Screen',
        },
      },
    },
    [Routes.New]: {
      urlPattern: 'new',
      title: 'A Modal Webpage',
      presentation: 'modal',
    },
    [Routes.SuccessScreen]: {
      urlPattern: 'success',
      title: 'It Worked!',
      presentation: 'modal',
    },
    [Routes.One]: {
      urlPattern: 'one',
      title: "How'd You Get Here?",
    },
    [Routes.NumbersScreen]: {
      urlPattern: 'numbers',
    },
    [Routes.SignIn]: {
      urlPattern: 'signin',
      presentation: 'modal',
    },
    [Routes.Share]: {
      urlPattern: 'share',
    },
    [Routes.NestedTab]: {
      routes: {
        [Routes.NestedTabWeb]: {
          urlPattern: 'nested',
          title: 'Nested Web',
        },
      },
    },
    [Routes.Fallback]: { urlPattern: '*', title: '' },
  },
  webScreenComponent: WebView,
};
