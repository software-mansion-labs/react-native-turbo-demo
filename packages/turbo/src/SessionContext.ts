import React from "react";

import type { OnErrorCallback } from "./types";

interface SessionContextValue {
  sessionHandle?: string | null;
  onError?: OnErrorCallback;
}

export const SessionContext = React.createContext<SessionContextValue>({
  sessionHandle: undefined,
  onError: undefined,
});
