//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo
import UIKit
import WebKit

class RNSession: UIView {
  
  @objc var onMessage: RCTDirectEventBlock?
  
  public lazy var session: Session = {
    let configuration = WKWebViewConfiguration()
          
    configuration.userContentController.add(self, name: "nativeApp")
    let session = Session(webViewConfiguration: configuration)
    
    return session
  }()
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    print("message", message.body)
    onMessage?(["message": message.body])
  }
  
}
