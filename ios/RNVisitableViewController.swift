//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import Turbo

class RNVisitableViewController: UIViewController, Visitable {
  
  var visitableDelegate: VisitableDelegate?
  
  var visitableView: VisitableView!
  
  var visitableURL: URL!
  
  func visitableDidRender() {
    <#code#>
  }
  
}
