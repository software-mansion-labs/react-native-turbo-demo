//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo
import UIKit
import WebKit

class RNSession: NSObject {
  
  @objc var onMessage: RCTDirectEventBlock?
  private var registeredVisitableViews: [SessionSubscriber] = []
  
  public lazy var turboSession: Session = {
    let configuration = WKWebViewConfiguration()
    configuration.userContentController.add(self, name: "nativeApp")
    return Session(webViewConfiguration: configuration)
  }()
  
  func registerVisitableView(newView: SessionSubscriber) {
    if (!registeredVisitableViews.contains {
      $0.id == newView.id
    }) {
      registeredVisitableViews.append(newView)
    }
    newView.attachDelegateAndVisit(newView.controller!)
  }
  
  func removeVisitableView(view: SessionSubscriber) {
    // New view is not registered when presentation is modal
    let isViewModal = registeredVisitableViews.last?.id == view.id
    let viewIdx = registeredVisitableViews.lastIndex(where: {
      view.id == $0.id
    })
    registeredVisitableViews.remove(at: viewIdx!)
    guard let newView = registeredVisitableViews.last else {
      return
    }
    if (isViewModal) {
      newView.attachDelegateAndVisit(newView.controller!)
    }
  }
  
}

extension RNSession: WKScriptMessageHandler {
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    onMessage?(["message": message.body])
  }
  
}

