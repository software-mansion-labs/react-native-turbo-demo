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
  private var sessions: [NSString: RNSession] = [:]
    
  @objc var supportedEventNames: [String] = []
  
  @objc
  private var defaultSession = RNSession()
  
  @objc
  public func registerSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
      let sessionHandle = UUID().uuidString as NSString
      supportedEventNames.append("sessionMessage" + (sessionHandle as String))
      sessions[sessionHandle] = RNSession(eventEmitter: self, sessionHandle: sessionHandle)
      resolve(sessionHandle)
  }
  
  @objc
  public func removeSession(
    _ sessionHandle: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
      if let index = supportedEventNames.firstIndex(of: "sessionMessage" + (sessionHandle as String)) {
        supportedEventNames.remove(at: index)
      }
      sessions[sessionHandle] = nil
  }
  
  @objc
  public func getSession(sessionHandle: NSString?) -> RNSession {
    guard sessionHandle != nil else {
      return defaultSession
    }
    return sessions[sessionHandle!] ?? defaultSession
  }
  
  @objc
  public func injectJavaScript(
    _ sessionHandle: NSString,
    code: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock)
  -> Void {

    DispatchQueue.main.async {
      guard let session = self.sessions[sessionHandle] else {
        return reject("RN_SESSION", "cannot find session with id \(sessionHandle)", nil)
      }

      // TODO: move the calling evaluateJS from Session to VisitableView or both
      session.turboSession.webView.evaluateJavaScript(code as String, completionHandler: {res, err in
        if (err != nil) {
          reject("webview_js_inject_error", err?.localizedDescription, err)
          return
        }
        resolve(res)
      })
    }
  }
  
  override func supportedEvents() -> [String]! {
    return supportedEventNames
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
