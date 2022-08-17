import React from 'react';

interface SessionContextValue {
  sessionHandle?: number | null;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionHandle: undefined,
});
