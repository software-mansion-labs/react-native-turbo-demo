//
//  RNSessionManager.swift
//  RNTurbo
//
//  Created by Patryk Klatka on 22/11/2023.
//

import Foundation

class RNSessionManager {

  private var sessions: [NSString: RNSession] = [:]
  static var shared: RNSessionManager = RNSessionManager()

  private init() {}

  func findOrCreateSession(sessionHandle: NSString?, webViewConfiguration: WKWebViewConfiguration) -> RNSession {
    let resolvedSessionHandle = sessionHandle ?? ("Default" as NSString)
    
    if(sessions[resolvedSessionHandle] == nil){
      sessions[resolvedSessionHandle] = RNSession(sessionHandle: resolvedSessionHandle, webViewConfiguration: webViewConfiguration)
    }
    
    return sessions[resolvedSessionHandle]!
  }

}
