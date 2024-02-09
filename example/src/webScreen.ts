import { LinkingConfig, getLinkingObject } from 'react-native-web-screen';
import { Routes } from './webScreenRoutes';

export type RootStackParamList = {
  [Routes.SignIn]: { path: string };
};

export const linkingConfig: LinkingConfig = {
  screens: {
    [Routes.BottomTabs]: {
      screens: {
        [Routes.FirstTabFlow]: {
          screens: {
            [Routes.WebviewInitial]: '',
            [Routes.Share]: 'share',
          },
        },
      },
    },
    [Routes.NestedTab]: {
      screens: {
        [Routes.NestedTabWeb]: 'nested',
      },
    },

    [Routes.ModalFlow]: {
      screens: {
        [Routes.SignIn]: 'signin',
        [Routes.New]: 'new',
        [Routes.SuccessScreen]: 'success',
      },
    },
    [Routes.Fallback]: '*',
  },
};

export const baseURL = 'http://localhost:45678/';

export const linking = getLinkingObject(baseURL, linkingConfig);
