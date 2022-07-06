import {NavigationAction} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, View, NativeSyntheticEvent, Alert} from 'react-native';
import {BASE_URL, Routes} from './config';
import VisitableView, {OnLoadEvent, VisitProposal} from './VisitableView';
import {useLinkTo} from '@react-navigation/native';
import {replace} from 'lodash';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: any;
}

const WebviewScreen: React.FC<Props> = ({navigation, route}) => {
  const linkTo = useLinkTo();

  const currentUrl = route?.path ? `${BASE_URL}/${route?.path}` : BASE_URL;

  console.warn({currentUrl, route});

  const onVisitProposal = ({
    nativeEvent: {action: actionType, url},
  }: NativeSyntheticEvent<VisitProposal>) => {
    // TODO implement
    const path = replace(url, BASE_URL, '');
    console.warn('path', {url, path});

    // const action: NavigationAction = {
    //   type: WebviewNavActions.openWebview,
    //   payload: {
    //     actionType,
    //     url,
    //   },
    // };
    // navigation.dispatch(action);

    linkTo(path);

    // switch (action) {
    //   case 'advance': {
    //     navigation.push(Routes.Webview, {
    //       url: url,
    //     });
    //     break;
    //   }
    //   case 'replace': {
    //     navigation.replace(Routes.Webview, {
    //       url: url,
    //     });
    //     break;
    //   }
    //   default: {
    //     Alert.alert('Unsupported action type', action);
    //   }
    // }
  };

  const onLoad = ({
    nativeEvent: {title},
  }: NativeSyntheticEvent<OnLoadEvent>) => {
    navigation.setOptions({title});
  };

  return (
    <View style={styles.container}>
      <VisitableView
        url={currentUrl}
        onVisitProposal={onVisitProposal}
        onLoad={onLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebviewScreen;
