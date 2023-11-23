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
      validateSessionProperty(propertyName: "sessionHandle", oldValue: oldValue, newValue: sessionHandle)
    }
  }
  @objc var applicationNameForUserAgent: NSString? = nil {
    didSet {
      validateSessionProperty(propertyName: "applicationNameForUserAgent", oldValue: oldValue, newValue: applicationNameForUserAgent)
    }
  }
  @objc var url: NSString = "" {
    didSet {
      if (oldValue != "") {
        controller.visitableURL = URL(string: String(url))!
        turboSession.visit(controller)
      }
    }
  }
  @objc var onMessage: RCTDirectEventBlock?
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  @objc var onVisitError: RCTDirectEventBlock?
  @objc var onWarning: RCTDirectEventBlock?
  
  var bridge: RCTBridge?
  
  private lazy var session: RNSession = {
    let webViewConfiguration = self.getWebViewConfiguration()
    let session = RNSessionManager.shared.findOrCreateSession(sessionHandle: self.sessionHandle!, webViewConfiguration: webViewConfiguration)
    if(session.configurationEquals(webViewConfiguration: webViewConfiguration)){
      sendSessionConfigurationWarning(propertyName: "webViewConfiguration")
    }
    return session
  }()
  private lazy var turboSession: Session = session.turboSession
  private lazy var webView: WKWebView = turboSession.webView
    
  lazy var controller: RNVisitableViewController = {
    let url = URL(string: String(url))!
    let controller = RNVisitableViewController(url: url)
    controller.delegate = self
    reactViewController().addChild(controller)
    controller.view.frame = bounds // Fixes incorrect size of the webview
    controller.didMove(toParent: reactViewController())
    return controller
  }()
    
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
  
  override func didMoveToWindow() {
    if (!subviews.contains(controller.view)){
      addSubview(controller.view)
    }
  }
  
  func attachDelegateAndVisit(_ visitable: Visitable) {
    turboSession.delegate = self
    // Upon initial load, the session.visit function is called
    // to set the currentVisit private variable.
    if(webView.url == nil){
      turboSession.visit(visitable)
      return
    }
    turboSession.visitableViewWillAppear(visitable)
  }
    
  public func handleMessage(message: WKScriptMessage){
    if let messageBody = message.body as? [AnyHashable : Any] {
      onMessage?(messageBody)
    }
  }
  
  public func injectJavaScript(code: NSString) -> Void {
    webView.evaluateJavaScript(code as String)
  }
    
  private func sendSessionConfigurationWarning(propertyName: NSString){
    onWarning?(["message": "You cannot change \(propertyName) after initialization of the session."])
  }
  
  private func validateSessionProperty(propertyName: NSString, oldValue: NSString?, newValue: NSString?) -> Void{
    if (oldValue != nil && newValue != nil  && !oldValue!.isEqual(to: newValue! as String)){
      sendSessionConfigurationWarning(propertyName: propertyName)
    }
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
