import React from 'react';
import {StyleSheet, View, NativeSyntheticEvent, Alert} from 'react-native';
import {BASE_URL} from './config';
import VisitableView, {OnLoadEvent, VisitProposal} from './VisitableView';

interface Props {
  navigation: any;
  route: any;
}

const WebviewScreen: React.FC<Props> = ({navigation, route}) => {
  const currentUrl = route?.params?.url || BASE_URL;

  const onVisitProposal = ({
    nativeEvent: {action, url},
  }: NativeSyntheticEvent<VisitProposal>) => {
    console.warn('action', action);
    switch (action) {
      case 'advance': {
        navigation.push('WebviewScreen', {
          url: url,
        });
        break;
      }
      case 'replace': {
        navigation.replace('WebviewScreen', {
          url: url,
        });
        break;
      }
      default: {
        Alert.alert('Unsupported action type', action);
      }
    }
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
