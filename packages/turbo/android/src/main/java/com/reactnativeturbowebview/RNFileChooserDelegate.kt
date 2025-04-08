package com.reactnativeturbowebview

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Parcelable
import android.provider.MediaStore
import android.util.Log
import android.webkit.MimeTypeMap
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File
import java.io.IOException

const val INPUT_FILE_REQUEST_CODE = 1

/*
* This implementation is mostly based on RNCWebViewModuleImpl from react-native-webview
*
* See https://github.com/react-native-webview/react-native-webview/blob/master/android/src/main/java/com/reactnativecommunity/webview/RNCWebViewModuleImpl.java
* */
class RNFileChooserDelegate(private val reactContext: ReactApplicationContext) {
  private var mFilePathCallback: ValueCallback<Array<Uri>>? = null
  private var outputImage: File? = null
  private var outputVideo: File? = null

  private enum class MimeType(val value: String) {
    DEFAULT("*/*"), IMAGE("image"), VIDEO("video")
  }

  private fun needsCameraPermission(): Boolean {
    var needed = false
    val packageManager: PackageManager = reactContext.packageManager
    val packageName: String = reactContext.packageName
    try {
      val requestedPermissions: Array<String>? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          packageManager.getPackageInfo(
            packageName, PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong())
          ).requestedPermissions
        } else {
          @Suppress("DEPRECATION") packageManager.getPackageInfo(
            packageName, PackageManager.GET_PERMISSIONS
          ).requestedPermissions
        }

      if (requestedPermissions!= null
          && listOf(*requestedPermissions).contains(Manifest.permission.CAMERA)
          && reactContext.currentActivity != null
          && ContextCompat.checkSelfPermission(
          reactContext.currentActivity!!, Manifest.permission.CAMERA
        ) != PackageManager.PERMISSION_GRANTED
      ) {
        needed = true
      }
    } catch (e: PackageManager.NameNotFoundException) {
      needed = true
    }
    return needed
  }

  private fun getMimeTypeFromExtension(extension: String?): String? {
    var type: String? = null
    if (extension != null) {
      type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
    }
    return type
  }

  private fun noAcceptTypesSet(types: Array<String>): Boolean {
    // when our array returned from getAcceptTypes() has no values set from the webview
    // i.e. <input type="file" />, without any "accept" attr
    // will be an array with one empty string element, afaik
    return types.isEmpty() || types.size == 1 && types[0].isEmpty()
  }


  private fun getAcceptedMimeType(types: Array<String>): Array<String> {
    if (noAcceptTypesSet(types)) {
      return arrayOf(MimeType.DEFAULT.value)
    }
    val mimeTypes = arrayOfNulls<String>(types.size)
    for (i in types.indices) {
      val t = types[i]
      // convert file extensions to mime types
      if (t.matches("\\.\\w+".toRegex())) {
        val mimeType: String? = getMimeTypeFromExtension(t.replace(".", ""))
        if (mimeType != null) {
          mimeTypes[i] = mimeType
        } else {
          mimeTypes[i] = t
        }
      } else {
        mimeTypes[i] = t
      }
    }
    return mimeTypes.filterNotNull().toTypedArray()
  }


  private fun acceptsImages(types: Array<String>): Boolean {
    val mimeTypes: Array<String> = getAcceptedMimeType(types)
    return mimeTypes.any { it.contains(MimeType.IMAGE.value) } || mimeTypes.any {
      it.contains(
        MimeType.DEFAULT.value
      )
    }
  }


  private fun acceptsVideo(types: Array<String>): Boolean {
    val mimeTypes: Array<String> = getAcceptedMimeType(types)
    return mimeTypes.any { it.contains(MimeType.VIDEO.value) } || mimeTypes.any {
      it.contains(
        MimeType.DEFAULT.value
      )
    }
  }


  private fun getCapturedFile(mimeType: MimeType): File? {
    var prefix = ""
    var suffix = ""
    when (mimeType) {
      MimeType.IMAGE -> {
        prefix = "image-"
        suffix = ".jpg"
      }

      MimeType.VIDEO -> {
        prefix = "video-"
        suffix = ".mp4"
      }

      else -> {}
    }

    val storageDir: File? = reactContext.getExternalFilesDir(null)
    return File.createTempFile(prefix, suffix, storageDir)
  }

  private fun getOutputUri(capturedFile: File): Uri {
    return FileProvider.getUriForFile(
      reactContext, reactContext.packageName + ".file-provider", capturedFile
    )
  }

  private fun getPhotoIntent(): Intent? {
    var intent: Intent? = null
    try {
      outputImage = getCapturedFile(MimeType.IMAGE)
      if (outputImage == null) {
        return null
      }
      val outputImageUri: Uri = getOutputUri(outputImage!!)
      intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
      intent.putExtra(MediaStore.EXTRA_OUTPUT, outputImageUri)
    } catch (e: IOException) {
      e.printStackTrace()
    } catch (e: IllegalArgumentException) {
      e.printStackTrace()
    }
    return intent
  }

  private fun getVideoIntent(): Intent? {
    var intent: Intent? = null
    try {
      outputVideo = getCapturedFile(MimeType.VIDEO)
      if (outputVideo == null) {
        return null
      }
      val outputVideoUri = getOutputUri(outputVideo!!)
      intent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
      intent.putExtra(MediaStore.EXTRA_OUTPUT, outputVideoUri)
    } catch (e: IOException) {
      Log.e("CREATE FILE", "Error occurred while creating the File", e)
      e.printStackTrace()
    } catch (e: java.lang.IllegalArgumentException) {
      Log.e("CREATE FILE", "Error occurred while creating the File", e)
      e.printStackTrace()
    }
    return intent
  }

  private fun getFileChooserIntent(acceptTypes: Array<String>, allowMultiple: Boolean): Intent {
    val intent = Intent(Intent.ACTION_GET_CONTENT)
    intent.addCategory(Intent.CATEGORY_OPENABLE)
    intent.type = MimeType.DEFAULT.value
    intent.putExtra(Intent.EXTRA_MIME_TYPES, getAcceptedMimeType(acceptTypes))
    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)
    return intent
  }

  fun onShowFileChooser(
    filePathCallback: ValueCallback<Array<Uri>>,
    fileChooserParams: WebChromeClient.FileChooserParams
  ): Boolean {
    val acceptTypes = fileChooserParams.acceptTypes
    val allowMultiple =
      fileChooserParams.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE

    mFilePathCallback = filePathCallback
    val extraIntents = ArrayList<Parcelable>()
    if (!needsCameraPermission()) {
      if (acceptsImages(acceptTypes)) {
        val photoIntent: Intent? = getPhotoIntent()
        if (photoIntent != null) {
          extraIntents.add(photoIntent)
        }
      }
      if (acceptsVideo(acceptTypes)) {
        val videoIntent: Intent? = getVideoIntent()
        if (videoIntent != null) {
          extraIntents.add(videoIntent)
        }
      }
    }

    val fileSelectionIntent: Intent = getFileChooserIntent(acceptTypes, allowMultiple)

    val chooserIntent = Intent(Intent.ACTION_CHOOSER)
    chooserIntent.putExtra(Intent.EXTRA_INTENT, fileSelectionIntent)
    chooserIntent.putExtra(
      Intent.EXTRA_INITIAL_INTENTS, extraIntents.toArray(arrayOf<Parcelable>())
    )
    return reactContext.startActivityForResult(chooserIntent, INPUT_FILE_REQUEST_CODE, null)
  }

  private fun getSelectedFiles(data: Intent?, resultCode: Int): Array<Uri>? {
    if (data == null) {
      return null
    }

    // we have multiple files selected
    if (data.clipData != null) {
      val numSelectedFiles = data.clipData!!.itemCount
      val result = arrayOfNulls<Uri>(numSelectedFiles)
      for (i in 0 until numSelectedFiles) {
        result[i] = data.clipData!!.getItemAt(i).uri
      }
      return result.filterNotNull().toTypedArray()
    }

    // we have one file selected
    return if (data.data != null && resultCode == Activity.RESULT_OK) {
      WebChromeClient.FileChooserParams.parseResult(resultCode, data)
    } else null
  }


  fun onActivityResult(resultCode: Int, data: Intent?) {
    if (mFilePathCallback == null) {
      return
    }

    var imageTaken = false
    var videoTaken = false

    if (outputImage != null && outputImage!!.length() > 0) {
      imageTaken = true
    }
    if (outputVideo != null && outputVideo!!.length() > 0) {
      videoTaken = true
    }

    // based off of which button was pressed, we get an activity result and a file
    // the camera activity doesn't properly return the filename* (I think?) so we use
    // this filename instead
    if (resultCode != Activity.RESULT_OK) {
      if (mFilePathCallback != null) {
        mFilePathCallback?.onReceiveValue(null)
      }
    } else {
      if (imageTaken) {
        mFilePathCallback?.onReceiveValue(arrayOf(getOutputUri(outputImage!!)))
      } else if (videoTaken) {
        mFilePathCallback?.onReceiveValue(arrayOf(getOutputUri(outputVideo!!)))
      } else {
        mFilePathCallback?.onReceiveValue(getSelectedFiles(data, resultCode))
      }
    }

    if (outputImage != null && !imageTaken) {
      outputImage!!.delete()
    }
    if (outputVideo != null && !videoTaken) {
      outputVideo!!.delete()
    }

    mFilePathCallback = null
    outputImage = null
    outputVideo = null
  }
}
