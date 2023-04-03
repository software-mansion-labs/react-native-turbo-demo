import { buildWebScreen, WebScreenRuleConfig } from 'react-native-web-screen';

export enum Routes {
  NotFound = 'NotFound',
  NumbersScreen = 'NumbersScreen',
  WebviewInitial = 'WebviewInitial',
  New = 'New',
  SuccessScreen = 'SuccessScreen',
  NonExistentScreen = 'NonExistentScreen',
  SignIn = 'SignIn',
  Fallback = 'Fallback',
  NestedTabNative = 'NestedTabNative',
  NestedTabWeb = 'NestedTabWeb',
  NestedTab = 'NestedTab',
}

const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://localhost:45678/',
  routes: {
    [Routes.WebviewInitial]: {
      urlPattern: '',
      title: 'React Native Web Screen',
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
    [Routes.NumbersScreen]: {
      urlPattern: 'numbers',
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
};

export const webScreens = buildWebScreen(webScreenConfig);
