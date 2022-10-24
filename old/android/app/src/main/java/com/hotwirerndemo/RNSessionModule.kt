package com.hotwirerndemo

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.UIManagerModule
import dev.hotwire.turbo.session.TurboSession

private const val MODULE_NAME = "RNSessionModule"

class RNSessionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = MODULE_NAME

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
