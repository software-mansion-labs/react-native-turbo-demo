//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import RNTurboiOS

public protocol RNVisitableViewControllerDelegate {
  
  func visitableWillAppear(visitable: Visitable)
  
  func visitableDidAppear(visitable: Visitable)

  func visitableDidRender(visitable: Visitable)
  
  func visitableDidDisappear(visitable: Visitable)
  
}

class RNVisitableViewController: VisitableViewController {
  
  public var delegate: RNVisitableViewControllerDelegate?
  
  // For native stack this function is called fon every screen change
  // as the view is replaced in the view hierarchy every time we navigate to a screen
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    delegate?.visitableWillAppear(visitable: self)
  }
    
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    delegate?.visitableDidAppear(visitable: self)
  }
  
  override func visitableDidRender() {
    super.visitableDidRender()
    delegate?.visitableDidRender(visitable: self)
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    delegate?.visitableDidDisappear(visitable: self)
  }
  
}
