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
  
  func visitableDidRender(visitable: Visitable)
  
}

class RNVisitableViewController: VisitableViewController {
  
  public var delegate: RNVisitableViewControllerDelegate?
  
  // For native stack this function is called fon every screen change
  // as the view is replacedin the view hierarchy every time we navigate to a screen
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    self.delegate?.visitableWillAppear(visitable: self)
  }
  
  override func visitableDidRender() {
    self.delegate?.visitableDidRender(visitable: self)
  }
  
}
