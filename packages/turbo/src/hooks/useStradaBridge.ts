import { useCallback, useMemo } from 'react';

import type { StradaComponent, DispatchCommand } from '../types';
import { stradaBridgeScript } from '../utils/stradaBridgeScript';

export const useStradaBridge = (
  visitableViewRef: React.RefObject<any>,
  dispatchCommand: DispatchCommand,
  stradaComponents?: StradaComponent[]
) => {
  const initializeStradaBridge = useCallback(() => {
    const stradaComponentNames =
      stradaComponents?.map(({ componentName }) => componentName) || [];
    const stradaInitializationScript = `
      ${stradaBridgeScript}
      window.nativeBridge.register(${JSON.stringify(stradaComponentNames)})
    `;

    dispatchCommand(
      visitableViewRef,
      'injectJavaScript',
      stradaInitializationScript
    );
  }, [dispatchCommand, stradaComponents, visitableViewRef]);

  const stradaUserAgent = useMemo(() => {
    if (!stradaComponents) return '';

    const componentNames = stradaComponents.map(
      ({ componentName }) => componentName
    );

    return `bridge-components: [${componentNames.join(' ')}]`;
  }, [stradaComponents]);

  const sendToBridge = useCallback(
    (message: any) =>
      dispatchCommand(
        visitableViewRef,
        'injectJavaScript',
        `window.nativeBridge.replyWith('${JSON.stringify(message)}')`
      ),
    [dispatchCommand, visitableViewRef]
  );

  return {
    initializeStradaBridge,
    stradaUserAgent,
    sendToBridge,
  };
};
