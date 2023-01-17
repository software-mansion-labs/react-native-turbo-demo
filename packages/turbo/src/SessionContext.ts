import React from 'react';

interface SessionContextValue {
  sessionHandle?: string | null;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionHandle: undefined,
});
