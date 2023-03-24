import type { OnErrorCallback } from 'packages/turbo/src/types';
import React from 'react';

interface SessionContextValue {
  sessionHandle?: string | null;
  onVisitError?: OnErrorCallback;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionHandle: undefined,
  onVisitError: undefined,
});
