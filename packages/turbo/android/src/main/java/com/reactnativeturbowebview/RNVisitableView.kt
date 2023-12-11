package com.reactnativeturbowebview

import android.content.Context
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.CookieManager
import android.widget.LinearLayout
import androidx.appcompat.widget.AppCompatImageView
import androidx.lifecycle.findViewTreeLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisitAction
import dev.hotwire.turbo.visit.TurboVisitOptions

class RNVisitableView(context: Context) : LinearLayout(context), SessionSubscriber {

  private val reactContext = context as ReactApplicationContext

  // Props
  lateinit var url: String
  lateinit var sessionHandle: String
  var applicationNameForUserAgent: String? = null

  // Session
  private val session: RNSession by lazy {
    RNSessionManager.findOrCreateSession(
      reactContext,
      sessionHandle,
      applicationNameForUserAgent
    )
  }
  private val webView: TurboWebView get() = session.webView

  // State
  private var isInitialVisit = true
  private var currentlyZoomed = false
  private var isWebViewAttachedToNewDestination = false
  private var screenshotOrientation = 0
  private var screenshotZoomed = false
  private var screenshot: Bitmap? = null

  // Views
  private val visitableView = inflate(context, R.layout.turbo_view, null) as ViewGroup
  private val turboView: TurboView by lazy { visitableView.findViewById(R.id.turbo_view) }
  private val screenshotView: AppCompatImageView by lazy { visitableView.findViewById(R.id.turbo_screenshot) }
  private val viewTreeLifecycleOwner get() = turboView.findViewTreeLifecycleOwner()

  init {
    addView(visitableView)

    turboView.apply {
      initializePullToRefresh(this)
      initializeErrorPullToRefresh(this)
      showScreenshotIfAvailable(this)
      screenshot = null
      screenshotOrientation = 0
      screenshotZoomed = false
    }
  }

  private fun performVisit(restoreWithCachedSnapshot: Boolean, reload: Boolean) {
    session.visit(
      url = url,
      restoreWithCachedSnapshot = restoreWithCachedSnapshot,
      reload = reload,
      viewTreeLifecycleOwner = viewTreeLifecycleOwner,
    )
  }

  private fun visit() {
    attachWebView {
      isWebViewAttachedToNewDestination = it

      // Visit every time the WebView is reattached to the current Fragment.
      if (isWebViewAttachedToNewDestination) {
        val currentSessionVisitRestored =
          !isInitialVisit && session.currentVisit?.destinationIdentifier == url.hashCode() && session.restoreCurrentVisit()

        if (!currentSessionVisitRestored) {
          showProgressView()
          performVisit(restoreWithCachedSnapshot = !isInitialVisit, reload = false)
          isInitialVisit = false
        }
      }
    }
  }

  internal fun refresh(displayProgress: Boolean) {
    if (webView.url == null) return

    turboView.webViewRefresh?.apply {
      if (displayProgress && !isRefreshing) {
        isRefreshing = true
      }
    }

    isWebViewAttachedToNewDestination = false
    performVisit(restoreWithCachedSnapshot = false, reload = true)
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
    session.registerVisitableView(this)
    visit()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    session.removeVisitableView(this)
  }

  private fun attachWebView(onReady: (Boolean) -> Unit) {
    // Sometimes detachWebView is not called before attachWebView.
    // This can happen when the user uses one session for different
    // bottom tabs. In this case, we need to remove the webview from
    // the parent before attaching it to the new one.
    if(webView.parent != null){
      (webView.parent as ViewGroup).removeView(webView)
    }

    // Re-layout the TurboView before attaching to make page restorations work correctly.
    requestLayout()

    turboView.attachWebView(webView) { attachedToNewDestination ->
      onReady(attachedToNewDestination)
    }
  }

  override fun detachWebView() {
    screenshotView()

    (webView.parent as ViewGroup?)?.endViewTransition(webView)

    turboView.detachWebView(webView) {
      // Force layout to fix improper layout of the TurboWebView.
      forceLayout()
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
    turboView.let {
      screenshot = it.createScreenshot()
      screenshotOrientation = it.screenshotOrientation()
      screenshotZoomed = currentlyZoomed
      showScreenshotIfAvailable(it)
    }
  }

  private fun showProgressView() {
    turboView.addProgressView(inflate(context, R.layout.turbo_progress, null))
  }

  private fun removeTransitionalViews() {
    turboView.webViewRefresh?.isRefreshing = false
    turboView.errorRefresh?.isRefreshing = false
    turboView.removeProgressView()
    turboView.removeScreenshot()
    turboView.removeErrorView()
  }

  private fun pullToRefreshEnabled(enabled: Boolean) {
    turboView.webViewRefresh?.isEnabled = enabled
  }

  private fun sendEvent(event: RNVisitableViewEvent, params: WritableMap) {
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
  }

  // region SessionSubscriber

  override fun injectJavaScript(script: String) {
    webView.evaluateJavascript(script, null)
  }

  override fun handleMessage(message: WritableMap) {
    sendEvent(RNVisitableViewEvent.MESSAGE, message)
  }

  override fun didOpenExternalUrl(url: String) {
    sendEvent(RNVisitableViewEvent.OPEN_EXTERNAL_URL, Arguments.createMap().apply {
      putString("url", url)
    })
  }

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
    sendEvent(RNVisitableViewEvent.VISIT_ERROR, Arguments.createMap().apply {
      putInt("statusCode", statusCode)
      putString("url", webView.url)
    })
  }

  // end region

}
