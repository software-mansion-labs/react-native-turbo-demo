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
import java.util.*

class RNSession(context: Context) : FrameLayout(context) {

    val session: TurboSession = run {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)
        val sessionName = UUID.randomUUID().toString()

        TurboSession(sessionName, activity, webView)
    }

    private val reactContext = context as ReactContext
    private val registeredVisitableViews = mutableListOf<SessionSubscriber>()

    internal fun registerVisitableView(newView: SessionSubscriber) {
        var callbacksCount = registeredVisitableViews.size

        if (callbacksCount == 0) {
            session.visit(newView.visit)
            newView.attachWebView()
        }

        fun onDetached() = synchronized(this) {
            callbacksCount--
            if (callbacksCount == 0) {
                session.visit(newView.visit)
                newView.attachWebView()
            }
        }

        for (view in registeredVisitableViews) {
            view.detachWebView() {
                onDetached()
            }
        }

        if (!registeredVisitableViews.contains(newView)) {
            registeredVisitableViews.add(newView)
        }
    }

    internal fun removeVisitableView(view: SessionSubscriber) {
        registeredVisitableViews.remove(view)
    }

}