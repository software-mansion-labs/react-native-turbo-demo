package com.reactnativeturbowebview

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class ReactAppPackage : ReactPackage {

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf(RNVisitableViewManager()).toMutableList()

  override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> = mutableListOf()

}
