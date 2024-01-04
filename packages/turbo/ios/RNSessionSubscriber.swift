//
//  RNSessionSubscriber.swift
//  RNTurbo
//
//  Created by Bartłomiej Fryz on 23/01/2023.
//

import ReactNativeHotwiredTurboiOS

protocol RNSessionSubscriber {
  
  var id: UUID { get set }
  var controller: RNVisitableViewController { get }
  func handleMessage(message: WKScriptMessage)
  func didProposeVisit(proposal: VisitProposal)
  func didFailRequestForVisitable(visitable: Visitable, error: Error)
  func didOpenExternalUrl(url: URL)
  func handleAlert(message: String, completionHandler: @escaping () -> Void)
  func handleConfirm(message: String, completionHandler: @escaping (Bool) -> Void)
}
