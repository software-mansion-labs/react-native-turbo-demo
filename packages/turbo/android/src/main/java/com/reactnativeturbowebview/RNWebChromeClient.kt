package com.reactnativeturbowebview

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.ReactApplicationContext


class RNWebChromeClient(
  reactContext: ReactApplicationContext
) : ActivityEventListener, WebChromeClient() {

  private val fileChooserDelegate = RNFileChooserDelegate(reactContext)

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun onShowFileChooser(
    webView: WebView,
    filePathCallback: ValueCallback<Array<Uri>>,
    fileChooserParams: FileChooserParams
  ): Boolean {
    return fileChooserDelegate.onShowFileChooser(filePathCallback, fileChooserParams)
  }


  override fun onActivityResult(p0: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    fileChooserDelegate.onActivityResult(resultCode, data)
  }

  override fun onNewIntent(p0: Intent?) {

  }
}
