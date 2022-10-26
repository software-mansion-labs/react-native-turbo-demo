package com.reactnativeturbowebview

import dev.hotwire.turbo.visit.TurboVisit

interface SessionSubscriber {
    val visit: TurboVisit

    fun detachWebView(callback: () -> Unit)
    fun attachWebView()
}
