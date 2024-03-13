import { useLinkTo } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import type { OnErrorCallback, RenderError } from "react-native-turbo";

import WebView, { type Props } from "./WebView";

const MainScreen: React.FC<Props> = (props) => {
  const linkTo = useLinkTo();
  const [renderError, setRenderError] = useState<RenderError | undefined>(
    () => () => null,
  );

  const onError: OnErrorCallback = useCallback(
    (error) => {
      const notLoggedIn = error.statusCode === 401;
      if (notLoggedIn) {
        linkTo("/signin");
      } else {
        setRenderError(undefined);
      }
    },
    [linkTo],
  );

  return <WebView {...props} onError={onError} renderError={renderError} />;
};

export default MainScreen;
