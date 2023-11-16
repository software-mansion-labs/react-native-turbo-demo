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

export type SessionMessageCallback = (message: object) => void;

export interface VisitableViewModule {
  setConfiguration: (sessionHandle: string) => Promise<string>;
  registerSession: () => Promise<string>;
  removeSession: (sessionHandle: string) => Promise<string>;
  injectJavaScript: (
    sessionHandle: string | null,
    callbackStringified: string
  ) => Promise<unknown>;
}

export type OnErrorCallback = (error: VisitProposalError) => void;
