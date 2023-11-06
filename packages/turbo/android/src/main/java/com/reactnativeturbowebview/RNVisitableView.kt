package com.reactnativeturbowebview

import android.content.Context
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.CookieManager
import android.widget.LinearLayout
import androidx.appcompat.widget.AppCompatImageView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.whenStateAtLeast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitAction
import dev.hotwire.turbo.visit.TurboVisitOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RNVisitableView(context: Context, sessionModule: RNSessionModule) : LinearLayout(context),
  SessionCallbackAdapter,
  SessionSubscriber {

  private var visitableView = inflate(context, R.layout.turbo_view, null) as ViewGroup
  private var turboView: TurboView
  private var screenshotView: AppCompatImageView
  private val webViewContainer: ViewGroup get() = findViewById(R.id.turbo_webView_container)
  private val viewTreeLifecycleOwner
    get() = turboView?.findViewTreeLifecycleOwner()
  private val reactContext = context as ReactContext
  private var isInitialVisit = true
  var sessionHandle: String? = null
  private val sessionContainer: RNSession by lazy {
    sessionModule.getSession(sessionHandle)
  }
  lateinit var url: String
  private var currentlyZoomed = false
  private var isWebViewAttachedToNewDestination = false
  private var screenshotOrientation = 0
  private var screenshotZoomed = false
  private var screenshot: Bitmap? = null
  private val webView: TurboWebView
    get() = sessionContainer.turboSession.webView
  private val session: TurboSession
    get() = sessionContainer.turboSession

  init {
    addView(visitableView)
    turboView = visitableView.findViewById(R.id.turbo_view)
    screenshotView = visitableView.findViewById(R.id.turbo_screenshot)

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
        session.visit(
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

  override fun attachWebViewAndVisit() {
    attachWebView {
      isWebViewAttachedToNewDestination = it

      // Visit every time the WebView is reattached to the current Fragment.
      if (isWebViewAttachedToNewDestination) {
        val currentSessionVisitRestored =
          !isInitialVisit && session.currentVisit?.destinationIdentifier == url.hashCode() && session.restoreCurrentVisit(
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
      val response = session.offlineRequestHandler?.getCachedSnapshot(
        url = url
      )

      response?.data?.use {
        String(it.readBytes())
      }
    }
  }

  fun refresh(displayProgress: Boolean) {
    if (webView.url == null) return

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
    sessionContainer.registerVisitableView(this)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    sessionContainer.removeVisitableView(this)
  }

  override fun detachWebView(onReady: () -> Unit) {
    screenshotView()

    (session.webView.parent as ViewGroup?)?.endViewTransition(session.webView)

    webViewContainer.post {
      webViewContainer.removeAllViews()
      onReady()
    }
  }

  private fun attachWebView(onReady: (Boolean) -> Unit) {
    val view = turboView

    if (view == null) {
      onReady(false)
      return
    }

    view.attachWebView(webView) { attachedToNewDestination ->
      onReady(attachedToNewDestination)
    }
  }

  /*
   * Fixes a bug in React Native, causing improper layout of the TurboView and its children.
   * Refer to https://github.com/facebook/react-native/issues/17968 for the detailed issue discussion and context.
   */
  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  /**
   * Fixes initial size of WebView
   */
  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    val width = right - left
    val height = bottom - top
    screenshotView.layout(0, 0, width, height)
  }

  private fun screenshotView() {
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

  override fun onReceivedError(errorCode: Int) {
    sendEvent(RNVisitableViewEvent.VISIT_ERROR, Arguments.createMap().apply {
      putInt("statusCode", errorCode)
      putString("url", webView.url)
    })
  }

  override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
    sendEvent(RNVisitableViewEvent.VISIT_PROPOSED, Arguments.createMap().apply {
      putString("url", location)
      putString("action", options.action.name.lowercase())
    })
  }

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

  override fun visitRendered() {
    sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
      putString("title", webView.title)
      putString("url", webView.url)
    })
    removeTransitionalViews()
  }

  override fun visitCompleted(completedOffline: Boolean) {
    sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
      putString("title", webView.title)
      putString("url", webView.url)
    })
    CookieManager
      .getInstance()
      .flush()
  }

  override fun visitLocationStarted(location: String) {
    if (isWebViewAttachedToNewDestination) {
      showProgressView()
    }
  }

  override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {
    super.requestFailedWithStatusCode(visitHasCachedSnapshot, statusCode)
    sendEvent(RNVisitableViewEvent.VISIT_ERROR, Arguments.createMap().apply {
      putInt("statusCode", statusCode)
      putString("url", webView.url)
    })
  }

  // end region

}
