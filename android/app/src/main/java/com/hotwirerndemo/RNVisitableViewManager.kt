package com.hotwirerndemo

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RNVisitableViewManager(
    private val callerContext: ReactApplicationContext
) : SimpleViewManager<RNVisitableView>() {

    override fun getName() = REACT_CLASS

    @ReactProp(name = "url")
    fun setUrl(view: RNVisitableView, url: String) {
        Log.d("RMVisitableView", "url set ${url}")
        view.openUrl(url)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return mapOf(
            "visitProposed" to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to "onVisitProposal"
                )
            ),
            "visitError" to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to "onVisitError"
                )
            ),
            "webViewLoaded" to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to "onLoad"
                )
            )
        )
    }

    companion object {
        const val REACT_CLASS = "RNVisitableView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext) = RNVisitableView(reactContext)

}