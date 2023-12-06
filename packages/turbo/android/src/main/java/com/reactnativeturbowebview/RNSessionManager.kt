package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactApplicationContext

object RNSessionManager {

  private val sessions: MutableMap<String, RNSession> = mutableMapOf()

  fun findOrCreateSession(
    reactContext: ReactApplicationContext,
    sessionHandle: String,
    applicationNameForUserAgent: String? = null
  ): RNSession = sessions.getOrPut(sessionHandle) {
    RNSession(reactContext, sessionHandle, applicationNameForUserAgent)
  }

}
