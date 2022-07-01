//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo
import UIKit

class RNVisitableView: UIView {
  
  @objc var url: NSString = ""
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  
  private var controller: RNVisitableViewController?
  
  override func didMoveToWindow() {
    let url = URL(string: String(url))!
    
    if (self.controller == nil) {
      print("Open new VistableView with URL passed from JS: ", url)
      
      setupViewController(url: url)
      
      self.addSubview((controller?.view)!)
    }
  }
  
  func setupViewController(url: URL) {
    self.controller = RNVisitableViewController(url: url)
    self.controller?.delegate = self
    self.reactViewController().addChild(self.controller!)
    self.controller?.didMove(toParent: self.reactViewController())
  }
  
  @objc func callVisitPropsosalCallback(url: String, action: String) {
    let event: [AnyHashable: Any] = [
      "url": url,
      "action": action,
    ]
    
    print("Handle a visit callback called:", event)

    onVisitProposal!(event)
  }
  
}

extension RNVisitableView: RNVisitableViewControllerDelegate {
  
  func visitableWillAppear(visitable: Visitable) {
    print("View will appear for URL", visitable.visitableURL.absoluteString)
    RNVisitableViewManager.session.delegate = self
    RNVisitableViewManager.session.visit(visitable)
  }
  
  
  func visitableDidRender(session: Session, visitable: Visitable) {
    print("Visitable did render")
    onLoad?(["title": session.webView.title])
  }
  
}

extension RNVisitableView: SessionDelegate {
  
  func sessionWebViewProcessDidTerminate(_ session: Session) {
    
  }

  func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
      // Handle a visit proposal
      print("Handle a visit proposal proposal:", proposal)
      callVisitPropsosalCallback(url: proposal.url.absoluteString, action: proposal.options.action.rawValue)
  }

  func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
      // Handle a visit error
  }

  func webView(_ webView: WKWebView, decidePolicyForNavigationAction navigationAction: WKNavigationAction, decisionHandler: (WKNavigationActionPolicy) -> ()) {
      decisionHandler(WKNavigationActionPolicy.cancel)
      // Handle non-Turbo links
  }
  
}
