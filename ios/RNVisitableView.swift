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
  @objc var onVisitError: RCTDirectEventBlock?
  @objc var sessionHandle: NSNumber?
  var bridge: RCTBridge?
  
  private var controller: RNVisitableViewController?
  
  init(bridge: RCTBridge) {
    self.bridge = bridge
    super.init(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
  
  public func getSession() -> Session? {
    print("getting session for", sessionHandle)
    
    if (sessionHandle != nil) {
      let view = self.bridge?.uiManager?.view(forReactTag: sessionHandle!) as? RNSession
      return view?.session
    }
//    let session = RNSessionManager.sessions[sessionId as String]
//    return session
    return nil
  }
  
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
}

extension RNVisitableView: RNVisitableViewControllerDelegate {

  func visitableWillAppear(visitable: Visitable) {
    print("View will appear for URL", visitable.visitableURL.absoluteString)
    let session = getSession()
    session?.delegate = self
    session?.visit(visitable)
  }
  
  
  func visitableDidRender(visitable: Visitable) {
    let session = getSession()
    let event: [AnyHashable: Any] = [
      "title": session?.webView.title,
      "url": session?.webView.url
    ]
    onLoad?(event)
  }
  
}

extension RNVisitableView: SessionDelegate {
  
  func sessionWebViewProcessDidTerminate(_ session: Session) {
    
  }

  func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
    // Handle a visit proposal
    if (session.webView.url == proposal.url) {
      // When reopening same URL we want to reload webview
      getSession()?.reload()
    } else {
      let event: [AnyHashable: Any] = [
        "url": proposal.url.absoluteString,
        "action": proposal.options.action.rawValue,
      ]
      onVisitProposal!(event)
    }
  }

  func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
    // Handle a visit error
    var event: [AnyHashable: Any] = [
      "url": visitable.visitableURL.absoluteString,
      "error": error.localizedDescription,
    ]
    
    if let turboError = error as? TurboError, case let .http(statusCode) = turboError {
      event["statusCode"] = statusCode
    }

    onVisitError?(event)
  }

  func webView(_ webView: WKWebView, decidePolicyForNavigationAction navigationAction: WKNavigationAction, decisionHandler: (WKNavigationActionPolicy) -> ()) {
      decisionHandler(WKNavigationActionPolicy.cancel)
      // Handle non-Turbo links
  }
  
}
