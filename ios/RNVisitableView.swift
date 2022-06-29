//
//  RNTTurboWebview.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo
import UIKit

class RNVisitableView: UIView {
  
  @objc var url: NSString = ""
  
  private var controller: RNVisitableViewController?
  
  func addViewControllerToHierarchy() {
    self.reactViewController().addChild(self.controller!)
    self.controller?.didMove(toParent: self.reactViewController())
  }
  
  override func didMoveToWindow() {
    if (self.controller == nil) {
      let url = URL(string: String(url))!
      print("passed url to native: ", url)
      self.controller = RNVisitableViewController(url: url)

      self.addSubview((controller?.view)!)
      RNVisitableViewManager.session.visit(controller!)
    }
  }
  
}
