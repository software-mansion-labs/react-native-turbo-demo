package com.hotwirerndemo
import android.content.Context
import android.graphics.Color
import android.util.Log
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitOptions


class RNVisitableView (context: Context) : FrameLayout(context) {

    private lateinit var session: TurboSession
    private lateinit var visit: TurboVisit
    private lateinit var visitableView: TurboView

    private val reactContext = context as ReactContext

    init {
        setupNewSession()
        visitableView = TurboView(context)
        visitableView.attachWebView(session.webView, { a: Boolean -> 0 })
        addView(visitableView)
        session.visit(visit)
    }

    fun onAttachedToNewDestination(a: Boolean) {

    }

    private fun setupNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        session = TurboSession("testSessionName", activity, onCreateWebView(activity))
        visit = TurboVisit(
            location = "https://turbo.hotwired.dev",
            destinationIdentifier = 1,
            restoreWithCachedSnapshot = false,
            reload = false,
            callback = null,
            identifier = "",
            options = TurboVisitOptions()
        )
        Log.d("RNSession", "created session")
    }

    private fun onCreateWebView(context: Context): TurboWebView {
        return TurboWebView(context, null)
    }


}