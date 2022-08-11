import React from 'react';

interface SessionContextValue {
  sessionHandle: number | undefined;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionHandle: undefined,
});
