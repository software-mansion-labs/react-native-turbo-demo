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

export type StradaEvent = {
  component: string;
  event: string;
  data: {
    metadata: {
      url: string;
    };
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

export type StradaReactComponentProps = {
  sessionHandle: string;
  url: string;
  name: string;
};

type StradaReactComponent = React.ComponentType<StradaReactComponentProps>;

export type StradaComponent = {
  name: string;
  StradaReactComponent: StradaReactComponent;
};

export type StradaComponentWrapper = (
  name: string,
  component: StradaReactComponent
) => StradaComponent;
