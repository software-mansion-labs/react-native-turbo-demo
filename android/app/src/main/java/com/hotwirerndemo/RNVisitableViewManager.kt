package com.hotwirerndemo

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

enum class RNVisitableViewEvent(val jsCallbackName: String) {
    VISIT_PROPOSED("onVisitProposal"),
    VISIT_ERROR("onVisitError"),
    PAGE_LOADED("onLoad")
}

private const val REACT_CLASS = "RNVisitableView"

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
        return RNVisitableViewEvent.values().map { it.name to mapOf(
            "phasedRegistrationNames" to mapOf(
                "bubbled" to it.jsCallbackName
            )
        )}.toMap()
    }

    override fun createViewInstance(reactContext: ThemedReactContext) = RNVisitableView(reactContext)

}