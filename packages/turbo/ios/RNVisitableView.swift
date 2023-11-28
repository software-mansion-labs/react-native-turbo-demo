//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import RNTurboiOS
import UIKit

class RNVisitableView: UIView, RNSessionSubscriber {
  var id: UUID = UUID()
  @objc var sessionHandle: NSString? = nil
  @objc var applicationNameForUserAgent: NSString? = nil
  @objc var url: NSString = "" {
    didSet {
      controller.visitableURL = URL(string: String(url))
    }
  }
  @objc var onMessage: RCTDirectEventBlock?
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  @objc var onVisitError: RCTDirectEventBlock?
  
  private lazy var session: RNSession = RNSessionManager.shared.findOrCreateSession(sessionHandle: self.sessionHandle!, webViewConfiguration: webViewConfiguration)
  private lazy var turboSession: Session = session.turboSession
  private lazy var webView: WKWebView = turboSession.webView
  private lazy var webViewConfiguration: WKWebViewConfiguration = {
    let configuration = WKWebViewConfiguration()
    configuration.applicationNameForUserAgent = applicationNameForUserAgent as String?
    return configuration
  }()
    
  lazy var controller: RNVisitableViewController = {
    let controller = RNVisitableViewController()
    controller.delegate = self
    return controller
  }()
    
  init() {
    super.init(frame: CGRect.zero)
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
  
  override func didMoveToWindow() {
    reactViewController().addChild(controller)
    controller.view.frame = bounds // Fixes incorrect size of the webview
    controller.didMove(toParent: reactViewController())
    addSubview(controller.view)
  }
    
  func attachDelegateAndVisit() {
    turboSession.delegate = self
    performVisit()
  }
    
  public func handleMessage(message: WKScriptMessage){
    if let messageBody = message.body as? [AnyHashable : Any] {
      onMessage?(messageBody)
    }
  }
  
  public func injectJavaScript(code: NSString) -> Void {
    webView.evaluateJavaScript(code as String)
  }
    
  private func performVisit(){
    // Upon initial load, the session.visit function is called
    // to set the currentVisit private variable.
    if(webView.url == nil){
      turboSession.visit(controller)
      return
    }
    turboSession.visitableViewWillAppear(controller)
  }
}

extension RNVisitableView: RNVisitableViewControllerDelegate {
  func visitableWillAppear(visitable: Visitable) {
    session.registerVisitableView(newView: self)
  }
  
  func visitableDidDisappear(visitable: Visitable) {
    session.removeVisitableView(view: self)
  }

  func visitableDidRender(visitable: Visitable) {
    let event: [AnyHashable: Any] = [
      "title": webView.title!,
      "url": webView.url!
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
      turboSession.reload()
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
