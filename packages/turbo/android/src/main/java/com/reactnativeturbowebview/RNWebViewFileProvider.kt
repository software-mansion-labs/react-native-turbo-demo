package com.reactnativeturbowebview

import androidx.core.content.FileProvider

/**
 * Providing a custom `FileProvider` prevents manifest `<provider>` name collisions.
 *
 * See https://developer.android.com/guide/topics/manifest/provider-element.html for details.
 */
class RNWebViewFileProvider : FileProvider()
