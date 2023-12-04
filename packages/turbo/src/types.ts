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

export type OnErrorCallback = (error: VisitProposalError) => void;

export type StradaComponentProps = {
  sessionHandle: string;
  url: string;
  name: string;
};

export type StradaComponent = React.ComponentType<StradaComponentProps> & {
  componentName: string;
};

export type StradaMessages = {
  [event: string]: StradaMessage;
};
