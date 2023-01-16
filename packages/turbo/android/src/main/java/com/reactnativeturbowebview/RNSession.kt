package com.reactnativeturbowebview

import android.app.Activity
import android.webkit.JavascriptInterface
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactApplicationContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView
import java.util.*
import org.json.JSONObject

class RNSession(context: ReactApplicationContext) {

  private val registeredVisitableViews = mutableListOf<SessionSubscriber>()

  val turboSession: TurboSession = run {
    val activity = context.currentActivity as AppCompatActivity
    val webView = TurboWebView(context, null)

    val sessionName = UUID.randomUUID().toString()
    webView.getSettings().setJavaScriptEnabled(true)
    webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
    val session = TurboSession(sessionName, activity, webView)
    session.isRunningInAndroidNavigation = false
    session
  }

//  fun sendEvent(event: RNSessionEvent, params: WritableMap) {
//    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
//  }

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

  inner class JavaScriptInterface {
    @JavascriptInterface
    fun postMessage(messageStr: String) {
      // Android interface works only with primitive types, that's why we need to use JSON
      val messageObj =
        Utils.convertJsonToBundle(JSONObject(messageStr)) // TODO remove double conversion
//      sendEvent(RNSessionEvent.RECEIVED_JS_MESSAGE, Arguments.fromBundle(messageObj)) // TODO: add
    }
  }
}
