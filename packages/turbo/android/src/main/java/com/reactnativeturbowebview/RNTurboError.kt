package com.reactnativeturbowebview

enum class RNTurboError(val code: Int) {
  HTTP(1),
  NETWORK_FAILURE(0),
  TIMEOUT_FAILURE(-1),
  CONTENT_TYPE_MISMATCH(-2),
  PAGE_LOAD_FAILURE(-3),
  UNKNOWN(-4);

  companion object {
    fun transformCode(code: Int): Int {
      return when (code) {
        -6 -> 0
        -8 -> -1
        -1 -> -3
        else -> if (code > 0) code else -4
      }
    }

    private fun fromCode(code: Int): RNTurboError {
      RNTurboError.values().forEach {
        if (it.code == transformCode(code)) {
          return it
        }
      }

      if (code > 0) {
        return HTTP
      }

      return UNKNOWN
    }

    fun errorDescription(errorCode: Int): String {
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
