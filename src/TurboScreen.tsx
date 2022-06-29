import React from 'react';
import {StyleSheet, SafeAreaView, Button} from 'react-native';
import VisitableView from './VisitableView';

interface Props {
  navigation: any;
  route;
}

const TurboScreen: React.FC<Props> = ({navigation, route}) => {
  const url = route?.params?.url;

  return (
    <SafeAreaView style={styles.container}>
      <VisitableView url={url || 'https://turbo-native-demo.glitch.me'} />
      <Button
        onPress={() =>
          navigation.push('TurboScreen', {
            url: 'https://turbo-native-demo.glitch.me/one',
          })
        }
        title="Open new screen"
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
