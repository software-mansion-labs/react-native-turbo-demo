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
class RNSessionModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = MODULE_NAME

  // Sessions must be lazy properties because we cant call view methods
  // on another thread than the UI thread
  private val sessions = mutableMapOf<String, Lazy<RNSession>>()
  private val defaultSession: RNSession by lazy {
    RNSession(reactContext)
  }

  @ReactMethod
  fun registerSession(promise: Promise) {
    var sessionHandle = UUID.randomUUID().toString()
    sessions[sessionHandle] = lazy { RNSession(reactContext, sessionHandle) }
    promise.resolve(sessionHandle)
  }

  @ReactMethod
  fun removeSession(sessionHandle: String, promise: Promise) {
    sessions.remove(sessionHandle)
    promise.resolve(sessionHandle)
  }

  fun getSession(sessionHandle: String?): RNSession {
    if (!sessions.containsKey(sessionHandle)) {
      return defaultSession
    }
    return sessions[sessionHandle]!!.value
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
