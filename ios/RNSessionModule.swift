//
//  RNSessionModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

import Foundation

@objc(RNSessionModule) class RNSessionModule: NSObject {
  
  @objc public func injectJavaScript() {
    print("Triggering injectJavaScript func")
  }
  
}
