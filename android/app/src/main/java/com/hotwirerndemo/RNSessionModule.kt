package com.hotwirerndemo
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

private const val MODULE_NAME = "RNSessionModule"


class RNSessionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = MODULE_NAME

    @ReactMethod
    fun injectJavaScript(sessionHandle: Int, callbackStringified: String) {
        Log.d("RNVisitableView", "Create event called with name: $sessionHandle and location: $callbackStringified")
    }

}
