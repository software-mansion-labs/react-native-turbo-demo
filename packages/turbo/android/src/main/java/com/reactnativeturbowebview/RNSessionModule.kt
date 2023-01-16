package com.reactnativeturbowebview

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerModule
import java.util.UUID

private const val MODULE_NAME = "RNSessionModule"

@ReactModule(name = MODULE_NAME)
class RNSessionModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = MODULE_NAME

  private var sessions = mapOf<String, RNSession>()

  // Lazy property needs to be set on the UI thread
  private val defaultSession: RNSession by lazy {
    RNSession(context = reactContext, activity = currentActivity)
  }

  @ReactMethod
  fun registerSession(promise: Promise) {
    val sessionHandle = UUID.randomUUID().toString()
    Log.d("RNSession", "register session $sessionHandle")
    promise.resolve(sessionHandle)
  }

  @ReactMethod
  fun removeSession(sessionHandle: String, promise: Promise) {
    Log.d("RNSession", "removeSession session $sessionHandle")
  }

  fun getSession(sessionHandle: String?): RNSession {
    Log.d("RNSession", "getSession session $sessionHandle")
    return defaultSession
  }

  // TODO: Add promise from WebView JS handling on Android
  @ReactMethod
  fun injectJavaScript(sessionHandle: Int, callback: String, promise: Promise) {
    val uiManager = reactApplicationContext.getNativeModule(UIManagerModule::class.java)
    reactApplicationContext.currentActivity?.runOnUiThread {
      val sessionView = uiManager?.resolveView(sessionHandle) as RNSession
      sessionView.turboSession.webView.evaluateJavascript(callback) {
        promise.resolve(it)
      }
    }
  }
}
