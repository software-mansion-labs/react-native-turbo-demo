//
//  RNStradaWKUserContentController.swift
//  RNTurbo
//
//  Created by Patryk Klatka on 08/11/2023.
//

import Foundation

class RNStradaWKUserContentController: NSObject, WKScriptMessageHandler {

  private var eventEmitter: RCTEventEmitter? = nil

  init(eventEmitter: RCTEventEmitter? = nil) {
      self.eventEmitter = eventEmitter
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
      guard let messageData = message.body as? [String: Any] else {
          return
      }
      guard let componentName = messageData["component"] as? String else {
          return
      }
      eventEmitter?.sendEvent(withName: componentName, body: message.body)
  }

}
