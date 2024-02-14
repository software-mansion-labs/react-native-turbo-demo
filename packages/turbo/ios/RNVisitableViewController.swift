//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation
import ReactNativeHotwiredTurboiOS

public protocol RNVisitableViewControllerDelegate {
  
  func visitableWillAppear(visitable: Visitable)
  
  func visitableDidAppear(visitable: Visitable)
  
  func visitableDidRender(visitable: Visitable)
  
  func visitableDidDisappear(visitable: Visitable)
  
  func showVisitableActivityIndicator()
  
  func hideVisitableActivityIndicator()
  
}

class RNVisitableViewController: UIViewController, Visitable {
  public var visitableViewControllerDelegate: RNVisitableViewControllerDelegate?

  open weak var visitableDelegate: VisitableDelegate?
  open var visitableURL: URL!

  private var reactViewController: UIViewController? = nil

  public convenience init(url: URL) {
    self.init()
    self.visitableURL = url
  }
    
  public convenience init(reactViewController: UIViewController?, visitableViewControllerDelegate: RNVisitableViewControllerDelegate?) {
    self.init()
    self.reactViewController = reactViewController
    self.visitableViewControllerDelegate = visitableViewControllerDelegate
  }

  // MARK: View Lifecycle

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor.white
    installVisitableView()
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    visitableViewControllerDelegate?.visitableWillAppear(visitable: self)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    visitableViewControllerDelegate?.visitableDidAppear(visitable: self)
  }
    
  override func viewDidDisappear(_ animated: Bool) {
    visitableViewControllerDelegate?.visitableDidDisappear(visitable: self)
  }

  // MARK: Visitable

  func visitableDidRender() {
    title = visitableView.webView?.title
    visitableViewControllerDelegate?.visitableDidRender(visitable: self)
  }
    
  func showVisitableActivityIndicator() {
    visitableViewControllerDelegate?.showVisitableActivityIndicator()
  }
    
  func hideVisitableActivityIndicator() {
    visitableViewControllerDelegate?.hideVisitableActivityIndicator()
  }
    
  // MARK: Visitable View

  open private(set) lazy var visitableView: VisitableView! = {
    let view = VisitableView(frame: CGRect.zero)
    view.translatesAutoresizingMaskIntoConstraints = false
    return view
  }()

  private func installVisitableView() {
    view.addSubview(visitableView)
    NSLayoutConstraint.activate([
       visitableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
       visitableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
       visitableView.topAnchor.constraint(equalTo: view.topAnchor),
       visitableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
    ])
  }
    
  public var visitableViewController: UIViewController {
    self.reactViewController?.parent ?? self
  }
  
}
