import { Button } from 'react-native';
import React from 'react';
import { BridgeComponent, StradaMessage } from 'react-native-turbo';
import { NavigationContext } from '@react-navigation/native';

export default class Form extends BridgeComponent {
  static name = 'form';
  static contextType = NavigationContext;
  private submitTitle: string;

  setHeaderButton(disabled: boolean) {
    this.context.setOptions({
      headerRight: () => (
        <Button
          onPress={() => this.replyTo('connect')}
          title={submitTitle}
          disabled={disabled}
        />
      ),
    });
  }

  onReceive(message: StradaMessage) {
    switch (message.event) {
      case 'connect':
        submitTitle = message.data.submitTitle;
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
