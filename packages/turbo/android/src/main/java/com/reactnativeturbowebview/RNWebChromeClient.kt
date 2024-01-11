package com.reactnativeturbowebview

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Message
import android.provider.Settings.Global.putString
import android.util.Log
import android.webkit.JsResult
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter


class RNWebChromeClient(
  private val reactContext: ReactApplicationContext,
  private val visitableViews: LinkedHashSet<SessionSubscriber>
) : ActivityEventListener, WebChromeClient() {

  private val fileChooserDelegate = RNFileChooserDelegate(reactContext)

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun onCreateWindow(
    view: WebView?, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message?
  ): Boolean {
    val result = view!!.hitTestResult
    val data = result.extra
    val uri = Uri.parse(data)
    visitableViews.lastOrNull()?.didOpenExternalUrl(uri.toString())
    return false
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

  override fun onJsAlert(
    view: WebView?, url: String?, message: String?, result: JsResult?
  ): Boolean {
    visitableViews.lastOrNull()?.let {
      it.handleAlert(message ?: "") { result?.confirm() }
    } ?: run {
      result?.confirm()
    }
    return true
  }

  override fun onJsConfirm(
    view: WebView?, url: String?, message: String?, result: JsResult?
  ): Boolean {
    visitableViews.lastOrNull()?.let {
      it.handleConfirm(
        message ?: ""
      ) { confirmed -> if (confirmed) result?.confirm() else result?.cancel() }
    } ?: run {
      result?.cancel()
    }
    return true
  }
}
