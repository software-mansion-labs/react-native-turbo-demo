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
    private var prevVisitableView: RNVisitableView? = null // Needed to webView when changing view

    init {
        setupNewSession()
    }

    private fun setupNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)

        session = TurboSession("testSessionName", activity, webView)
        session.setDebugLoggingEnabled(true) // TODO, remove
    }

    private fun triggerVisit(visit: TurboVisit, view: RNVisitableView) {
        session.visit(visit)
        view.attachWebView() {
            prevVisitableView = view
        }
    }

    internal fun visit(visit: TurboVisit, view: RNVisitableView) {
        Log.d("RNVisitableView", "trigger visit ${visit} to view ${view}")
        if (prevVisitableView != null) {
            prevVisitableView?.detachWebView() {
                triggerVisit(visit, view)
            }
        } else {
            triggerVisit(visit, view)
        }
    }

}