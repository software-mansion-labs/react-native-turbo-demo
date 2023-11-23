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
  @objc var sessionHandle: NSString? = nil {
    didSet {
      validateSessionProperty(propertyName: "sessionHandle", oldValue: oldValue)
    }
  }
  @objc var applicationNameForUserAgent: NSString? = nil {
    didSet {
      validateSessionProperty(propertyName: "applicationNameForUserAgent", oldValue: oldValue)
    }
  }
  @objc var url: NSString = "" {
    didSet {
      if (oldValue != "") {
        self.controller?.visitableURL = URL(string: String(url))!
        getSession()?.visit(controller!)
      }
    }
  }
  @objc var onMessage: RCTDirectEventBlock?
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  @objc var onVisitError: RCTDirectEventBlock?
  @objc var onWarning: RCTDirectEventBlock?
  
  var bridge: RCTBridge?
  var controller: RNVisitableViewController?
  
  private var session: RNSession? = nil;
  
  init(bridge: RCTBridge) {
    self.bridge = bridge
    super.init(frame: CGRect.zero)
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
    
  public func getWebViewConfiguration() -> WKWebViewConfiguration{
    let configuration = WKWebViewConfiguration()
    configuration.applicationNameForUserAgent = applicationNameForUserAgent as String?
    return configuration
  }
  
  public func getRNSesssion() -> RNSession? {
    if(session == nil){
      session = RNSessionManager.shared.findOrCreateSession(sessionHandle: self.sessionHandle, webViewConfiguration: self.getWebViewConfiguration())
    }
    return session
  }
  
  public func getSession() -> Session? {
    return getRNSesssion()?.turboSession
  }
  
  public func getWebView() -> WKWebView? {
    return getRNSesssion()?.turboSession.webView
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
    // Upon initial load, the session.visit function is called
    // to set the currentVisit private variable.
    if(session?.webView.url == nil){
      session?.visit(visitable)
      return
    }
    session?.visitableViewWillAppear(visitable)
  }
    
  public func handleMessage(message: WKScriptMessage){
    onMessage?(["message": message.body])
  }
  
  public func injectJavaScript(code: NSString) -> Void {
    getWebView()?.evaluateJavaScript(code as String)
  }
    
  private func validateSessionProperty(propertyName: NSString, oldValue: NSString?){
    if (oldValue != nil && session != nil){
      onWarning?(["message": "You cannot change \(propertyName) after initialization of the session."])
    }
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
    guard let webView = getWebView() else {
      return
    }
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
