package com.reactnativeturbowebview

import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.whenStateAtLeast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
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
  private val reactContext: ReactApplicationContext,
  private val sessionHandle: String,
  private val applicationNameForUserAgent: String?,
) : SessionCallbackAdapter {

  var visitableView: SessionSubscriber? = null

  private val turboSession: TurboSession = run {
    val activity = reactContext.currentActivity as AppCompatActivity
    val webView = TurboWebView(activity, null)
    val session = TurboSession(sessionHandle, activity, webView)

    WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
    webView.settings.setJavaScriptEnabled(true)
    webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
    setUserAgentString(webView, applicationNameForUserAgent)
    webView.webChromeClient = RNWebChromeClient(reactContext, this@RNSession)
    session.isRunningInAndroidNavigation = false
    session
  }
  val webView: TurboWebView get() = turboSession.webView
  val currentVisit: TurboVisit? get() = turboSession.currentVisit

  internal fun registerVisitableView(newView: SessionSubscriber) {
    visitableView = newView
  }

  private fun setUserAgentString(webView: TurboWebView, applicationNameForUserAgent: String?) {
    var userAgentString = WebSettings.getDefaultUserAgent(webView.context)
    if (applicationNameForUserAgent != null) {
      userAgentString = "$userAgentString $applicationNameForUserAgent"
    }
    webView.settings.userAgentString = userAgentString
  }

  fun visit(url: String, restoreWithCachedSnapshot: Boolean, reload: Boolean, viewTreeLifecycleOwner: LifecycleOwner?, visitOptions: TurboVisitOptions?){
    val restore = restoreWithCachedSnapshot && !reload

    val options = visitOptions ?: when {
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
      visitableView?.handleMessage(messageObj)
    }
  }

  fun reload() {
    webView.post {
      visitableView?.reload(true)
    }
  }

  fun refresh() {
    webView.post {
      visitableView?.refresh()
    }
  }

  fun clearSnapshotCache() {
    // turbo-android doesn't expose a way to clear the snapshot cache, so we have to do it manually
    webView.post {
      webView.evaluateJavascript("window.Turbo.session.clearCache();", null)
    }
  }

  // region SessionCallbackAdapter

  override fun onReceivedError(errorCode: Int) {
    visitableView?.onReceivedError(errorCode)
  }

  override fun onRenderProcessGone() {
    visitableView?.onRenderProcessGone()
  }

  override fun onZoomReset(newScale: Float) {
    visitableView?.onZoomReset(newScale)
  }

  override fun onZoomed(newScale: Float) {
    visitableView?.onZoomed(newScale)
  }

  override fun visitCompleted(completedOffline: Boolean) {
    visitableView?.visitCompleted(completedOffline)
  }

  override fun visitLocationStarted(location: String) {
    visitableView?.visitLocationStarted(location)
  }

  override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
    visitableView?.visitProposedToLocation(location, options)
  }

  override fun visitRendered() {
    visitableView?.visitRendered()
  }

  override fun formSubmissionStarted(location: String) {
    visitableView?.didStartFormSubmission(location)
  }

  override fun formSubmissionFinished(location: String) {
    visitableView?.didFinishFormSubmission(location)
  }

  override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {
    visitableView?.requestFailedWithStatusCode(visitHasCachedSnapshot, statusCode)
  }

  // end region

}
