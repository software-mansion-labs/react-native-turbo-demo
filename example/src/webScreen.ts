import { getLinkingObject } from 'react-native-web-screen';
import { Routes } from './webScreenRoutes';
import { LinkingConfig } from 'packages/navigation/src/hooks/useCurrentUrl';

export const linkingConfig: LinkingConfig = {
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

export const linking = getLinkingObject(baseURL, linkingConfig);
