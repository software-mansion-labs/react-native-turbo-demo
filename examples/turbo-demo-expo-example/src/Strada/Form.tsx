import { NavigationContext } from '@react-navigation/native';
import React from 'react';
import { Button } from 'react-native';
import { BridgeComponent, StradaMessage } from 'react-native-turbo';

export default class Form extends BridgeComponent {
  static componentName = 'form';
  static contextType = NavigationContext;
  private submitTitle: string = 'Submit';

  setHeaderButton(disabled: boolean) {
    // @ts-ignore
    this.context.setOptions({
      headerRight: () => (
        <Button
          onPress={() => this.replyTo('connect')}
          title={this.submitTitle}
          disabled={disabled}
        />
      ),
    });
  }

  onReceive(message: StradaMessage) {
    switch (message.event) {
      case 'connect':
        this.submitTitle = message.data.submitTitle;
        this.setHeaderButton(false);
        break;

      case 'submitDisabled':
        this.setHeaderButton(true);
        break;

      case 'submitEnabled':
        this.setHeaderButton(false);
        break;
    }
  }
}
