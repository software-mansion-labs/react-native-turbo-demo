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
  func clearSnapshotCacheForAllSessions() {
    for (sessionHandle, session) in sessions {
      session.clearSnapshotCache()
    }
  }
    
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

}
