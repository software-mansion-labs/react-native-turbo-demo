//
//  RNSessionModule.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

import Foundation

@objc(RNSessionModule) class RNSessionModule: NSObject {
  
  @objc public func injectJavaScript(_ sessionHandle: NSNumber, code: NSString, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    print("Triggering injectJavaScript func \(sessionHandle) \(code)")
    resolve("test response")
  }
  
}
