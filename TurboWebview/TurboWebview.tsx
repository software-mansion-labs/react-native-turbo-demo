import React from 'react';
import {StyleSheet} from 'react-native';
import {requireNativeComponent} from 'react-native';

const RNTTurboWebview = requireNativeComponent<any>('RNTTurboWebview');

interface Props {
  url: string;
}

const TurboWebview: React.FC<Props> = props => {
  console.warn('props', props);

  return <RNTTurboWebview style={styles.container} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TurboWebview;
