import {
  buildLinkingConfiguration,
  WebScreenRuleConfig,
} from 'react-native-web-screen';
import WebView from './WebView';
import { Routes } from './webScreenRoutes';
import ShareScreen from './ShareScreen';
import { NativeScreen } from 'react-native-screens';

export const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://localhost:45678/',
  routes: {
    [Routes.BottomTabs]: {
      routes: {
        [Routes.WebviewInitial]: {
          urlPattern: '',
          options: {
            title: 'React Native Web Screen',
          },
        },
      },
    },
    [Routes.NestedTab]: {
      routes: {
        [Routes.NestedTabWeb]: {
          urlPattern: 'nested',
          options: {
            title: 'Nested Web',
          },
        },
      },
    },
    [Routes.New]: {
      urlPattern: 'new',
      options: {
        title: 'A Modal Webpage',
        presentation: 'modal',
      },
    },
    [Routes.SuccessScreen]: {
      urlPattern: 'success',
      options: {
        title: 'It Worked!',
        presentation: 'modal',
      },
    },
    [Routes.One]: {
      urlPattern: 'one',
      options: {
        title: "How'd You Get Here?",
      },
    },
    [Routes.NumbersScreen]: {
      urlPattern: 'numbers',
      options: {
        title: 'A List of Numbers',
      },
      component: NativeScreen,
    },
    [Routes.SignIn]: {
      urlPattern: 'signin',
      options: {
        gestureEnabled: false,
        presentation: 'formSheet',
      },
    },
    [Routes.Share]: {
      urlPattern: 'share',
      component: ShareScreen,
    },

    [Routes.Fallback]: {
      urlPattern: '*',
      options: { title: '' },
    },
  },
  webScreenComponent: WebView,
};

export const linkingConfiguration = buildLinkingConfiguration(webScreenConfig);
