package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

enum class RNVisitableViewEvent(val jsCallbackName: String) {
  VISIT_PROPOSED("onVisitProposal"),
  VISIT_ERROR("onVisitError"),
  PAGE_LOADED("onLoad"),
  MESSAGE("onMessage"),
  OPEN_EXTERNAL_URL("onOpenExternalUrl"),
  ON_ALERT("onWebAlert"),
  ON_CONFIRM("onWebConfirm")
}

enum class RNVisitableViewCommand(val jsCallbackName: String) {
  INJECT_JAVASCRIPT("injectJavaScript"),
  RELOAD_PAGE("reload"),
  SEND_ALERT_RESULT("sendAlertResult"),
  SEND_CONFIRM_RESULT("sendConfirmResult")
}

private const val REACT_CLASS = "RNVisitableView"

class RNVisitableViewManager(
  private val callerContext: ReactApplicationContext
) : SimpleViewManager<RNVisitableView>() {

  override fun getName() = REACT_CLASS

  @ReactProp(name = "url")
  fun setUrl(view: RNVisitableView, url: String) {
    view.url = url
  }

  @ReactProp(name = "sessionHandle")
  fun setSessionHandle(view: RNVisitableView, sessionHandle: String) {
    view.sessionHandle = sessionHandle
  }

  @ReactProp(name = "applicationNameForUserAgent")
  fun setApplicationNameForUserAgent(view: RNVisitableView, applicationNameForUserAgent: String?) {
    view.applicationNameForUserAgent = applicationNameForUserAgent
  }

  override fun getCommandsMap(): MutableMap<String, Int> = RNVisitableViewCommand.values()
    .associate {
      it.jsCallbackName to it.ordinal
    }.toMutableMap()

  override fun receiveCommand(root: RNVisitableView, commandId: String, args: ReadableArray?) {
    super.receiveCommand(root, commandId, args)
    when (RNVisitableViewCommand.values()[commandId.toInt()]) {
      RNVisitableViewCommand.INJECT_JAVASCRIPT -> {
        args?.getString(0)?.let {
          root.injectJavaScript(it)
        }
      }
      RNVisitableViewCommand.RELOAD_PAGE -> root.refresh(true)
      RNVisitableViewCommand.SEND_ALERT_RESULT -> root.sendAlertResult()
      RNVisitableViewCommand.SEND_CONFIRM_RESULT -> {
        args?.getString(0)?.let {
          root.sendConfirmResult(it)
        }
      }
    }
  }

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> =
    RNVisitableViewEvent.values().associate {
      it.name to mapOf(
        "phasedRegistrationNames" to mapOf(
          "bubbled" to it.jsCallbackName
        )
      )
    }

  override fun createViewInstance(reactContext: ThemedReactContext) =
    RNVisitableView(
      callerContext
    )

  override fun onDropViewInstance(view: RNVisitableView) {
    super.onDropViewInstance(view)
    view.detachWebView()
  }

}
