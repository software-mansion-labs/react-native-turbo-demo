package com.hotwirerndemo
import android.content.Context
import android.graphics.Color
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboView
import dev.hotwire.turbo.views.TurboWebView
import dev.hotwire.turbo.visit.TurboVisit
import dev.hotwire.turbo.visit.TurboVisitOptions


class RNVisitableView (context: Context) : LinearLayout(context) {

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

    internal fun openUrl(url: String) {
        visit = TurboVisit(
            location = url,
            destinationIdentifier = 1,
            restoreWithCachedSnapshot = false,
            reload = false,
            callback = null,
            identifier = url,
            options = TurboVisitOptions()
        )
        session.visit(visit)
        turboView.attachWebView(session.webView, { a: Boolean -> 0 })
    }

    /**
     * Fixes initial size of WebView problem
     */
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        super.onLayout(changed, l, t, r, b)
        var width = r - l
        var height = b - t
        session.webView.layout(0, 0, width, height)
    }


    private fun setupNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)
        session = TurboSession("testSessionName", activity, webView)
    }
}
