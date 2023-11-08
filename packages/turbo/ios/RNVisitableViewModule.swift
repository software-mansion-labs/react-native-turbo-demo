//
//  RNVisitableViewModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

import Foundation

@objc(RNVisitableViewModule)
class RNVisitableViewModule: RCTEventEmitter {
  
  @objc
  private var sessions: [NSString: RNSession] = [:]
    
  @objc var supportedEventNames: [String] = []
  
  @objc
  private var defaultSession = RNSession()
    
  @objc
  public func setConfiguration(
    _ sessionHandle: NSString,
    applicationNameForUserAgent: NSString?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
      if(sessions[sessionHandle] == nil){
        sessions[sessionHandle] = RNSession(eventEmitter: self, sessionHandle: sessionHandle, applicationNameForUserAgent: applicationNameForUserAgent)
        registerEvent("sessionMessage\(sessionHandle)" as NSString)
      }
      resolve(sessionHandle)
  }
  
  @objc
  public func registerSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
      let sessionHandle = UUID().uuidString as NSString
      registerEvent("sessionMessage\(sessionHandle)" as NSString)
      sessions[sessionHandle] = RNSession(eventEmitter: self, sessionHandle: sessionHandle)
      resolve(sessionHandle)
  }
  
  @objc
  public func removeSession(
    _ sessionHandle: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
      unregisterEvent("sessionMessage\(sessionHandle)" as NSString)
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

  @objc
  public func registerEvent(_ eventName: NSString){
    if (supportedEventNames.firstIndex(of: eventName as String) == nil){
      supportedEventNames.append(eventName as String)
    }
  }

  @objc
  public func unregisterEvent(_ eventName: NSString){
    if let index = supportedEventNames.firstIndex(of: eventName as String) {
      supportedEventNames.remove(at: index)
    }
  }

  override func supportedEvents() -> [String]! {
    return supportedEventNames
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
