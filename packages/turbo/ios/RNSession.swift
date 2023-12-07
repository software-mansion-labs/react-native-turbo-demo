//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import RNTurboiOS
import UIKit
import WebKit

class RNSession: NSObject {
  
  private var visitableViews: [RNSessionSubscriber] = []
  private var sessionHandle: NSString
  private var webViewConfiguration: WKWebViewConfiguration
  
  init(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration) {
    self.sessionHandle = sessionHandle
    self.webViewConfiguration = webViewConfiguration
  }

  public lazy var turboSession: Session = {
    webViewConfiguration.userContentController.add(self, name: "nativeApp")
    let session = Session(webViewConfiguration: webViewConfiguration)
    session.delegate = self
    session.webView.allowsLinkPreview = false
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

  func session(_ session: Session, openExternalURL url: URL) {
    visitableViews.last?.didOpenExternalUrl(url: url)
  }
}


extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    for view in visitableViews {
      view.handleMessage(message: message)
    }
  }
  
}
