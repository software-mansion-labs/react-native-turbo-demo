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

class BridgeComponent extends Component {
  private name: string;
  private url: string;
  private sessionHandle: string;
  private eventHandlerEventSubscription?: EmitterSubscription;
  private previousMessages: StradaMessages = {};

  constructor(props: StradaReactComponentProps) {
    super(props);
    this.url = props.url;
    this.name = props.name;
    this.sessionHandle = props.sessionHandle;
    this.didReceive = this.didReceive.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.replyTo = this.replyTo.bind(this);
  }

  componentDidMount() {
    this.eventHandlerEventSubscription = registerMessageEventListener(
      this.name,
      this.didReceive
    );
  }

  componentWillUnmount() {
    this.eventHandlerEventSubscription?.remove();
  }

  didReceive(e: object) {
    const message = e as StradaEvent;
    if (message.data.metadata.url !== this.url) {
      return;
    }
    this.previousMessages[message.event] = message;
    this.onReceive(message);
  }

  onReceive(_e: StradaEvent) {
    throw new Error(
      `BridgeComponent.onReceive must be overridden by ${this.name}`
    );
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
