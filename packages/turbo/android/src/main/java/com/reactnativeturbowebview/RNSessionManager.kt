package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

//enum class RNSessionEvent(val jsCallbackName: String) { // TODO: reimplement
//    RECEIVED_JS_MESSAGE("onMessage"),
//}
//
//private const val REACT_CLASS = "RNSession"
//
//class RNSessionManager(
//    private val callerContext: ReactApplicationContext
//) : SimpleViewManager<RNSession>() {
//
//    override fun getName() = REACT_CLASS
//
//    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
//        return RNSessionEvent.values().map {
//            it.name to mapOf(
//                "phasedRegistrationNames" to mapOf(
//                    "bubbled" to it.jsCallbackName
//                )
//            )
//        }.toMap()
//    }
//
//    override fun createViewInstance(reactContext: ThemedReactContext) = RNSession(reactContext)
//
//}
