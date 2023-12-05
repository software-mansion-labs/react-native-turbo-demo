import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import type { StradaComponent, DispatchCommand } from './types';

const stradaBridgeScript = `
(() => {
  if(window.nativeBridge !== undefined){
    return;
  }
  // This represents the adapter that is installed on the webBridge
  // All adapters implement the same interface so the web doesn't need to
  // know anything specific about the client platform
  class NativeBridge {
    constructor() {
      this.supportedComponents = [];
      this.adapterIsRegistered = false;
    }

    register(component) {
      if (Array.isArray(component)) {
        this.supportedComponents = this.supportedComponents.concat(component);
      } else {
        if(this.supportsComponent(component)) {
          return;
        }
        this.supportedComponents.push(component);
      }

      if (!this.adapterIsRegistered) {
        this.registerAdapter();
      }
      this.notifyBridgeOfSupportedComponentsUpdate();
    }

    unregister(component) {
      const index = this.supportedComponents.indexOf(component);
      if (index != -1) {
        this.supportedComponents.splice(index, 1);
        this.notifyBridgeOfSupportedComponentsUpdate();
      }
    }

    registerAdapter() {
      this.adapterIsRegistered = true;

      if (this.isStradaAvailable) {
        this.webBridge.setAdapter(this);
      } else {
        document.addEventListener('web-bridge:ready', () =>
          this.webBridge.setAdapter(this)
        );
      }
    }

    notifyBridgeOfSupportedComponentsUpdate() {
      if (this.isStradaAvailable) {
        this.webBridge.adapterDidUpdateSupportedComponents();
      }
    }

    supportsComponent(component) {
      return this.supportedComponents.includes(component);
    }

    // Reply to web with message
    replyWith(message) {
      if (this.isStradaAvailable) {
        this.webBridge.receive(JSON.parse(message));
      }
    }

    // Receive from web
    receive(message) {
      this.postMessage(message);
    }

    get platform() {
      return '${Platform.OS}';
    }

    // Native handler

    postMessage(message) {
      ${
        Platform.OS === 'android'
          ? 'StradaNative.postMessage(JSON.stringify(message))'
          : 'webkit.messageHandlers.nativeApp.postMessage(message)'
      }
    }

    // Web global

    get isStradaAvailable() {
      return window.Strada;
    }

    get webBridge() {
      return window.Strada.web;
    }
  }

  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    initializeBridge();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initializeBridge();
    });
  }

  function initializeBridge() {
    window.nativeBridge = new NativeBridge();
  }
})();
`;

const useStradaBridge = (
  visitableViewRef: React.RefObject<any>,
  dispatchCommand: DispatchCommand,
  stradaComponents?: StradaComponent[]
) => {
  const initializeStradaBridge = useCallback(() => {
    dispatchCommand(visitableViewRef, 'injectJavaScript', stradaBridgeScript);

    const stradaComponentNames =
      stradaComponents
        ?.map(({ componentName }) => `'${componentName}'`)
        .join(',') || '';

    dispatchCommand(
      visitableViewRef,
      'injectJavaScript',
      `[${stradaComponentNames}].forEach(componentName => window.nativeBridge.register(componentName))`
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
    (message: any) => {
      dispatchCommand(
        visitableViewRef,
        'injectJavaScript',
        `window.nativeBridge.replyWith('${JSON.stringify(message)}')`
      );
    },
    [dispatchCommand, visitableViewRef]
  );

  return {
    initializeStradaBridge,
    stradaUserAgent,
    sendToBridge,
  };
};

export { useStradaBridge };
