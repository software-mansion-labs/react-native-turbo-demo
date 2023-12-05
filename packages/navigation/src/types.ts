import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export interface WebScreenRule {
  urlPattern: string;
  title?: string;
  presentation?: NativeStackNavigationOptions['presentation'];
  component?: React.ElementType;
  options?: NativeStackNavigationOptions;
}

export type WebScreenRuleMap = {
  [key: string]:
    | WebScreenRule
    | Omit<WebScreenRuleConfig, 'baseURL' | 'webScreenComponent'>;
};

export type WebScreenRuleConfig = {
  baseURL: string;
  routes: WebScreenRuleMap;
  webScreenComponent?: React.ElementType;
};
