package com.reactnativeturbowebview

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import android.view.ViewGroup
import android.webkit.HttpAuthHandler
import android.widget.ImageView
import android.widget.LinearLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.nav.TurboNavDestination
import dev.hotwire.turbo.session.TurboSessionCallback
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitOptions

class RNVisitableView(context: Context) : LinearLayout(context), TurboSessionCallback,
    SessionSubscriber {

    private var visitableView = inflate(context, R.layout.turbo_view, null) as ViewGroup
    private var turboView: TurboView
    private val reactContext = context as ReactContext
    override lateinit var visit: TurboVisit
    lateinit var session: RNSession
    private var screenshot: Bitmap? = null
    private val screenshotView: ImageView get() = findViewById(R.id.turbo_screenshot)

    init {
        addView(visitableView)
        turboView = visitableView.findViewById(R.id.turbo_view)
    }

    internal fun setVisit(url: String) {
        visit = TurboVisit(
            location = url,
            destinationIdentifier = 1,
            restoreWithCachedSnapshot = false,
            reload = false,
            callback = this,
            identifier = url,
            options = TurboVisitOptions()
        )
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        session.registerVisitableView(this)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        session.removeVisitableView(this)
    }

    override fun detachWebView(callback: () -> Unit) {
        screenshot = turboView.createScreenshot()
        turboView.addScreenshot(screenshot)
        (session.turboSession.webView.parent as ViewGroup)?.endViewTransition(session.turboSession.webView)
        turboView.detachWebView(session.turboSession.webView) {
            Log.d("RNVisitableView", "webView detached ${visit}")
            callback()
        }
    }

    override fun attachWebView() {
        turboView.removeScreenshot()
        turboView.attachWebView(session.turboSession.webView) {
            Log.d("RNVisitableView", "webView attached ${visit}")
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
        screenshotView.layout(0, 0, width, height)
    }


    private fun sendEvent(event: RNVisitableViewEvent, params: WritableMap) {
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
    }

    // region TurboSessionCallback

    override fun onPageFinished(location: String) {
        sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
            putString("title", session.turboSession.webView.title)
            putString("url", session.turboSession.webView.url)
        })
    }

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

    override fun onRenderProcessGone() {}

    override fun onZoomed(newScale: Float) {}

    override fun onZoomReset(newScale: Float) {}

    override fun pageInvalidated() {}

    override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {}

    override fun onReceivedHttpAuthRequest(handler: HttpAuthHandler, host: String, realm: String) {}

    override fun visitRendered() {}

    override fun visitCompleted(completedOffline: Boolean) {}

    override fun visitLocationStarted(location: String) {}

    override fun visitNavDestination(): TurboNavDestination? {
        return null
    }

    override fun onPageStarted(location: String) {}

    // end region
}
