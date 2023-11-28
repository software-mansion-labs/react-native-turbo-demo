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
  
  init(sessionHandle: NSString, webViewConfiguration: WKWebViewConfiguration){
    self.sessionHandle = sessionHandle
    self.webViewConfiguration = webViewConfiguration
  }

  public lazy var turboSession: Session = {
    self.webViewConfiguration.userContentController.add(self, name: "nativeApp")
    return Session(webViewConfiguration: self.webViewConfiguration)
  }()
  
  func registerVisitableView(newView: RNSessionSubscriber) {
    if (!visitableViews.contains {
      $0.id == newView.id
    }) {
      visitableViews.append(newView)
    }
    newView.attachDelegateAndVisit()
  }
  
  func removeVisitableView(view: RNSessionSubscriber) {
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
      newView.attachDelegateAndVisit()
    }
  }
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    for view in visitableViews {
      view.handleMessage(message: message)
    }
  }
  
}
