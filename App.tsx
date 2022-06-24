import React, {useState} from 'react';
import {Button, SafeAreaView} from 'react-native';
import TurboWebview from './TurboWebview/TurboWebview';

interface Props {}

const App: React.FC<Props> = () => {
  const [shown, setShown] = useState(true);
  return (
    <SafeAreaView style={{flex: 1}}>
      <Button title="show/hide webview" onPress={() => setShown(false)} />
      {shown && <TurboWebview />}
    </SafeAreaView>
  );
};

export default App;
