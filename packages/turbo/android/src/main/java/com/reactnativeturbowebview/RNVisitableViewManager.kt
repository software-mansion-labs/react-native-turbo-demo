package com.reactnativeturbowebview

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
    view.url = url
    view.visit(restoreWithCachedSnapshot = false, reload = false)
  }

  @ReactProp(name = "sessionHandle")
  fun setSessionHandle(view: RNVisitableView, sessionHandle: String) {
    view.sessionHandle = sessionHandle
  }

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
    return RNVisitableViewEvent.values().map {
      it.name to mapOf(
        "phasedRegistrationNames" to mapOf(
          "bubbled" to it.jsCallbackName
        )
      )
    }.toMap()
  }

  override fun createViewInstance(reactContext: ThemedReactContext) =
    RNVisitableView(
      reactContext,
      sessionModule = reactContext.getNativeModule(RNSessionModule::class.java)!!
    )

}
