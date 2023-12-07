//
//  RNSessionManager.swift
//  RNTurbo
//
//  Created by Patryk Klatka on 22/11/2023.
//

import Foundation

class RNSessionManager {

  private var sessions: [NSString: RNSession] = [:]
  private var processPool = WKProcessPool()
  static var shared: RNSessionManager = RNSessionManager()

  private init() {}

  func findOrCreateSession(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration) -> RNSession {
    if(sessions[sessionHandle] == nil) {
      webViewConfiguration.processPool = processPool
      sessions[sessionHandle] = RNSession(sessionHandle: sessionHandle, webViewConfiguration: webViewConfiguration)
    }
    return sessions[sessionHandle]!
  }

}
