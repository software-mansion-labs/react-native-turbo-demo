package com.reactnativeturbowebview

import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisitOptions
import org.json.JSONObject

class RNSession(
  private val reactContext: ReactContext,
  private val sessionHandle: String,
  private val applicationNameForUserAgent: String?,
): SessionCallbackAdapter {

  private val visitableViews: LinkedHashSet<SessionSubscriber> = linkedSetOf()

  val turboSession: TurboSession = run {
    val activity = reactContext.currentActivity as AppCompatActivity
    val webView = TurboWebView(reactContext, null)
    val session = TurboSession(sessionHandle, activity, webView)

    webView.settings.setJavaScriptEnabled(true)
    webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
    setUserAgentString(webView, applicationNameForUserAgent)
    webView.webChromeClient = RNWebChromeClient(reactContext)
    session.isRunningInAndroidNavigation = false
    session
  }

  internal fun registerVisitableView(newView: SessionSubscriber) {
    var callbacksCount = visitableViews.size

    if (callbacksCount == 0) {
      newView.attachWebViewAndVisit()
    } else {
      fun onDetached() = synchronized(this) {
        callbacksCount--
        if (callbacksCount == 0) {
          newView.attachWebViewAndVisit()
        }
      }

      for (view in visitableViews) {
        view.detachWebView() {
          onDetached()
        }
      }
    }

    if (!visitableViews.contains(newView)) {
      visitableViews.add(newView)
    }
  }

  internal fun removeVisitableView(view: SessionSubscriber) {
    visitableViews.remove(view)
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
        Arguments.fromBundle(Utils.convertJsonToBundle(JSONObject(messageStr)))
      for (view in visitableViews) {
        view.handleMessage(messageObj)
      }
    }
  }

  override fun onReceivedError(errorCode: Int) {
    visitableViews.last().onReceivedError(errorCode)
  }

  override fun onRenderProcessGone() {
    visitableViews.last().onRenderProcessGone()
  }

  override fun onZoomReset(newScale: Float) {
    visitableViews.last().onZoomReset(newScale)
  }

  override fun onZoomed(newScale: Float) {
    visitableViews.last().onZoomed(newScale)
  }

  override fun visitCompleted(completedOffline: Boolean) {
    visitableViews.last().visitCompleted(completedOffline)
  }

  override fun visitLocationStarted(location: String) {
    visitableViews.last().visitLocationStarted(location)
  }

  override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
    visitableViews.last().visitProposedToLocation(location, options)
  }

  override fun visitRendered() {
    visitableViews.last().visitRendered()
  }
}
