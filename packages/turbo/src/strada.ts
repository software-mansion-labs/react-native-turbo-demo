import { useCallback, useRef, useEffect } from 'react';
import { getNativeModule, registerMessageEventListener } from './common';
import type {
  VisitableViewModule,
  StradaComponentWrapper,
  StradaEvent,
} from './types';

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

export const stradaComponent: StradaComponentWrapper = (name, component) => ({
  name,
  StradaReactComponent: component,
});

export const useStrada = (
  props: {
    name: string;
    url: string;
    sessionHandle: string;
  },
  onReceive: (event: StradaEvent) => void
) => {
  const { name, url, sessionHandle } = props;

  const previousMessages = useRef<{ [event: string]: StradaEvent }>({});

  const didReceive = useCallback(
    (e) => {
      if (url !== (e as StradaEvent)?.data.metadata.url) {
        return;
      }
      previousMessages.current[e.event] = e;
      onReceive(e);
    },
    [onReceive, url]
  );

  useEffect(() => {
    const eventHandlerEventSubscription = registerMessageEventListener(
      name,
      didReceive
    );
    return () => eventHandlerEventSubscription.remove();
  }, [didReceive, name]);

  return useCallback(
    (event: string, data?: object) => {
      const previousMessage = previousMessages.current[event];
      const messageToSend = previousMessage
        ? {
            ...previousMessage,
            data: {
              ...previousMessage.data,
              ...data,
            },
          }
        : {
            component: name,
            event,
            data: {
              ...data,
              metadata: {
                url,
              },
            },
          };
      RNVisitableViewModule.injectJavaScript(
        sessionHandle,
        `window.nativeBridge.replyWith('${JSON.stringify(messageToSend)}')`
      );
    },
    [name, sessionHandle, url]
  );
};
