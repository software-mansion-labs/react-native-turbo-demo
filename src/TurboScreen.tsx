import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import VisitableView from './VisitableView';

interface Props {}

const TurboScreen: React.FC<Props> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <VisitableView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TurboScreen;
