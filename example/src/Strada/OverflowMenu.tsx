import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { BridgeComponent, StradaMessage } from 'react-native-turbo';
import { NavigationContext } from '@react-navigation/native';

export default class Form extends BridgeComponent {
  static componentName = 'overflow-menu';
  static contextType = NavigationContext;

  onReceive(message: StradaMessage) {
    if (message.event === 'connect') {
      const onPress = () => this.replyTo('connect');

      this.context.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={onPress}>
            <Image
              source={require('./overflow-menu.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        ),
      });
    }
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});
