//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import Turbo

public protocol RNVisitableViewControllerDelegate: UIAdaptivePresentationControllerDelegate {
  
  func visitableWillAppear(visitable: Visitable)
  
  func visitableDidRender(session: Session, visitable: Visitable)
  
}

class RNVisitableViewController: VisitableViewController {
  
  public var delegate: RNVisitableViewControllerDelegate?
  
  override func viewWillAppear(_ animated: Bool) {
    self.delegate?.visitableWillAppear(visitable: self)
  }
  
  func presentationControllerDidDismiss(_: UIPresentationController) {
    print("presentationControllerDidDismiss")
  }
  
  override func visitableDidRender() {
    self.delegate?.visitableDidRender(session: RNVisitableViewManager.session, visitable: self)
  }
  
}
