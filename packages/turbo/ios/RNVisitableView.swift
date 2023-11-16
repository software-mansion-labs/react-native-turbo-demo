//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import RNTurboiOS
import UIKit

class RNVisitableView: UIView, SessionSubscriber {
  var id: UUID = UUID()
  @objc var url: NSString = "" {
    didSet {
      if (oldValue != "") {
        self.controller?.visitableURL = URL(string: String(url))!
        getSession()?.visit(controller!)
      }
    }
  }
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  @objc var onVisitError: RCTDirectEventBlock?
  @objc var sessionHandle: NSString?
  var bridge: RCTBridge?
  
  var controller: RNVisitableViewController?
  
  init(bridge: RCTBridge) {
    self.bridge = bridge
    super.init(frame: CGRect.zero)
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
  
  public func getRNSesssion() -> RNSession? {
    if (!Thread.isMainThread) {
      print("getSession accessed from incorrect thread")
      return nil
    }
    
    guard let sessionModule = self.bridge?.uiManager.moduleRegistry.module(forName: "RNVisitableViewModule") as? RNVisitableViewModule else {
        print("Couldn't find session for sessionHandle:", sessionHandle ?? "default session")
        return nil
    }
    return sessionModule.getSession(sessionHandle: sessionHandle)
  }
  
  public func getSession() -> Session? {
    return getRNSesssion()?.turboSession
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
    self.controller?.view.frame = bounds // Fixes incorrect size of the webview
    self.controller?.didMove(toParent: self.reactViewController())
  }
  
  func attachDelegateAndVisit(_ visitable: Visitable) {
    let session = getSession()
    session?.delegate = self
    session?.visit(visitable)
  }
}

extension RNVisitableView: RNVisitableViewControllerDelegate {
  func visitableWillAppear(visitable: Visitable) {
    getRNSesssion()?.registerVisitableView(newView: self)
  }
  
  func visitableDidDisappear(visitable: RNTurboiOS.Visitable) {
    getRNSesssion()?.removeVisitableView(view: self)
  }

  func visitableDidRender(visitable: Visitable) {
    guard let session = getSession() else {
      return
    }
    let event: [AnyHashable: Any] = [
      "title": session.webView.title!,
      "url": session.webView.url!
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
