package com.hotwirerndemo
import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContext
import dev.hotwire.turbo.session.TurboSession
import dev.hotwire.turbo.views.TurboWebView

class RNSession(context: Context) : FrameLayout(context) {

    private lateinit var session: TurboSession private set
    private val reactContext = context as ReactContext

    init {
        createNewSession()
    }

    private fun createNewSession() {
        val activity = reactContext.currentActivity as AppCompatActivity
        session = TurboSession("testSessionName", activity, onCreateWebView(activity))
        Log.d("RNSession", "created session")
    }

    private fun onCreateWebView(context: Context): TurboWebView {
        return TurboWebView(context, null)
    }

}