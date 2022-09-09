package com.hotwirerndemo

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import dev.hotwire.turbo.views.TurboWebView

class RNVisitableViewManager(
    private val callerContext: ReactApplicationContext
) : SimpleViewManager<RNVisitableView>() {

    override fun getName() = REACT_CLASS

    @ReactProp(name = "url")
    fun setUrl(view: RNVisitableView, url: String) {
        Log.d("RMVisitableView", "url set ${url}")
        view.openUrl(url)
    }

    companion object {
        const val REACT_CLASS = "RNVisitableView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext) = RNVisitableView(reactContext)

}