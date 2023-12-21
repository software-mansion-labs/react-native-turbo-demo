package com.reactnativeturbowebview

import android.os.Bundle
import org.json.JSONArray
import org.json.JSONObject

object Utils {
  fun convertJsonToBundle(json: JSONObject): Bundle? {
    val bundle = Bundle()
    val iterator: Iterator<String> = json.keys()
    while (iterator.hasNext()) {
      val key = iterator.next()
      val value: Any = json.get(key)
      when (value.javaClass.simpleName) {
        "String" -> bundle.putString(key, value as String)
        "Integer" -> bundle.putInt(key, value as Int)
        "Long" -> bundle.putLong(key, value as Long)
        "Boolean" -> bundle.putBoolean(key, value as Boolean)
        "JSONObject" -> bundle.putBundle(
          key,
          convertJsonToBundle(value as JSONObject)
        )
        "JSONArray" -> {
          val jsonArray = value as JSONArray
          val bundleArray = ArrayList<Bundle>()
          for (i in 0 until jsonArray.length()) {
            bundleArray.add(convertJsonToBundle(jsonArray.getJSONObject(i))!!)
          }
          bundle.putParcelableArrayList(key, bundleArray)
        }
        "Float" -> bundle.putFloat(key, value as Float)
        "Double" -> bundle.putDouble(key, value as Double)
        else -> bundle.putString(key, value.javaClass.simpleName)
      }
    }
    return bundle
  }
}
