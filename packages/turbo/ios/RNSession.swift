//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo
import UIKit
import WebKit

class RNSession: NSObject {
  
  @objc var onMessage: RCTDirectEventBlock?
  
  public lazy var turboSession: Session = {
    let configuration = WKWebViewConfiguration()
    configuration.userContentController.add(self, name: "nativeApp")
    return Session(webViewConfiguration: configuration)
  }()
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    onMessage?(["message": message.body])
  }
  
}
