//
//  SessionModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 09/08/2022.
//

import Foundation
import Turbo

@objc(RNSessionManager)
class RNSessionManager: RCTViewManager {
  
  override func view() -> UIView! {
    return RNSession()  
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}
