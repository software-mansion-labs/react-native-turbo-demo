//
//  RNTTurboWebviewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Foundation
import Turbo

class RNTTurboWebviewController: Visitable {
  
  private static var webviewController = RNTTurboWebviewController()
  
  private init(url: URL) {
    self.visitableURL = url
  }
  
  static var shared() - {
      return webviewController
  }
  
  open weak var visitableDelegate: VisitableDelegate?
  
  var visitableViewController: UIViewController
  
  var visitableView: VisitableView!
  
  var visitableURL: URL!
  
  func visitableDidRender() {
    <#code#>
  }
  
  
  
}
