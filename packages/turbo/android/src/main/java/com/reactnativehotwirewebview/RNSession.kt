package com.reactnativehotwirewebview

import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.whenStateAtLeast
import com.facebook.react.bridge.ReactApplicationContext
import com.reactnativehotwirewebview.RNWebChromeClient
import com.reactnativehotwirewebview.SessionCallbackAdapter
import com.reactnativehotwirewebview.SessionSubscriber
import com.reactnativehotwirewebview.Utils
import dev.hotwire.core.config.Hotwire
import dev.hotwire.core.turbo.errors.VisitError
import dev.hotwire.core.turbo.session.Session
import dev.hotwire.core.turbo.webview.HotwireWebView
import dev.hotwire.core.turbo.visit.Visit
import dev.hotwire.core.turbo.visit.VisitAction
import dev.hotwire.core.turbo.visit.VisitOptions
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

  private val turboSession: Session = run {
    val activity = reactContext.currentActivity as AppCompatActivity
    val webView = HotwireWebView(activity, null)
    val session = Session(sessionHandle, activity, webView)

    webView.settings.setJavaScriptEnabled(true)
    webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
    setUserAgentString(webView, applicationNameForUserAgent)
    webView.webChromeClient = RNWebChromeClient(reactContext, this@RNSession)
    session.isRunningInAndroidNavigation = false
    session
  }
  val webView: HotwireWebView get() = turboSession.webView
  val currentVisit: Visit? get() = turboSession.currentVisit

  internal fun registerVisitableView(newView: SessionSubscriber) {
    visitableView = newView
  }

  private fun setUserAgentString(webView: HotwireWebView, applicationNameForUserAgent: String?) {
    var userAgentString = WebSettings.getDefaultUserAgent(webView.context)
    if (applicationNameForUserAgent != null) {
      userAgentString = "$userAgentString $applicationNameForUserAgent"
    }
    webView.settings.userAgentString = userAgentString
  }

  fun visit(url: String, restoreWithCachedSnapshot: Boolean, reload: Boolean, viewTreeLifecycleOwner: LifecycleOwner?, visitOptions: VisitOptions?){
    val restore = restoreWithCachedSnapshot && !reload

    val options = visitOptions ?: when {
      restore -> VisitOptions(action = VisitAction.RESTORE)
      else -> VisitOptions()
    }

    viewTreeLifecycleOwner?.lifecycleScope?.launch {
      val snapshot = when (options.action) {
        VisitAction.ADVANCE -> fetchCachedSnapshot(url)
        else -> null
      }

      viewTreeLifecycleOwner.lifecycle.whenStateAtLeast(Lifecycle.State.STARTED) {
        turboSession.visit(
          Visit(
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
      val response = Hotwire.config.offlineRequestHandler?.getCachedSnapshot(
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
      val messageObj = Utils.convertJsonToMap(JSONObject(messageStr))
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
    // hotwire-native-android doesn't expose a way to clear the snapshot cache, so we have to do it manually
    webView.post {
      webView.evaluateJavascript("window.Turbo.session.clearCache();", null)
    }
  }

  // region SessionCallbackAdapter

  override fun onReceivedError(error: VisitError) {
    visitableView?.onReceivedError(error)
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

  override fun visitProposedToCrossOriginRedirect(location: String) {
    visitableView?.visitProposedToCrossOriginRedirect(location)
  }

  override fun visitProposedToLocation(location: String, options: VisitOptions) {
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

  override fun requestFailedWithError(visitHasCachedSnapshot: Boolean, error: VisitError) {
    visitableView?.requestFailedWithError(visitHasCachedSnapshot, error)
  }

  // end region

}
