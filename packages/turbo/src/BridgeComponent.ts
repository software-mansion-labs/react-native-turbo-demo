import { Component } from 'react';
import type { EmitterSubscription } from 'react-native';
import type {
  VisitableViewModule,
  StradaMessage,
  StradaMessages,
  StradaComponentProps,
} from './types';
import { getNativeModule, registerMessageEventListener } from './common';

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

const registerStradaMessageEventListener = (component: BridgeComponent) =>
  registerMessageEventListener(component.name, (e: object) => {
    const message = e as StradaMessage;
    if (message.data.metadata.url !== component.url) {
      return;
    }
    component.previousMessages[message.event] = message;
    component.onReceive(message);
  });

class BridgeComponent extends Component {
  name: string;
  url: string;
  sessionHandle: string;
  messageEventListenerSubscription?: EmitterSubscription;
  previousMessages: StradaMessages = {};

  constructor(props: StradaComponentProps) {
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

  onReceive(_message: StradaMessage) {
    // This is a no-op, but it can be overridden by the subclass
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
