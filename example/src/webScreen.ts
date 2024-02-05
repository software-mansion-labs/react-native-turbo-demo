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
      },
    },
    [Routes.ModalStack]: {
      screens: {
        [Routes.New]: 'new',
        [Routes.SuccessScreen]: 'success',
        [Routes.ShareStack]: {
          screens: {
            [Routes.Share]: 'share',
            [Routes.Reference]: 'reference/turbo-native',
          },
        },
      },
    },
    [Routes.One]: 'one',
    [Routes.NumbersScreen]: 'numbers',
    [Routes.SignIn]: 'signin',
    [Routes.NestedTab]: {
      screens: {
        [Routes.NestedTabWeb]: 'nested',
      },
    },
    [Routes.Fallback]: '*',
  },
};

export const baseURL = 'http://localhost:45678/';

export const linking = getLinkingObject(baseURL, linkingConfig);
