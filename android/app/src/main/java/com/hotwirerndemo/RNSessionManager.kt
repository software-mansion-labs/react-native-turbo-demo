package com.hotwirerndemo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

private const val REACT_CLASS = "RNSession"

class RNSessionManager(
    private val callerContext: ReactApplicationContext
) : SimpleViewManager<RNSession>() {

    override fun getName() = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext) = RNSession(reactContext)

}