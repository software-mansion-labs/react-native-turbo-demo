import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import VisitableView from './VisitableView';

const INITIAL_URL = 'https://turbo-native-demo.glitch.me';

interface Props {
  navigation: any;
  route: any;
}

const TurboScreen: React.FC<Props> = ({navigation, route}) => {
  const currentUrl = route?.params?.url || INITIAL_URL;

  const openNewPage = (url: string) => {
    navigation.push('TurboScreen', {
      url,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <VisitableView
        url={currentUrl}
        onVisitProposal={({nativeEvent: {url}}) => {
          openNewPage(url);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TurboScreen;
