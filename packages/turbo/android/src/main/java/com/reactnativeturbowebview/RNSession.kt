package com.reactnativeturbowebview

import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView
import java.util.*
import org.json.JSONObject

class RNSession(
  private val reactContext: ReactApplicationContext,
  private val sessionHandle: String = "Default",
  private val applicationNameForUserAgent: String? = "",
  private val registeredVisitableViews: MutableList<SessionSubscriber> = mutableListOf()
) {

  val turboSession: TurboSession = run {
    val activity = reactContext.currentActivity as AppCompatActivity
    val webView = TurboWebView(reactContext, null)

    val sessionName = UUID.randomUUID().toString()
    webView.getSettings().setJavaScriptEnabled(true)
    webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
    setUserAgentString(webView, applicationNameForUserAgent)
    val session = TurboSession(sessionName, activity, webView)
    session.isRunningInAndroidNavigation = false
    session
  }

  /**
   * Sends message from web view js runtime to the RN runtime
   */
  fun sendMessage(params: WritableMap) {
    val eventName = "sessionMessage${sessionHandle}"
    Log.d("RNSession", "$eventName")
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  internal fun registerVisitableView(newView: SessionSubscriber) {
    var callbacksCount = registeredVisitableViews.size

    if (callbacksCount == 0) {
      newView.attachWebViewAndVisit()
    } else {
      fun onDetached() = synchronized(this) {
        callbacksCount--
        if (callbacksCount == 0) {
          newView.attachWebViewAndVisit()
        }
      }

      for (view in registeredVisitableViews) {
        view.detachWebView() {
          onDetached()
        }
      }
    }

    if (!registeredVisitableViews.contains(newView)) {
      registeredVisitableViews.add(newView)
    }
  }

  internal fun removeVisitableView(view: SessionSubscriber) {
    registeredVisitableViews.remove(view)
  }

  private fun setUserAgentString(webView: TurboWebView, applicationNameForUserAgent: String?){
    var userAgentString = WebSettings.getDefaultUserAgent(webView.context)
    if (applicationNameForUserAgent != null) {
      userAgentString = "$userAgentString $applicationNameForUserAgent"
    }
    webView.settings.userAgentString = userAgentString
  }

  inner class JavaScriptInterface {
    @JavascriptInterface
    fun postMessage(messageStr: String) {
      // Android interface works only with primitive types, that's why we need to use JSON
      val messageObj =
        Utils.convertJsonToBundle(JSONObject(messageStr)) // TODO remove double conversion
      sendMessage(Arguments.fromBundle(messageObj))
    }
  }
}
