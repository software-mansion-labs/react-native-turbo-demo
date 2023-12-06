package com.reactnativeturbowebview

import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.whenStateAtLeast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitAction
import dev.hotwire.turbo.visit.TurboVisitOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class RNSession(
  private val reactContext: ReactContext,
  private val sessionHandle: String,
  private val applicationNameForUserAgent: String?,
) : SessionCallbackAdapter {

  private val visitableViews: LinkedHashSet<SessionSubscriber> = linkedSetOf()

  private val turboSession: TurboSession = run {
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
  val webView: TurboWebView get() = turboSession.webView
  val currentVisit: TurboVisit? get() = turboSession.currentVisit

  internal fun registerVisitableView(newView: SessionSubscriber) {
    for (view in visitableViews) {
      view.detachWebView()
    }
    visitableViews.add(newView)
  }

  internal fun removeVisitableView(view: SessionSubscriber) {
    visitableViews.remove(view)
  }

  private fun setUserAgentString(webView: TurboWebView, applicationNameForUserAgent: String?) {
    var userAgentString = WebSettings.getDefaultUserAgent(webView.context)
    if (applicationNameForUserAgent != null) {
      userAgentString = "$userAgentString $applicationNameForUserAgent"
    }
    webView.settings.userAgentString = userAgentString
  }

  fun visit(url: String, restoreWithCachedSnapshot: Boolean, reload: Boolean, viewTreeLifecycleOwner: LifecycleOwner?) {
    val restore = restoreWithCachedSnapshot && !reload

    val options = when {
      restore -> TurboVisitOptions(action = TurboVisitAction.RESTORE)
      else -> TurboVisitOptions()
    }

    viewTreeLifecycleOwner?.lifecycleScope?.launch {
      val snapshot = when (options.action) {
        TurboVisitAction.ADVANCE -> fetchCachedSnapshot(url)
        else -> null
      }

      viewTreeLifecycleOwner.lifecycle.whenStateAtLeast(Lifecycle.State.STARTED) {
        turboSession.visit(
          TurboVisit(
            location = url,
            destinationIdentifier = url.hashCode(),
            restoreWithCachedSnapshot = restoreWithCachedSnapshot,
            reload = reload,
            callback = this@RNSession,
            options = options.copy(snapshotHTML = snapshot)
          )
        )
      }
    }
  }

  private suspend fun fetchCachedSnapshot(url: String): String? {
    return withContext(Dispatchers.IO) {
      val response = turboSession.offlineRequestHandler?.getCachedSnapshot(
        url = url
      )
      response?.data?.use {
        String(it.readBytes())
      }
    }
  }

  fun restoreCurrentVisit(): Boolean {
    return turboSession.restoreCurrentVisit(callback = this)
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

  // region SessionCallbackAdapter

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

  // end region

}
