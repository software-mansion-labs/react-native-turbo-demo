//
//  SessionModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 09/08/2022.
//

import Foundation

@objc(SessionNativeModule)
class SessionNativeModule: NSObject {
  
  @objc func createSession(_ callback: RCTResponseSenderBlock) {
    let sessionId = "HelloModuleReturnedId"
    print("HelloModuleReturnedId")
    callback([sessionId])
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}
