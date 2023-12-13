package com.reactnativeturbowebview

import com.facebook.react.bridge.WritableMap

interface SessionSubscriber: SessionCallbackAdapter {
  fun detachWebView()
  fun handleMessage(message: WritableMap)
  fun injectJavaScript(script: String)
  fun didOpenExternalUrl(url: String)
  fun handleAlert(message: String, callback: () -> Unit)
  fun handleConfirm(message: String, callback: (result: Boolean) -> Unit)
}
