//
//  RNTTurboWebviewManager.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Foundation
import RNTurboiOS

@objc(RNVisitableViewManager)
class RNVisitableViewManager: RCTViewManager {
  
  override func view() -> UIView! {
    return RNVisitableView()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
    
  @objc 
  func injectJavaScript(_ node: NSNumber, code: NSString) {
    DispatchQueue.main.async {
      let component = self.bridge.uiManager.view(forReactTag: node) as! RNVisitableView
      component.injectJavaScript(code: code)
    }
  }
    
  @objc
  func reload(_ node: NSNumber) {
    DispatchQueue.main.async {
      let component = self.bridge.uiManager.view(forReactTag: node) as! RNVisitableView
      component.reload()
    }
  }

}

