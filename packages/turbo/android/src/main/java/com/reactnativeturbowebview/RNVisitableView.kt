package com.reactnativeturbowebview

import android.content.Context
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.CookieManager
import android.widget.LinearLayout
import androidx.appcompat.widget.AppCompatImageView
import androidx.core.view.isVisible
import androidx.lifecycle.findViewTreeLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisitOptions
import dev.hotwire.turbo.R
import dev.hotwire.turbo.errors.HttpError
import dev.hotwire.turbo.errors.LoadError
import dev.hotwire.turbo.errors.TurboVisitError
import dev.hotwire.turbo.errors.WebError
import dev.hotwire.turbo.errors.WebSslError
import dev.hotwire.turbo.visit.TurboVisitAction

const val REFRESH_SCRIPT = "typeof Turbo.session.refresh === 'function'" +
        "? Turbo.session.refresh(document.baseURI)" + // Turbo 8+
        ": Turbo.visit(document.baseURI, { action: 'replace', shouldCacheSnapshot: 'false' })" // Older Turbo versions 

class RNVisitableView(context: Context) : LinearLayout(context), SessionSubscriber {

  private val reactContext = context as ReactApplicationContext

  // Props
  private var _url: String? = null
  var url: String
    get() = _url
      ?: throw UninitializedPropertyAccessException("\"url\" was queried before being initialized")
    set(value) {
      val didSetAfterFirstVisit = _url != null && _url != value
      _url = value;
      if (didSetAfterFirstVisit) {
        visit()
      }
    }

  lateinit var sessionHandle: String
  var applicationNameForUserAgent: String? = null
  var scrollEnabled: Boolean = true
  var pullToRefreshEnabled: Boolean = true
    set(value) {
      field = value
      setPullToRefresh(value)
    }

  // Session
  private val session: RNSession by lazy {
    RNSessionManager.findOrCreateSession(
      reactContext,
      sessionHandle,
      webViewConfiguration
    )
  }
  private val webView: TurboWebView get() = session.webView
  private val webViewConfiguration: RNWebViewConfiguration by lazy {
    RNWebViewConfiguration().apply {
      applicationNameForUserAgent = this@RNVisitableView.applicationNameForUserAgent
      scrollEnabled = this@RNVisitableView.scrollEnabled
    }
  }

  private var onConfirmHandler: ((result: Boolean) -> Unit)? = null
  private var onAlertHandler: (() -> Unit)? = null

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
      visitOptions = null
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

  override fun refresh() {
    webView.evaluateJavascript(REFRESH_SCRIPT, null)
  }

  override fun reload(displayProgress: Boolean) {
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
        reload(displayProgress = true)
      }
    }
  }

  private fun initializeErrorPullToRefresh(turboView: TurboView) {
    turboView.errorRefresh?.apply {
      setOnRefreshListener {
        reload(displayProgress = true)
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

  private fun attachWebView(onReady: (Boolean) -> Unit) {
    // Sometimes detachWebView is not called before attachWebView.
    // This can happen when the user uses one session for different
    // bottom tabs. In this case, we need to remove the webview from
    // the parent before attaching it to the new one.
    if (webView.parent != null) {
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
    // Don't show the progress view if a screenshot is available
    if (screenshotView.isVisible) return
    sendEvent(RNVisitableViewEvent.SHOW_LOADING, Arguments.createMap())
  }

  private fun hideProgressView() {
    sendEvent(RNVisitableViewEvent.HIDE_LOADING, Arguments.createMap())
  }

  private fun removeTransitionalViews() {
    turboView.webViewRefresh?.isRefreshing = false
    turboView.errorRefresh?.isRefreshing = false
    hideProgressView()
    turboView.removeScreenshot()
    turboView.removeErrorView()
  }

  private fun setPullToRefresh(enabled: Boolean) {
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

  override fun didStartFormSubmission(url: String) {
    sendEvent(RNVisitableViewEvent.FORM_SUBMISSION_STARTED, Arguments.createMap().apply {
      putString("url", url)
    })
  }

  override fun didFinishFormSubmission(url: String) {
    sendEvent(RNVisitableViewEvent.FORM_SUBMISSION_FINISHED, Arguments.createMap().apply {
      putString("url", url)
    })
  }

  override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
    sendEvent(RNVisitableViewEvent.VISIT_PROPOSAL, Arguments.createMap().apply {
      putString("url", location)
      putString("action", options.action.name.lowercase())
    })
  }

  override fun onRenderProcessGone() {
    sendEvent(RNVisitableViewEvent.CONTENT_PROCESS_DID_TERMINATE, Arguments.createMap().apply {
      putString("url", url)
    })
  }

  override fun onZoomed(newScale: Float) {
    currentlyZoomed = true
    setPullToRefresh(false)
  }

  override fun onZoomReset(newScale: Float) {
    currentlyZoomed = false
    setPullToRefresh(pullToRefreshEnabled)
  }

  override fun visitRendered() {
    sendEvent(RNVisitableViewEvent.LOAD, Arguments.createMap().apply {
      putString("title", webView.title)
      putString("url", webView.url)
    })
    removeTransitionalViews()
  }

  override fun visitCompleted(completedOffline: Boolean) {
    sendEvent(RNVisitableViewEvent.LOAD, Arguments.createMap().apply {
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

  override fun handleAlert(message: String, callback: () -> Unit) {
    sendEvent(RNVisitableViewEvent.WEB_ALERT, Arguments.createMap().apply {
      putString("message", message)
    })
    onAlertHandler = callback
  }


  override fun handleConfirm(message: String, callback: (result: Boolean) -> Unit) {
    sendEvent(RNVisitableViewEvent.WEB_CONFIRM, Arguments.createMap().apply {
      putString("message", message)
    })
    onConfirmHandler = callback
  }

  fun sendAlertResult() {
    onAlertHandler?.invoke()
    onAlertHandler = null
  }

  fun sendConfirmResult(result: String) {
    val confirmResult = result == "true"
    onConfirmHandler?.invoke(confirmResult)
    onConfirmHandler = null
  }

  override fun onReceivedError(error: TurboVisitError) {
    sendEvent(RNVisitableViewEvent.ERROR, Arguments.createMap().apply {
      putInt("statusCode", RNTurboError.getErrorCode(error))
      putString("url", url)
      putString("description", RNTurboError.errorDescription(error))
    })
  }

  override fun requestFailedWithError(visitHasCachedSnapshot: Boolean, error: TurboVisitError) {
    sendEvent(RNVisitableViewEvent.ERROR, Arguments.createMap().apply {
      putInt("statusCode", RNTurboError.getErrorCode(error))
      putString("url", url)
      putString("description", RNTurboError.errorDescription(error))
    })
  }

  // end region

}
