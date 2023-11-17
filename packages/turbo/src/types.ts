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

export interface VisitableViewModule {
  setConfiguration: (
    sessionHandle: string,
    applicationNameForUserAgent?: string
  ) => Promise<string>;
  registerSession: () => Promise<string>;
  removeSession: (sessionHandle: string) => Promise<string>;
  injectJavaScript: (
    sessionHandle: string | null,
    callbackStringified: string
  ) => Promise<unknown>;
  registerEvent: (eventName: string) => void;
  unregisterEvent: (eventName: string) => void;
}

export type OnErrorCallback = (error: VisitProposalError) => void;

export type StradaComponentProps = {
  sessionHandle: string;
  url: string;
  name: string;
};

export type StradaComponent = React.ComponentType<StradaComponentProps>;

export type StradaMessages = {
  [event: string]: StradaMessage;
};
