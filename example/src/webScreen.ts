import { buildWebScreen, WebScreenRuleConfig } from 'react-native-web-screen';

export enum Routes {
  BottomTabs = 'BottomTabs',
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
  One = 'One',
}

const webScreenConfig: WebScreenRuleConfig = {
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
