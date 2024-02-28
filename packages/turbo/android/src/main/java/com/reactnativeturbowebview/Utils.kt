package com.reactnativeturbowebview

import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONArray
import org.json.JSONObject

object Utils {
  fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
    val map: WritableMap = WritableNativeMap()
    val iterator: Iterator<String> = jsonObject.keys()

    while (iterator.hasNext()) {
      val key = iterator.next()
      when (val value = jsonObject.get(key)) {
        is JSONObject -> map.putMap(key, convertJsonToMap(value))
        is JSONArray -> map.putArray(key, convertJsonToArray(value))
        is Boolean -> map.putBoolean(key, value)
        is Int -> map.putInt(key, value)
        is Double -> map.putDouble(key, value)
        is String -> map.putString(key, value)
        else -> map.putString(key, value.toString())
      }
    }

    return map
  }

  private fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
    val array: WritableArray = WritableNativeArray()

    for (i in 0 until jsonArray.length()) {
      when (val value = jsonArray.get(i)) {
        is JSONObject -> array.pushMap(convertJsonToMap(value))
        is JSONArray -> array.pushArray(convertJsonToArray(value))
        is Boolean -> array.pushBoolean(value)
        is Int -> array.pushInt(value)
        is Double -> array.pushDouble(value)
        is String -> array.pushString(value)
        else -> array.pushString(value.toString())
      }
    }

    return array
  }
}
