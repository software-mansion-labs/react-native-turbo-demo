import { UIManager, requireNativeComponent } from 'react-native';
import { LINKING_ERROR } from './common';

export function getNativeComponent<T>(asdf: string) {
  return UIManager.hasViewManagerConfig(asdf)
    ? requireNativeComponent<T>(asdf)
    : () => {
        throw new Error(LINKING_ERROR);
      };
}

const RNVisitableView = getNativeComponent<any>('RNVisitableView');

export default RNVisitableView;
