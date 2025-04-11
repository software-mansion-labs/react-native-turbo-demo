package com.reactnativehotwirewebview

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class ReactAppPackage : ReactPackage {

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf(RNVisitableViewManager(reactContext)).toMutableList()

  override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> =
    mutableListOf(RNSessionManager(reactContext))

}
