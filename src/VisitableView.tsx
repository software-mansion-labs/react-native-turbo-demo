import React from 'react';
import {NativeSyntheticEvent, StyleSheet} from 'react-native';
import VisitableViewNativeComponent from './VisitableViewNativeComponent';

interface VisitProposal {
  url: string;
}

interface Props {
  url: string;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
}

const VisitableView: React.FC<Props> = props => {
  return <VisitableViewNativeComponent {...props} style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
