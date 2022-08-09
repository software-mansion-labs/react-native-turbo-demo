import React from 'react';

interface SessionContextValue {
  sessionId: string | undefined;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionId: undefined,
});
