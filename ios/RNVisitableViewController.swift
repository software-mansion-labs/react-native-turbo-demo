//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import Turbo

class RNVisitableViewController: VisitableViewController, SessionDelegate {
  
  override func viewWillAppear(_ animated: Bool) {
    print("View will appear for URL", self.visitableURL.absoluteURL)
    RNVisitableViewManager.session.delegate = self
    RNVisitableViewManager.session.visit(self)
  }

//  override func viewDidLoad() {
//    print("View did appear for URL", self.visitableURL.absoluteURL)
//    RNVisitableViewManager.session.delegate = self
//    super.viewDidLoad()
//  }


  // Session delegate

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
  
}
