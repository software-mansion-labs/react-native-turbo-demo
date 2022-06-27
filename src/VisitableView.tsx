import React from 'react';
import {StyleSheet, View} from 'react-native';
import VisitableViewNativeComponent from './VisitableViewNativeComponent';

interface Props {
  url: string;
}

const VisitableView: React.FC<Props> = props => {
  return <VisitableViewNativeComponent style={styles.container} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
