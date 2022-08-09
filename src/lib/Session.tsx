import React, {useEffect, useState} from 'react';
import {SessionContext} from './SessionContext';
import SessionNativeModule from './SessionNativeModule';

interface Props {}

const Session: React.FC<Props> = ({children}) => {
  const [sessionId, setSessionId] = useState<string | undefined>();

  const generateNewSession = async () => {
    await SessionNativeModule.createSession(setSessionId);
  };

  useEffect(() => {
    generateNewSession();
  }, []);

  return (
    <SessionContext.Provider value={{sessionId}}>
      {children}
    </SessionContext.Provider>
  );
};

export default Session;
