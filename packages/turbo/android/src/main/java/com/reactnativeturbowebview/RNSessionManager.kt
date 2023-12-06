package com.reactnativeturbowebview

import com.facebook.react.bridge.ReactContext

object RNSessionManager {

  private val sessions: MutableMap<String, RNSession> = mutableMapOf()

  fun findOrCreateSession(
    reactContext: ReactContext,
    sessionHandle: String,
    applicationNameForUserAgent: String? = null
  ): RNSession = sessions.getOrPut(sessionHandle) {
    RNSession(reactContext, sessionHandle, applicationNameForUserAgent)
  }

}
