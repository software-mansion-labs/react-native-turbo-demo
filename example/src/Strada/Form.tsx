import { Button } from 'react-native';
import React from 'react';
import { BridgeComponent } from 'react-native-turbo';
import { NavigationContext } from '@react-navigation/native';

export default class Form extends BridgeComponent {
  static name = 'form';
  static contextType = NavigationContext;

  constructor(props) {
    super(props);
  }

  setHeaderButton(disabled: boolean) {
    this.context.setOptions({
      headerRight: () => (
        <Button
          onPress={() => this.replyTo('connect')}
          title="Send"
          disabled={disabled}
        />
      ),
    });
  }

  onReceive(e) {
    switch (e.event) {
      case 'connect':
        this.setHeaderButton(false);
        break;

      case 'submitDisabled':
        this.setHeaderButton(true);
        break;

      case 'submitEnabled':
        this.setHeaderButton(false);
        break;

      default:
        break;
    }
  }
}
