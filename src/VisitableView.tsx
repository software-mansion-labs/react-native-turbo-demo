import React from 'react';
import {StyleSheet} from 'react-native';
import VisitableViewNativeComponent from './VisitableViewNativeComponent';

interface Props {
  url: string;
  onProposeVisit: (url: string) => {};
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
