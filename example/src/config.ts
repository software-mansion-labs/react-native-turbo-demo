export type ParamsList = {
  [Routes.New]: undefined;
  [Routes.WebviewInitial]: undefined;
  [Routes.NumbersScreen]: undefined;
  [Routes.NotFound]: undefined;
  [Routes.SuccessScreen]: undefined;
  [Routes.NonExistentScreen]: undefined;
  [Routes.SignIn]: undefined;
  [Routes.Fallback]: undefined;
};

export enum Routes {
  NotFound = 'NotFound',
  NumbersScreen = 'NumbersScreen',
  WebviewInitial = 'WebviewInitial',
  New = 'New',
  SuccessScreen = 'SuccessScreen',
  NonExistentScreen = 'NonExistentScreen',
  SignIn = 'SignIn',
  Fallback = 'Fallback',
}
