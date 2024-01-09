package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

private const val NAME = "RNSessionManager"

@ReactModule(name = NAME)
class RNSessionManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  companion object {
    private val sessions: MutableMap<String, RNSession> = mutableMapOf()

    fun findOrCreateSession(
      reactContext: ReactApplicationContext,
      sessionHandle: String,
      applicationNameForUserAgent: String? = null
    ): RNSession = sessions.getOrPut(sessionHandle) {
      RNSession(reactContext, sessionHandle, applicationNameForUserAgent)
    }

    fun clearSnapshotCaches() {
      sessions.values.forEach { it.clearSnapshotCache() }
    }
  }

  override fun getName() = NAME

  @ReactMethod
  fun clearSnapshotCacheForAllSessions() {
    clearSnapshotCaches()
  }

}
