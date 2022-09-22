package com.hotwirerndemo

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.th3rdwave.safeareacontext.getReactContext

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
        Log.d("RNVisitableView", "url set ${url}")
        view.setVisit(url)
    }

    @ReactProp(name = "sessionHandle")
    fun setSessionHandle(view: RNVisitableView, sessionHandle: Int) {
        Log.d("RNVisitableView", "session set handle: ${sessionHandle}")
        val uiManager = getReactContext(view).getNativeModule(UIManagerModule::class.java)
        val sessionView = uiManager?.resolveView(sessionHandle) as RNSession
        view.session = sessionView
    }

    override fun onAfterUpdateTransaction(view: RNVisitableView) {
        super.onAfterUpdateTransaction(view)
        view.triggerVisit()
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