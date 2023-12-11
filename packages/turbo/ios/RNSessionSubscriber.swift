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
  func handleMessage(message: WKScriptMessage)
  func didProposeVisit(proposal: VisitProposal)
  func didFailRequestForVisitable(visitable: Visitable, error: Error)
  func didOpenExternalUrl(url: URL)
  func handleAlert(message: String)
  func handleConfirm(message: String, completionHandler: @escaping (Bool) -> Void)
}
