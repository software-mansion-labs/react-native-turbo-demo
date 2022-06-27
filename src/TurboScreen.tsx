import React from 'react';
import {StyleSheet, SafeAreaView, Button} from 'react-native';
import VisitableView from './VisitableView';

interface Props {
  navigation: any;
}

const TurboScreen: React.FC<Props> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <VisitableView />
      <Button
        onPress={() => navigation.push('TurboScreen')}
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
