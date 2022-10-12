package com.hotwirerndemo
import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView
import java.util.*
import org.json.JSONObject

class RNSession(context: Context) : FrameLayout(context) {

    val session: TurboSession = run {
        val activity = reactContext.currentActivity as AppCompatActivity
        val webView = TurboWebView(context, null)
        val sessionName = UUID.randomUUID().toString()
        webView.getSettings().setJavaScriptEnabled(true)
        webView.addJavascriptInterface(JavaScriptInterface(), "AndroidInterface")
        
        TurboSession(sessionName, activity, webView)
    }

    private val reactContext = context as ReactContext
    private val registeredVisitableViews = mutableListOf<SessionSubscriber>()

    fun sendEvent(event: RNSessionEvent, params: WritableMap) {
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, event.name, params)
    }

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

    inner class JavaScriptInterface {
        @JavascriptInterface
        fun postMessage(messageStr: String) {
            Log.d("RNVisitableView", "postMessage ${messageStr}")
            // Android interface works only with primitive types, that's why we need to use JSON
            val messageObj = Utils.convertJsonToBundle(JSONObject(messageStr)) // TODO remove double conversion
            sendEvent(RNSessionEvent.RECEIVED_JS_MESSAGE, Arguments.fromBundle(messageObj))
        }
    }
}
