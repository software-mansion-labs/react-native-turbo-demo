import React from 'react';
import {SafeAreaView} from 'react-native';
import TurboWebview from './TurboWebview/TurboWebview';

interface Props {}

const App: React.FC<Props> = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <TurboWebview url="https://www.google.com" />
    </SafeAreaView>
  );
};

export default App;
