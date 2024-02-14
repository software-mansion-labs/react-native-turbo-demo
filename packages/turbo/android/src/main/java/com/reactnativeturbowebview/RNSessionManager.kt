package com.reactnativeturbowebview

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise;
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
  fun getRegisteredSessionHandles(promise: Promise) {
    if(sessions.keys.isNotEmpty()) {
      val sessionHandles = Arguments.createArray()
      sessions.keys.forEach {
        sessionHandles.pushString(it)
      }
      promise.resolve(sessionHandles)
    }
  }

  @ReactMethod
  fun reloadSessionByName(sessionHandle: String, promise: Promise) {
    sessions[sessionHandle]?.let {
      it.reload()
      promise.resolve(null)
    }  ?: run {
      promise.reject("sessionHandle", "No session found with handle $sessionHandle")
    }
  }

  @ReactMethod
  fun clearSessionSnapshotCacheByName(sessionHandle: String, promise: Promise) {
    sessions[sessionHandle]?.let {
      it.clearSnapshotCache()
      promise.resolve(null)
    }  ?: run {
      promise.reject("sessionHandle", "No session found with handle $sessionHandle")
    }
  }

}
