//
//  RNSessionSubscriber.swift
//  RNTurbo
//
//  Created by Bartłomiej Fryz on 23/01/2023.
//

import RNTurboiOS

protocol RNSessionSubscriber {
  
  var id: UUID { get set }
  var controller: RNVisitableViewController { get }
  func attachDelegateAndVisit()
  func handleMessage(message: WKScriptMessage)
  
}
