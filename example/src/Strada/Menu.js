import { BridgeComponent } from 'react-native-turbo';
import { connectActionSheet } from '@expo/react-native-action-sheet';

class Menu extends BridgeComponent {
  static componentName = 'menu';

  onReceive(message) {
    if (message.event === 'display') {
      this.handleDisplayEvent(message);
    }
  }

  handleDisplayEvent = (message) => {
    const { title, items } = message.data;
    const options = items.map((item) => item.title);

    this.props.showActionSheetWithOptions(
      {
        title: title,
        options: options,
      },
      (selectedIndex) => {
        this.replyTo(message.event, { selectedIndex });
      }
    );
  };
}

export default connectActionSheet(Menu);
