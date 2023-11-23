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
  
  private var visitableViews: [SessionSubscriber] = []
  private var sessionHandle: NSString
  private var webViewConfiguration: WKWebViewConfiguration
  
  init(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration){
    self.sessionHandle = sessionHandle
    self.webViewConfiguration = webViewConfiguration
  }

  public lazy var turboSession: Session = {
    self.webViewConfiguration.userContentController.add(self, name: "nativeApp")
    return Session(webViewConfiguration: self.webViewConfiguration)
  }()
  
  func registerVisitableView(newView: SessionSubscriber) {
    if (!visitableViews.contains {
      $0.id == newView.id
    }) {
      visitableViews.append(newView)
    }
    newView.attachDelegateAndVisit(newView.controller)
  }
  
  func removeVisitableView(view: SessionSubscriber) {
    // New view is not registered when presentation is modal
    let isViewModal = visitableViews.last?.id == view.id
    let viewIdx = visitableViews.lastIndex(where: {
      view.id == $0.id
    })
    visitableViews.remove(at: viewIdx!)
    guard let newView = visitableViews.last else {
      return
    }
    if (isViewModal) {
      newView.attachDelegateAndVisit(newView.controller)
    }
  }
    
  func configurationEquals(webViewConfiguration: WKWebViewConfiguration) -> Bool {
    // WKWebViewConfiguration doesn't conform to the Equatable protocol,
    // therefore, we need to manually compare the properties.
    return self.webViewConfiguration.applicationNameForUserAgent != webViewConfiguration.applicationNameForUserAgent
  }
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    for view in visitableViews {
      view.handleMessage(message: message)
    }
  }
  
}
