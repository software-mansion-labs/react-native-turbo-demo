package com.reactnativehotwirewebview

import com.facebook.react.bridge.WritableMap

interface SessionSubscriber: SessionCallbackAdapter {
  fun detachWebView()
  fun handleMessage(message: WritableMap)
  fun injectJavaScript(script: String)
  fun didOpenExternalUrl(url: String)
  fun didStartFormSubmission(url: String)
  fun didFinishFormSubmission(url: String)
  fun handleAlert(message: String, callback: () -> Unit)
  fun handleConfirm(message: String, callback: (result: Boolean) -> Unit)
  fun reload(displayProgress: Boolean)
  fun refresh()
}
