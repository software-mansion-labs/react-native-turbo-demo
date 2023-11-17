import { Component } from 'react';
import type { EmitterSubscription } from 'react-native';
import type {
  VisitableViewModule,
  StradaEvent,
  StradaMessages,
  StradaReactComponentProps,
} from './types';
import { getNativeModule, registerMessageEventListener } from './common';

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

const registerStradaMessageEventListener = (component) =>
  registerMessageEventListener(component.name, (e: object) => {
    const message = e as StradaEvent;
    if (message.data.metadata.url !== component.url) {
      return;
    }
    component.previousMessages[message.event] = message;
    component.onReceive(message);
  });

class BridgeComponent extends Component {
  private name: string;
  private url: string;
  private sessionHandle: string;
  private messageEventListenerSubscription?: EmitterSubscription;
  private previousMessages: StradaMessages = {};

  constructor(props: StradaReactComponentProps) {
    super(props);

    this.url = props.url;
    this.name = props.name;
    this.sessionHandle = props.sessionHandle;

    this.onReceive = this.onReceive.bind(this);
    this.replyTo = this.replyTo.bind(this);
  }

  componentDidMount() {
    this.messageEventListenerSubscription =
      registerStradaMessageEventListener(this);
  }

  componentWillUnmount() {
    this.messageEventListenerSubscription?.remove();
  }

  replyTo(event: string, data?: object) {
    const previousMessage = this.previousMessages[event];
    const messageToSend = previousMessage
      ? {
          ...previousMessage,
          data: {
            ...previousMessage.data,
            ...data,
          },
        }
      : {
          component: this.name,
          event,
          data: {
            ...data,
            metadata: {
              url: this.url,
            },
          },
        };
    RNVisitableViewModule.injectJavaScript(
      this.sessionHandle,
      `window.nativeBridge.replyWith('${JSON.stringify(messageToSend)}')`
    );
  }

  render() {
    return null;
  }
}

export { BridgeComponent };
