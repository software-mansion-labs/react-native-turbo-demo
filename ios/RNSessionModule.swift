//
//  RNSessionModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

import Foundation

@objc(RNSessionModule)
class RNSessionModule: RCTEventEmitter {
  
  @objc
  public func injectJavaScript(
    _ sessionHandle: NSNumber,
    code: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock)
  -> Void {

    DispatchQueue.main.async {
      guard let session = self.bridge?.uiManager?.view(forReactTag: sessionHandle) as? RNSession else {
        reject("webview_js_inject_error", "Couldn't find session for sessionHandle: \(sessionHandle)", nil)
        return
      }

      session.session.webView.evaluateJavaScript(code as String, completionHandler: {res, err in
        if (err != nil) {
          reject("webview_js_inject_error", err?.localizedDescription, err)
          return
        }
        resolve(res)
      })
    }
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
