//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import ReactNativeHotwiredTurboiOS
import UIKit

class RNVisitableView: UIView, RNSessionSubscriber {
  var id: UUID = UUID()
  @objc var sessionHandle: NSString? = nil
  @objc var applicationNameForUserAgent: NSString? = nil
  @objc var url: NSString = "" {
    didSet {
      if(url != oldValue) {
        visit()
      }
    }
  }
  @objc var pullToRefreshEnabled: Bool = true {
    didSet {
      controller.visitableView.allowsPullToRefresh = pullToRefreshEnabled
    }
  }
  @objc var onMessage: RCTDirectEventBlock?
  @objc var onVisitProposal: RCTDirectEventBlock?
  @objc var onOpenExternalUrl: RCTDirectEventBlock?
  @objc var onLoad: RCTDirectEventBlock?
  @objc var onError: RCTDirectEventBlock?
  @objc var onWebAlert: RCTDirectEventBlock?
  @objc var onWebConfirm: RCTDirectEventBlock?
  @objc var onFormSubmissionStarted: RCTDirectEventBlock?
  @objc var onFormSubmissionFinished: RCTDirectEventBlock?
  @objc var onShowLoading: RCTDirectEventBlock?
  @objc var onHideLoading: RCTDirectEventBlock?
  @objc var onContentProcessDidTerminate: RCTDirectEventBlock?
  
  private var onConfirmHandler: ((Bool) -> Void)?
  private var onAlertHandler: (() -> Void)?

  private lazy var session: RNSession = RNSessionManager.shared.findOrCreateSession(sessionHandle: sessionHandle!, webViewConfiguration: webViewConfiguration)
  private lazy var webView: WKWebView = session.webView
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
    
  private var isRefreshing: Bool {
    controller.visitableView.isRefreshing
  }
    
  override func didMoveToWindow() {
    reactViewController()?.addChild(controller)
    controller.view.frame = bounds // Fixes incorrect size of the webview
    controller.didMove(toParent: reactViewController())
    addSubview(controller.view)
  }
  
  public func handleMessage(message: WKScriptMessage) {
    if let messageBody = message.body as? [AnyHashable : Any] {
      onMessage?(messageBody)
    }
  }
  
  public func injectJavaScript(code: NSString) -> Void {
    webView.evaluateJavaScript(code as String)
  }
  
  public func sendAlertResult() -> Void {
    self.onAlertHandler?()
    self.onAlertHandler = nil
  }
  
  public func sendConfirmResult(result: NSString) -> Void {
    let confirmResult = result == "true"
    self.onConfirmHandler?(confirmResult)
    self.onConfirmHandler = nil
  }
  
  public func reload(){
    session.reload()
  }
  
  private func visit() {
    if (controller.visitableURL?.absoluteString == url as String) {
      return
    }
    performVisit()
  }
  
  private func performVisit() {
    controller.visitableURL = URL(string: String(url))
    session.visit(controller)
  }
  
  public func didProposeVisit(proposal: VisitProposal){
    if (webView.url == proposal.url) {
      // When reopening same URL we want to reload webview
      reload()
    } else {
      let event: [AnyHashable: Any] = [
        "url": proposal.url.absoluteString,
        "action": proposal.options.action.rawValue,
      ]
      onVisitProposal!(event)
    }
  }
  
  func getStatusCodeFromError(error: TurboError?) -> Int {
    switch error {
      case .networkFailure:
        return 0
      case .timeoutFailure:
        return -1
      case .contentTypeMismatch:
        return -2
      case .pageLoadFailure:
        return -3
      case .http(let statusCode):
        return statusCode
      case .none:
        return -4
    }
  }
  
  public func didFailRequestForVisitable(visitable: Visitable, error: Error){
    var event: [AnyHashable: Any] = [
      "url": visitable.visitableURL.absoluteString,
      "description": error.localizedDescription,
      "statusCode": getStatusCodeFromError(error: error as? TurboError)
    ]
    onError?(event)
  }
  
  public func didOpenExternalUrl(url: URL) {
    onOpenExternalUrl?(["url": url.absoluteString])
  }
  
  public func didStartFormSubmission() {
    onFormSubmissionStarted?(["url": url])
  }
  
  public func didFinishFormSubmission() {
    onFormSubmissionFinished?(["url": url])
  }
  
  public func processDidTerminate() {
    onContentProcessDidTerminate?(["url": url])
  }
  
  func clearSessionSnapshotCache(){
    session.clearSnapshotCache()
  }
  
  func handleAlert(message: String, completionHandler: @escaping () -> Void) {
    let event: [AnyHashable: Any] = [
      "message": message,
    ]
    self.onWebAlert?(event)
    self.onAlertHandler = completionHandler
  }
  
  func handleConfirm(message: String, completionHandler: @escaping (Bool) -> Void) {
    let event: [AnyHashable: Any] = [
      "message": message,
    ]
    self.onWebConfirm?(event)
    self.onConfirmHandler = completionHandler
  }
}

extension RNVisitableView: RNVisitableViewControllerDelegate {

  func visitableWillAppear(visitable: Visitable) {
    session.visitableViewWillAppear(view: self)
  }
  
  func visitableDidAppear(visitable: Visitable) {
    session.visitableViewDidAppear(view: self)
  }
  
  func visitableWillDisappear(visitable: Visitable) {
    session.visitableViewWillDisappear(view: self)
  }
  
  func visitableDidDisappear(visitable: Visitable) {
    session.visitableViewDidDisappear(view: self)
  }
  
  func visitableDidRender(visitable: Visitable) {
    let event: [AnyHashable: Any] = [
      "title": webView.title!,
      "url": webView.url!
    ]
    onLoad?(event)
  }
  
  func showVisitableActivityIndicator() {
    guard !isRefreshing else { return }
    onShowLoading?([:])
  }
  
  func hideVisitableActivityIndicator() {
    onHideLoading?([:])
  }
  
}
