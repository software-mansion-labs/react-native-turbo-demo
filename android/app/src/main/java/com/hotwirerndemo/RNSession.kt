package com.hotwirerndemo
import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit

class RNSession(context: Context) : FrameLayout(context) {

    lateinit var session: TurboSession private set
    private val reactContext = context as ReactContext
    private var prevTurboView: TurboView? = null // Needed to webView when changing view

    init {
        setupNewSession()
    }

    private fun setupNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)

        session = TurboSession("testSessionName", activity, webView)
        session.setDebugLoggingEnabled(true) // TODO, remove
    }

    internal fun visit(visit: TurboVisit, view: TurboView) {
        Log.d("RNVisitableView", "trigger visit ${visit} to view ${view}")
        prevTurboView?.detachWebView(session.webView, { 0 })
        session.visit(visit)
        view.attachWebView(session.webView, { 0 })
        prevTurboView = view
    }

}