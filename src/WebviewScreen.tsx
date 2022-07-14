import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, View, NativeSyntheticEvent} from 'react-native';
import {BASE_URL} from './config';
import VisitableView, {
  OnLoadEvent,
  VisitProposal,
  VisitProposalError,
} from './VisitableView';
import useWebviewNavigate from './useWebviewNavigate';
import {RouteProp} from '@react-navigation/native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const WebviewScreen: React.FC<Props> = ({navigation, route}) => {
  const navigateTo = useWebviewNavigate();

  const currentUrl = route?.path || BASE_URL;

  const onVisitProposal = ({
    nativeEvent: {action: actionType, url},
  }: NativeSyntheticEvent<VisitProposal>) => {
    navigateTo(url, actionType);
  };

  const onVisitError = ({
    nativeEvent,
  }: NativeSyntheticEvent<VisitProposalError>) => {
    console.log('visit error nativeEvent', nativeEvent);
  };

  const onLoad = ({
    nativeEvent: {title},
  }: NativeSyntheticEvent<OnLoadEvent>) => {
    navigation.setOptions({title});
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
