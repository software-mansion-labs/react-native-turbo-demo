package com.reactnativehotwirewebview

import android.webkit.HttpAuthHandler
import dev.hotwire.core.turbo.session.SessionCallback
import dev.hotwire.core.turbo.visit.VisitDestination

interface SessionCallbackAdapter : SessionCallback {

  override fun visitDestination(): VisitDestination {
    throw Exception("Calling VisitDestination getter in ReactNative app")
  }

  override fun onPageFinished(location: String) {}

  override fun formSubmissionStarted(location: String) {}

  override fun formSubmissionFinished(location: String) {}

  override fun pageInvalidated() {}

  override fun onReceivedHttpAuthRequest(handler: HttpAuthHandler, host: String, realm: String) {}

  override fun onPageStarted(location: String) {}

}
