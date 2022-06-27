//
//  RNTTurboWebviewManager.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Foundation
import Turbo

@objc(RNVisitableViewManager)
class RNVisitableViewManager: RCTViewManager, SessionDelegate {
  
  private static var session: Session = {
      let session = Session()
     
      return session
  }()
  
  func sessionWebViewProcessDidTerminate(_ session: Session) {
    
  }

  func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
      // Handle a visit proposal
  }

  func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
      // Handle a visit error
  }

  func webView(_ webView: WKWebView, decidePolicyForNavigationAction navigationAction: WKNavigationAction, decisionHandler: (WKNavigationActionPolicy) -> ()) {
      decisionHandler(WKNavigationActionPolicy.cancel)
      // Handle non-Turbo links
  }
  
  private var controller = VisitableViewController(url: URL(string:"https://turbo-native-demo.glitch.me")!)
  
  override func view() -> UIView! {
    RNVisitableViewManager.session.delegate = self
    RNVisitableViewManager.session.visit(controller)
    return controller.view
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}

