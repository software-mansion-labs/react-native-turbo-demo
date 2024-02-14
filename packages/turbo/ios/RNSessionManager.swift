//
//  RNSessionManager.swift
//  RNTurbo
//
//  Created by Patryk Klatka on 22/11/2023.
//

import Foundation

@objc(RNSessionManager)
class RNSessionManager: NSObject {

  private var sessions: [NSString: RNSession] = [:]
  private var processPool = WKProcessPool()
  static var shared: RNSessionManager = RNSessionManager()

  func findOrCreateSession(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration) -> RNSession {
    if(sessions[sessionHandle] == nil) {
      webViewConfiguration.processPool = processPool
      sessions[sessionHandle] = RNSession(sessionHandle: sessionHandle, webViewConfiguration: webViewConfiguration)
    }
    return sessions[sessionHandle]!
  }
    
  @objc
  func getSessionHandles(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock){
    resolve(Array(RNSessionManager.shared.sessions.keys))
  }
    
  @objc
  func reloadSession(_ sessionHandle: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let session = RNSessionManager.shared.sessions[sessionHandle] else {
      reject("sessionHandle", "No session found with handle \(sessionHandle)", nil)
      return
    }
    DispatchQueue.main.async {
      session.reload()
      resolve(nil)
    }
  }
   
  @objc
  func clearSessionSnapshotCache(_ sessionHandle: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let session = RNSessionManager.shared.sessions[sessionHandle] else {
      reject("sessionHandle", "No session found with handle \(sessionHandle)", nil)
      return
    }
    DispatchQueue.main.async {
      session.clearSnapshotCache()
      resolve(nil)
    }
  }
    
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

}
