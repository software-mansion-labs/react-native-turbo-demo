import React from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import { getNativeComponent } from './common';
import type { OnLoadEvent, VisitProposal, VisitProposalError } from './types';
import { SessionContext } from './SessionContext';

const RNVisitableView = getNativeComponent<any>('RNVisitableView');

export interface Props {
  url: string;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
  onLoad?: (proposal: NativeSyntheticEvent<OnLoadEvent>) => void;
  onVisitError?: (proposal: NativeSyntheticEvent<VisitProposalError>) => void;
}

const VisitableView: React.FC<Props> = (props) => {
  return (
    <SessionContext.Consumer>
      {({ sessionHandle }) => {
        const waitingForSession = sessionHandle === null;
        if (!waitingForSession) {
          return (
            <RNVisitableView
              {...props}
              sessionHandle={sessionHandle}
              style={styles.container}
            />
          );
        }
        return null;
      }}
    </SessionContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
