package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

enum class RNVisitableViewEvent(val jsCallbackName: String) {
  VISIT_PROPOSAL("onVisitProposal"),
  ERROR("onError"),
  LOAD("onLoad"),
  MESSAGE("onMessage"),
  OPEN_EXTERNAL_URL("onOpenExternalUrl"),
  WEB_ALERT("onWebAlert"),
  WEB_CONFIRM("onWebConfirm"),
  FORM_SUBMISSION_STARTED("onFormSubmissionStarted"),
  FORM_SUBMISSION_FINISHED("onFormSubmissionFinished"),
  SHOW_LOADING("onShowLoading"),
  HIDE_LOADING("onHideLoading"),
  CONTENT_PROCESS_DID_TERMINATE("onContentProcessDidTerminate")
}

enum class RNVisitableViewCommand(val jsCallbackName: String) {
  INJECT_JAVASCRIPT("injectJavaScript"),
  RELOAD_PAGE("reload"),
  REFRESH_PAGE("refresh"),
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

  @ReactProp(name = "pullToRefreshEnabled")
  fun pullToRefreshEnabled(view: RNVisitableView, pullToRefreshEnabled: Boolean) {
    view.pullToRefreshEnabled = pullToRefreshEnabled
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
      RNVisitableViewCommand.RELOAD_PAGE -> root.reload(true)
      RNVisitableViewCommand.REFRESH_PAGE -> root.refresh()
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
