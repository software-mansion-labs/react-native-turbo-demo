//
//  SessionSubscriber.swift
//  RNTurbo
//
//  Created by Bartłomiej Fryz on 23/01/2023.
//

import RNTurboiOS

protocol SessionSubscriber {
  
  var id: UUID { get set }
  var controller: RNVisitableViewController? { get }
  func attachDelegateAndVisit(_ visitable: Visitable)
  func handleMessage(message: WKScriptMessage)
  
}
