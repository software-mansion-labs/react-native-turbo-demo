import React from 'react';
import {NativeSyntheticEvent, StyleSheet} from 'react-native';
import {SessionContext} from './SessionContext';
import VisitableViewNativeComponent from './VisitableViewNativeComponent';

export type Action = 'advance' | 'replace' | 'restore';

export interface VisitProposal {
  url: string;
  action: Action;
}

export interface OnLoadEvent {
  title: string;
  url: string;
}

export interface VisitProposalError {
  url: string;
  error: string;
  statusCode: number;
}

interface Props {
  url: string;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
  onLoad?: (proposal: NativeSyntheticEvent<OnLoadEvent>) => void;
  onVisitError?: (proposal: NativeSyntheticEvent<VisitProposalError>) => void;
}

const VisitableView: React.FC<Props> = props => {
  return (
    <SessionContext.Consumer>
      {({sessionHandle}) => {
        if (sessionHandle === undefined) {
          console.warn(
            "[Webview] Couldn't find Session, make sure that the your webview is wrapped with Session component.",
          );
          return null;
        }
        if (sessionHandle) {
          return (
            <VisitableViewNativeComponent
              {...props}
              // onVisitProposal={e => console.warn(e.nativeEvent)}
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
