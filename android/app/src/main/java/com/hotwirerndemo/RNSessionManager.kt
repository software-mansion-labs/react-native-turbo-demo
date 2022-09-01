package com.hotwirerndemo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class RNSessionManager(
    private val callerContext: ReactApplicationContext
) : SimpleViewManager<RNSession>() {

    override fun getName() = REACT_CLASS

    companion object {
        const val REACT_CLASS = "RNSession"
    }

    override fun createViewInstance(reactContext: ThemedReactContext) = RNSession(reactContext)

}