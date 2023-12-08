//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import RNTurboiOS
import UIKit
import WebKit

protocol WKUIDelegateHandler{
  func alertHandler(message: String)
  func confirmHandler(message: String)
}

class TurboUIDelegate: NSObject, WKUIDelegate{
  private var uiHandler:WKUIDelegateHandler
  init(uiHandler: WKUIDelegateHandler) {
    self.uiHandler = uiHandler
  }
  
  func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
    self.uiHandler.alertHandler(message: message)
    completionHandler()
  }
  
  func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void){
    self.uiHandler.confirmHandler(message: message)
    completionHandler(true)
  }
}

class RNSession: NSObject {
  
  private var visitableViews: [RNSessionSubscriber] = []
  private var sessionHandle: NSString
  private var webViewConfiguration: WKWebViewConfiguration
  private var wkUiDelegate: WKUIDelegate?
  
  init(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration) {
    self.sessionHandle = sessionHandle
    self.webViewConfiguration = webViewConfiguration
  }

  public lazy var turboSession: Session = {
    webViewConfiguration.userContentController.add(self, name: "nativeApp")
    self.wkUiDelegate = TurboUIDelegate(uiHandler: self)
    let session = Session(webViewConfiguration: webViewConfiguration)
    session.delegate = self
    session.webView.allowsLinkPreview = false
    session.webView.uiDelegate = self.wkUiDelegate
    return session
  }()
  public lazy var webView: WKWebView = turboSession.webView
  
  func registerVisitableView(newView: RNSessionSubscriber) {
    if (!visitableViews.contains {
      $0.id == newView.id
    }) {
      visitableViews.append(newView)
    }
  }
  
  func unregisterVisitableView(view: RNSessionSubscriber) {
    let wasTopMostView = visitableViews.last?.id == view.id
    
    let viewIdx = visitableViews.lastIndex(where: {
      view.id == $0.id
    })
    visitableViews.remove(at: viewIdx!)

    // The new top-most view is not registered when the previous top-most view is a modal
    if (wasTopMostView) {
      guard let newView = visitableViews.last else {
        return
      }
      visitableViewWillAppear(view: newView)
    }
  }
    
  func visitableViewWillAppear(view: RNSessionSubscriber) {
    turboSession.visitableViewWillAppear(view.controller)
  }
    
  func visit(_ visitable: Visitable) {
    turboSession.visit(visitable)
  }
    
  func reload() {
    turboSession.reload()
  }
  
}


extension RNSession: SessionDelegate {
  
  func sessionWebViewProcessDidTerminate(_ session: Session) {
    
  }

  func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
    visitableViews.last?.didProposeVisit(proposal: proposal)
  }

  func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
    visitableViews.last?.didFailRequestForVisitable(visitable: visitable, error: error)
  }

  func webView(_ webView: WKWebView, decidePolicyForNavigationAction navigationAction: WKNavigationAction, decisionHandler: (WKNavigationActionPolicy) -> ()) {
    decisionHandler(WKNavigationActionPolicy.cancel)
    // Handle non-Turbo links
  }
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    for view in visitableViews {
      view.handleMessage(message: message)
    }
  }
  
}

extension RNSession : WKUIDelegateHandler{

  func alertHandler(message: String) {
    guard let visitableView = visitableViews.last else {
      return
    }
    visitableView.handleAlert(message: message)
  }

  func confirmHandler(message: String) {
    guard let visitableView = visitableViews.last else {
      return
    }
    visitableView.handleConfirm(message: message)
  }
}
