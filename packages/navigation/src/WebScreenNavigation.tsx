import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, { useMemo } from 'react';
import { LinkingConfig } from './hooks/useCurrentUrl';
import { getLinkingObject } from './buildWebScreen';

interface Props {
  linkingConfig: LinkingConfig;
  baseURL: string;
}

const WebScreenNavigation: React.FC<Props> = ({
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
    <NavigationContainer linking={linking} ref={navigation}>
      {children}
    </NavigationContainer>
  );
};

export default WebScreenNavigation;
