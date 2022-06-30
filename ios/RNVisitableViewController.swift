//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import Turbo

class RNVisitableViewController: VisitableViewController {
  
  public var delegate: SessionDelegate?
  
  override func viewWillAppear(_ animated: Bool) {
    print("View will appear for URL", self.visitableURL.absoluteURL)
    RNVisitableViewManager.session.delegate = delegate
    RNVisitableViewManager.session.visit(self)
  }

//  override func viewDidLoad() {
//    print("View did appear for URL", self.visitableURL.absoluteURL)
//    RNVisitableViewManager.session.delegate = self
//    super.viewDidLoad()
//  }
  
}
