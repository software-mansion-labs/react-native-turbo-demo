import React from 'react';
import {StyleSheet, View, Alert, NativeSyntheticEvent} from 'react-native';
import VisitableView, {VisitProposal} from './VisitableView';

const INITIAL_URL = 'https://turbo-native-demo.glitch.me';

interface Props {
  navigation: any;
  route: any;
}

const TurboScreen: React.FC<Props> = ({navigation, route}) => {
  const currentUrl = route?.params?.url || INITIAL_URL;

  const onVisitProposal = ({
    nativeEvent: {action, url},
  }: NativeSyntheticEvent<VisitProposal>) => {
    switch (action) {
      case 'advance': {
        navigation.push('TurboScreen', {
          url: url,
        });
        break;
      }
      case 'replace': {
        navigation.replace('TurboScreen', {
          url: url,
        });
        break;
      }
      default: {
        Alert.alert('Unsupported action type', action);
      }
    }
  };

  return (
    <View style={styles.container}>
      <VisitableView url={currentUrl} onVisitProposal={onVisitProposal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TurboScreen;
