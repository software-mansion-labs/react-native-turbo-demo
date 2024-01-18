import { LinkingConfig, getLinkingObject } from 'react-native-web-screen';
import { Routes } from './webScreenRoutes';

export type RootStackParamList = {
  [Routes.SignIn]: { path: string };
};

export const linkingConfig: LinkingConfig = {
  screens: {
    [Routes.BottomTabs]: {
      screens: {
        [Routes.WebviewInitial]: '',
        [Routes.AccountSettings]: {
          screens: {
            [Routes.Account]: 'account',
          },
        },
      },
    },
    [Routes.One]: 'one',
    [Routes.NumbersScreen]: 'numbers',
    [Routes.SignIn]: 'signin',
    [Routes.Share]: 'share',
    [Routes.NestedTab]: {
      screens: {
        [Routes.NestedTabWeb]: 'nested',
      },
    },

    [Routes.FocusedFlow]: {
      screens: {
        [Routes.PhoneActivation]: 'phone_activation/:step?',
        [Routes.New]: 'new',
        [Routes.SuccessScreen]: 'success',
      },
    },
    [Routes.Fallback]: '*',
  },
};

export const baseURL = 'http://localhost:45678/';

export const linking = getLinkingObject(baseURL, linkingConfig);
