package com.reactnativeturbowebview

import dev.hotwire.turbo.visit.TurboVisit

interface SessionSubscriber {
  fun detachWebView(callback: () -> Unit)
  fun attachWebViewAndVisit()
}
