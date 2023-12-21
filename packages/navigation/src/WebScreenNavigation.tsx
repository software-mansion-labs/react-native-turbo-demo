import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, { createContext, useMemo } from 'react';
import { LinkingConfig } from './hooks/useCurrentUrl';
import { getLinkingObject } from './buildWebScreen';

interface ConfigurationProps {
  linkingConfig: LinkingConfig;
  baseURL: string;
}

export const ConfigurationContext = createContext<ConfigurationProps>({
  baseURL: '',
  linkingConfig: { screens: {} },
});

const WebScreenNavigation: React.FC<ConfigurationProps> = ({
  children,
  linkingConfig,
  baseURL,
}) => {
  const linking = useMemo(
    () => getLinkingObject(baseURL, linkingConfig),
    [baseURL, linkingConfig]
  );

  const navigation = useNavigationContainerRef();

  return (
    <ConfigurationContext.Provider value={{ baseURL, linkingConfig }}>
      <NavigationContainer linking={linking} ref={navigation}>
        {children}
      </NavigationContainer>
    </ConfigurationContext.Provider>
  );
};

export default WebScreenNavigation;
