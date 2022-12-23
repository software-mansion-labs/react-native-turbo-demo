package com.reactnativeturbowebview

import android.webkit.HttpAuthHandler
import dev.hotwire.turbo.nav.TurboNavDestination
import dev.hotwire.turbo.session.TurboSessionCallback

interface SessionCallbackAdapter : TurboSessionCallback {

  override fun visitNavDestination(): TurboNavDestination {
    throw Exception("Calling TurboNavDestination getter in ReactNative app")
  }

  override fun onPageFinished(location: String) {}

  override fun formSubmissionStarted(location: String) {}

  override fun formSubmissionFinished(location: String) {}

  override fun pageInvalidated() {}

  override fun requestFailedWithStatusCode(visitHasCachedSnapshot: Boolean, statusCode: Int) {}

  override fun onReceivedHttpAuthRequest(handler: HttpAuthHandler, host: String, realm: String) {}

  override fun onPageStarted(location: String) {}

}
