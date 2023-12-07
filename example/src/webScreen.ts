import { getLinkingObject } from 'react-native-web-screen';
import { Routes } from './webScreenRoutes';
import { LinkingOptions } from '@react-navigation/native';

const config: LinkingOptions<{}>['config'] = {
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

export const linking = getLinkingObject(baseURL, config);
