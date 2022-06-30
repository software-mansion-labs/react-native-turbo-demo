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
  
  public static var session: Session = {
      let session = Session()
      return session
  }()
  
  override func view() -> UIView! {
    return RNVisitableView()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}

