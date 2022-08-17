//
//  RNTTurboWebviewManager.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Foundation
import Turbo

@objc(RNVisitableViewManager)
class RNVisitableViewManager: RCTViewManager {
  
  override func view() -> UIView! {
    return RNVisitableView(bridge: self.bridge)
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}

