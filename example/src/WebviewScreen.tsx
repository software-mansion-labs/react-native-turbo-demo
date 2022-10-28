import React from 'react';
import { StyleSheet, View, NativeSyntheticEvent } from 'react-native';
import { BASE_URL } from './config';
import {
  VisitableView,
  OnLoadEvent,
  VisitProposal,
  VisitProposalError,
  useWebviewNavigate,
} from 'react-native-turbo-webview';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const WebviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const navigateTo = useWebviewNavigate();

  const currentUrl = route?.path || BASE_URL;

  const onVisitProposal = ({
    nativeEvent: { action: actionType, url },
  }: NativeSyntheticEvent<VisitProposal>) => {
    navigateTo(url, actionType);
  };

  const onVisitError = ({
    nativeEvent: { statusCode },
  }: NativeSyntheticEvent<VisitProposalError>) => {
    switch (statusCode) {
      case 401: {
        navigateTo(`${BASE_URL}/signin`);
        break;
      }
      default: {
        navigateTo(`${BASE_URL}/notfound`, 'replace');
      }
    }
  };

  const onLoad = ({
    nativeEvent: { title },
  }: NativeSyntheticEvent<OnLoadEvent>) => {
    navigation.setOptions({ title });
  };

  return (
    <View style={styles.container}>
      <VisitableView
        url={currentUrl}
        onVisitProposal={onVisitProposal}
        onVisitError={onVisitError}
        onLoad={onLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebviewScreen;
