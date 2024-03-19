import { LinkingConfig, getLinkingObject } from 'react-native-web-screen';

import { Routes } from './webScreenRoutes';

export type RootStackParamList = {
  [Routes.MainTab]: { path: string };
};

export const linkingConfig: LinkingConfig = {
  screens: {
    [Routes.BottomTabs]: {
      screens: {
        [Routes.MainTab]: {
          screens: {
            [Routes.WebviewInitial]: '',
          },
        },
        [Routes.NativeNumbersScreen]: 'numbers',
      },
    },
    [Routes.ModalFlow]: {
      screens: {
        [Routes.New]: 'new',
        [Routes.SuccessScreen]: 'success',
      },
    },
    [Routes.Fallback]: '*',
  },
};

export const baseURL = 'https://turbo-native-demo.glitch.me/';

export const linking = getLinkingObject(baseURL, linkingConfig);
