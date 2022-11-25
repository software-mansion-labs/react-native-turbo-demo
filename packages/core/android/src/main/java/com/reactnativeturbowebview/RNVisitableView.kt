package com.reactnativeturbowebview

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.util.Log
import android.view.ViewGroup
import android.webkit.HttpAuthHandler
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.whenStateAtLeast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.fragments.TurboWebFragmentCallback
import dev.hotwire.turbo.nav.TurboNavDestination
import dev.hotwire.turbo.session.TurboSessionCallback
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitAction
import dev.hotwire.turbo.visit.TurboVisitOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RNVisitableView(context: Context) : LinearLayout(context), TurboSessionCallback,
  SessionSubscriber {

  private var visitableView = inflate(context, R.layout.turbo_view, null) as ViewGroup
  private var turboView: TurboView
  private val viewTreeLifecycleOwner
    get() = turboView?.findViewTreeLifecycleOwner()
  private val reactContext = context as ReactContext
  private var isInitialVisit = true
  lateinit var session: RNSession
  lateinit var url: String
  private var currentlyZoomed = false
  private var isWebViewAttachedToNewDestination = false
  private var screenshotOrientation = 0
  private var screenshotZoomed = false
  private var screenshot: Bitmap? = null

  init {
    addView(visitableView)
    turboView = visitableView.findViewById(R.id.turbo_view)

    turboView.setBackgroundColor(Color.parseColor("#FF0000"))

    currentlyZoomed = false
    turboView?.apply {
      initializePullToRefresh(this)
      initializeErrorPullToRefresh(this)
      showScreenshotIfAvailable(this)
      screenshot = null
      screenshotOrientation = 0
      screenshotZoomed = false
    }
  }

  fun visit(restoreWithCachedSnapshot: Boolean, reload: Boolean) {
    val restore = !restoreWithCachedSnapshot && !reload

    val options = when {
      restore -> TurboVisitOptions(action = TurboVisitAction.RESTORE)
      else -> TurboVisitOptions()
    }

    viewTreeLifecycleOwner?.lifecycleScope?.launch {
      val snapshot = when (options.action) {
        TurboVisitAction.ADVANCE -> fetchCachedSnapshot()
        else -> null
      }

      viewTreeLifecycleOwner?.lifecycle?.whenStateAtLeast(Lifecycle.State.STARTED) {
        session.turboSession.visit(
          TurboVisit(
            location = url,
            destinationIdentifier = url.hashCode(),
            restoreWithCachedSnapshot = restoreWithCachedSnapshot,
            reload = reload,
            callback = this@RNVisitableView,
            options = options.copy(snapshotHTML = snapshot)
          )
        )
      }
    }
  }

  private fun attachWebViewAndVisit() {
    attachWebView {
      isWebViewAttachedToNewDestination = it

      // Visit every time the WebView is reattached to the current Fragment.
      if (isWebViewAttachedToNewDestination) {
        val currentSessionVisitRestored =
          !isInitialVisit && session.turboSession.currentVisit?.destinationIdentifier == url.hashCode() && session.turboSession.restoreCurrentVisit(
            this
          )

        if (!currentSessionVisitRestored) {
          showProgressView()
          visit(restoreWithCachedSnapshot = !isInitialVisit, reload = false)
          isInitialVisit = false
        }
      }
    }
  }

  private suspend fun fetchCachedSnapshot(): String? {
    return withContext(Dispatchers.IO) {
      val response = session.turboSession.offlineRequestHandler?.getCachedSnapshot(
        url = url
      )

      response?.data?.use {
        String(it.readBytes())
      }
    }
  }

  fun refresh(displayProgress: Boolean) {
    if (session.turboSession.webView.url == null) return

    turboView?.webViewRefresh?.apply {
      if (displayProgress && !isRefreshing) {
        isRefreshing = true
      }
    }

    isWebViewAttachedToNewDestination = false
    visit(restoreWithCachedSnapshot = false, reload = true)
  }

  private fun initializePullToRefresh(turboView: TurboView) {
    turboView.webViewRefresh?.apply {
      setOnRefreshListener {
        refresh(displayProgress = true)
      }
    }
  }

  private fun initializeErrorPullToRefresh(turboView: TurboView) {
    turboView.errorRefresh?.apply {
      setOnRefreshListener {
        refresh(displayProgress = true)
      }
    }
  }

  private fun showScreenshotIfAvailable(turboView: TurboView) {
    if (screenshotOrientation == turboView.screenshotOrientation() && screenshotZoomed == currentlyZoomed) {
      screenshot?.let { turboView.addScreenshot(it) }
    }
  }

  // region view lifecycle


  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    attachWebViewAndVisit()
    session.registerVisitableView(this)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    session.removeVisitableView(this)
  }

  override fun detachWebView(onReady: () -> Unit) {
    val webView = session.turboSession.webView
    screenshotView()

    turboView?.detachWebView(webView) {
      onReady()
    }
  }

  override fun attachWebView(onReady: (Boolean) -> Unit) {
    val view = turboView

    if (view == null) {
      onReady(false)
      return
    }

    view.attachWebView(session.turboSession.webView) { attachedToNewDestination ->
      onReady(attachedToNewDestination)

//      if (attachedToNewDestination) {
//        onWebViewAttached(session.turboSession.webView)
//      }
    }
  }

  /**
   * Fixes initial size of WebView
   */
  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)
    val width = r - l
    val height = b - t
    session.turboSession.webView.layout(0, 0, width, height)
  }

  private fun screenshotView() {
    if (!session.turboSession.screenshotsEnabled) return

    turboView?.let {
      screenshot = it.createScreenshot()
      screenshotOrientation = it.screenshotOrientation()
      screenshotZoomed = currentlyZoomed
      showScreenshotIfAvailable(it)
    }
  }

  private fun sendEvent(event: RNVisitableViewEvent, params: WritableMap) {
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
  }

  private fun showProgressView() {
    turboView?.addProgressView(inflate(context, R.layout.turbo_progress, null))
  }

  private fun removeTransitionalViews() {
    turboView?.webViewRefresh?.isRefreshing = false
    turboView?.errorRefresh?.isRefreshing = false
    turboView?.removeProgressView()
    turboView?.removeScreenshot()
    turboView?.removeErrorView()
  }

  private fun pullToRefreshEnabled(enabled: Boolean) {
    turboView?.webViewRefresh?.isEnabled = enabled
  }

  // region TurboSessionCallback

  override fun onPageFinished(location: String) {}

  override fun onReceivedError(errorCode: Int) {
    sendEvent(RNVisitableViewEvent.VISIT_ERROR, Arguments.createMap().apply {
      putInt("statusCode", errorCode)
      putString("url", session.turboSession.webView.url)
    })
  }

  override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
    sendEvent(RNVisitableViewEvent.VISIT_PROPOSED, Arguments.createMap().apply {
      putString("url", location)
      putString("action", options.action.name.lowercase())
    })
  }

  override fun formSubmissionStarted(location: String) {}

  override fun formSubmissionFinished(location: String) {}

  override fun onRenderProcessGone() {
    sendEvent(RNVisitableViewEvent.VISIT_PROPOSED, Arguments.createMap().apply {
      putString("url", url)
      putString("action", TurboVisitAction.REPLACE.name.lowercase())
    })
  }

  override fun onZoomed(newScale: Float) {
    currentlyZoomed = true
    pullToRefreshEnabled(false)
  }

  override fun onZoomReset(newScale: Float) {
    currentlyZoomed = false
    pullToRefreshEnabled(true)
  }

  override fun pageInvalidated() {}

  override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {}

  override fun onReceivedHttpAuthRequest(handler: HttpAuthHandler, host: String, realm: String) {}

  override fun visitRendered() {
    sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
      putString("title", session.turboSession.webView.title)
      putString("url", session.turboSession.webView.url)
    })
    removeTransitionalViews()
  }

  override fun visitCompleted(completedOffline: Boolean) {
    sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
      putString("title", session.turboSession.webView.title)
      putString("url", session.turboSession.webView.url)
    })
  }

  override fun visitLocationStarted(location: String) {
    if (isWebViewAttachedToNewDestination) {
      showProgressView()
    }
  }

  override fun visitNavDestination(): TurboNavDestination? {
    return null
  }

  override fun onPageStarted(location: String) {}

  // end region
}
