import { useCallback } from 'react';
import { NativeSyntheticEvent, Alert } from 'react-native';
import { dispatchCommand } from '../RNVisitableView';
import { AlertHandler } from '../types';

export type OnAlert = (message: string, okPressCallback: () => void) => void;
export type OnConfirm = (
  message: string,
  confirmCallback: (value: boolean) => void
) => void;

export function useWebViewDialogs(
  visitableViewRef: React.RefObject<any>,
  onAlert: OnAlert | undefined,
  onConfirm: OnConfirm | undefined
) {
  const handleAlert = useCallback(
    ({ nativeEvent: { message } }: NativeSyntheticEvent<AlertHandler>) => {
      const dispatch = () =>
        dispatchCommand(visitableViewRef, 'sendAlertResult');
      if (onAlert) {
        onAlert(message, () => dispatch());
      } else {
        Alert.alert(message, undefined, [{ text: 'OK', onPress: dispatch }]);
      }
    },
    [onAlert, visitableViewRef]
  );

  const handleConfirm = useCallback(
    ({ nativeEvent: { message } }: NativeSyntheticEvent<AlertHandler>) => {
      const dispatch = (value: boolean) =>
        dispatchCommand(
          visitableViewRef,
          'sendConfirmResult',
          value.toString()
        );
      if (onConfirm) {
        onConfirm(message, (value) => dispatch(value));
      } else {
        Alert.alert(message, undefined, [
          { text: 'OK', onPress: () => dispatch(true) },
          { text: 'Cancel', onPress: () => dispatch(false) },
        ]);
        dispatch(true);
      }
    },
    [onConfirm, visitableViewRef]
  );

  return { handleAlert, handleConfirm };
}
