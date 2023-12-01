import { buildWebScreen, WebScreenRuleConfig } from 'react-native-web-screen';
import WebView from './WebView';
import { Routes } from './webScreenRoutes';
import ShareScreen from './ShareScreen';

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
    [Routes.NestedTab]: {
      routes: {
        [Routes.NestedTabWeb]: {
          urlPattern: 'nested',
          title: 'Nested Web',
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
      presentation: 'formSheet',
      options: { gestureEnabled: false },
    },
    [Routes.Share]: {
      urlPattern: 'share',
      component: ShareScreen,
    },

    [Routes.Fallback]: { urlPattern: '*', title: '' },
  },
  webScreenComponent: WebView,
};

export const webScreens = buildWebScreen(webScreenConfig);
