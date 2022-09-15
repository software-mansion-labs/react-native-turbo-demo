package com.hotwirerndemo
import android.content.Context
import android.util.Log
import android.view.ViewGroup
import android.webkit.HttpAuthHandler
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.nav.TurboNavDestination
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.session.TurboSessionCallback
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitOptions

class RNVisitableView (context: Context) : LinearLayout(context), TurboSessionCallback {

    private lateinit var session: TurboSession
    private lateinit var visit: TurboVisit
    private var turboView: TurboView
    private var visitableView: ViewGroup
    private val reactContext = context as ReactContext

    init {
        setupNewSession()
        visitableView = inflate(context, R.layout.turbo_view, null) as ViewGroup
        addView(visitableView)
        turboView = visitableView.findViewById(R.id.turbo_view)
    }

    private fun setupNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)
        session = TurboSession("testSessionName", activity, webView)
        session.setDebugLoggingEnabled(true) // TODO, remove
    }

    internal fun openUrl(url: String) {
        visit = TurboVisit(
            location = url,
            destinationIdentifier = 1,
            restoreWithCachedSnapshot = false,
            reload = false,
            callback = this,
            identifier = url,
            options = TurboVisitOptions()
        )
        session.visit(visit)
        turboView.attachWebView(session.webView, { 0 })
    }

    /**
     * Fixes initial size of WebView
     */
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        super.onLayout(changed, l, t, r, b)
        val width = r - l
        val height = b - t
        session.webView.layout(0, 0, width, height)
    }

    private fun sendEvent(event: RNVisitableViewEvent, params: WritableMap) {
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
    }

    // TurboSessionCallback =====

    override fun onPageStarted(location: String) {
        Log.d("RNVisitableView", "onPageStarted")
    }

    override fun onPageFinished(location: String) {
        Log.d("RNVisitableView", "onPageFinished ${session.webView.title} ${session.webView.url}")
        sendEvent(RNVisitableViewEvent.PAGE_LOADED, Arguments.createMap().apply {
            putString("title", session.webView.title)
            putString("url", session.webView.url)
        })
    }

    override fun onReceivedError(errorCode: Int) {
        Log.d("RNVisitableView", "onReceivedError")
        sendEvent(RNVisitableViewEvent.VISIT_ERROR, Arguments.createMap().apply {
            putInt("statusCode", errorCode)
            putString("url", session.webView.url)
        })
    }

    override fun onRenderProcessGone() {
        Log.d("RNVisitableView", "onRenderProcessGone")
    }

    override fun onZoomed(newScale: Float) {
        Log.d("RNVisitableView", "onZoomed")
    }

    override fun onZoomReset(newScale: Float) {
        Log.d("RNVisitableView", "onZoomReset")
    }

    override fun pageInvalidated() {
        Log.d("RNVisitableView", "pageInvalidated")
    }

    override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {
        Log.d("RNVisitableView", "requestFailedWithStatusCode")
    }

    override fun onReceivedHttpAuthRequest(handler: HttpAuthHandler, host: String, realm: String) {
        Log.d("RNVisitableView", "onReceivedHttpAuthRequest")
    }

    override fun visitRendered() {
        Log.d("RNVisitableView", "visitRendered")
    }

    override fun visitCompleted(completedOffline: Boolean) {
        Log.d("RNVisitableView", "visitCompleted")
    }

    override fun visitLocationStarted(location: String) {
        Log.d("RNVisitableView", "visitLocationStarted")
    }

    override fun visitProposedToLocation(location: String, options: TurboVisitOptions) {
        Log.d("RNVisitableView", "visitProposedToLocation ${location} ${options}")
        sendEvent(RNVisitableViewEvent.VISIT_PROPOSED, Arguments.createMap().apply {
            putString("url", location)
            putString("action", options.action.name.lowercase())
        })
    }

    override fun visitNavDestination(): TurboNavDestination? {
        Log.d("RNVisitableView", "visitNavDestination")
        return null
    }

    override fun formSubmissionStarted(location: String) {
        Log.d("RNVisitableView", "formSubmissionStarted")
    }

    override fun formSubmissionFinished(location: String) {
        Log.d("RNVisitableView", "formSubmissionFinished")
    }
}

