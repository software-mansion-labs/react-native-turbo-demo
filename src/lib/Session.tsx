import React from 'react';
import {SessionContext} from './SessionContext';

interface Props {}

const Session: React.FC<Props> = ({children}) => {
  return (
    <SessionContext.Provider value={{sessionId: 'dupa'}}>
      {children}
    </SessionContext.Provider>
  );
};

export default Session;
