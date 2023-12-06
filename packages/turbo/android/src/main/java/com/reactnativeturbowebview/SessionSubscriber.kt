package com.reactnativeturbowebview

import com.facebook.react.bridge.WritableMap

interface SessionSubscriber: SessionCallbackAdapter {
  fun detachWebView()
  fun handleMessage(message: WritableMap)
  fun injectJavaScript(script: String)
}
