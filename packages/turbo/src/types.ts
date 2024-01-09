export type Action = 'advance' | 'replace' | 'restore';

export interface VisitProposal {
  url: string;
  action: Action;
}

export interface LoadEvent {
  title: string;
  url: string;
}

export interface OpenExternalUrlEvent {
  url: string;
}

export interface FormSubmissionEvent {
  url: string;
}

export interface ContentProcessDidTerminateEvent {
  url: string;
}

export type MessageEvent = object;

export interface AlertHandler {
  message: string;
}
export interface VisitProposalError {
  statusCode: number;
  url: string;
  error?: string;
}

export type StradaMessage = {
  component: string;
  event: string;
  data: {
    metadata: {
      url: string;
    };
    [key: string]: any;
  };
};

export type SessionMessageCallback = (message: object) => void;

export type OnErrorCallback = (error: VisitProposalError) => void;

export type StradaComponentProps = {
  sessionHandle: string;
  url: string;
  name: string;
  registerMessageListener: (listener: SessionMessageCallback) => void;
  sendToBridge: (message: StradaMessage) => void;
};

export type StradaComponent = React.ComponentType<StradaComponentProps> & {
  componentName: string;
};

export type StradaMessages = {
  [event: string]: StradaMessage;
};

// list of methods available for RNVisitableView module
export type DispatchCommandTypes =
  | 'injectJavaScript'
  | 'reload'
  | 'sendAlertResult'
  | 'sendConfirmResult';

export type DispatchCommand = (
  ref: React.RefObject<any>,
  command: DispatchCommandTypes,
  ...args: any[]
) => void;
