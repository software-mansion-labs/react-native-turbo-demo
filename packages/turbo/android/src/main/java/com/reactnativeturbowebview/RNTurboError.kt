package com.reactnativeturbowebview

import android.webkit.WebViewClient
import dev.hotwire.turbo.errors.HttpError
import dev.hotwire.turbo.errors.LoadError
import dev.hotwire.turbo.errors.TurboVisitError
import dev.hotwire.turbo.errors.WebError
import dev.hotwire.turbo.errors.WebSslError

enum class RNTurboError(val code: Int) {
  HTTP(1),
  NETWORK_FAILURE(0),
  TIMEOUT_FAILURE(-1),
  CONTENT_TYPE_MISMATCH(-2),
  PAGE_LOAD_FAILURE(-3),
  UNKNOWN(-4);

  companion object {
    fun getErrorCode(error: TurboVisitError): Int {
      val errorCode = when (error) {
        is HttpError -> error.statusCode
        is WebError -> error.errorCode
        is WebSslError -> error.errorCode
        is LoadError -> -2
        else -> 0
      }

      return when (errorCode) {
        WebViewClient.ERROR_CONNECT -> 0
        WebViewClient.ERROR_TIMEOUT -> -1
        // turbo-android returns ERROR_UNKNOWN on SSL error and on turboFailedToLoad
        WebViewClient.ERROR_UNKNOWN -> -3
        else -> if (errorCode > 0) errorCode else -4
      }
    }

    private fun fromCode(code: Int): RNTurboError {
      return values().firstOrNull { it.code == code } ?: UNKNOWN
    }

    fun errorDescription(error: TurboVisitError): String {
      val errorCode = getErrorCode(error)
      return when (fromCode(errorCode)) {
        NETWORK_FAILURE -> "A network error occurred."
        TIMEOUT_FAILURE -> "A network timeout occurred."
        CONTENT_TYPE_MISMATCH -> "The server returned an invalid content type."
        PAGE_LOAD_FAILURE -> "The page could not be loaded due to a configuration error."
        HTTP -> "There was an HTTP Error ($errorCode)."
        UNKNOWN -> "An error occurred."
      }
    }
  }

}
