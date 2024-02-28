//
//  RNVisitableViewController.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 27/06/2022.
//

import Foundation

public protocol RNVisitableViewControllerDelegate {
  
  func visitableWillAppear(visitable: Visitable)
  
  func visitableDidAppear(visitable: Visitable)
  
  func visitableDidRender(visitable: Visitable)
  
  func visitableDidDisappear(visitable: Visitable)
  
  func showVisitableActivityIndicator()
  
  func hideVisitableActivityIndicator()
  
}

class RNVisitableViewController: UIViewController, Visitable {
  public var delegate: RNVisitableViewControllerDelegate?

  open weak var visitableDelegate: VisitableDelegate?
  open var visitableURL: URL!

  private var reactViewController: UIViewController? = nil
    
  public convenience init(reactViewController: UIViewController?, delegate: RNVisitableViewControllerDelegate?) {
    self.init()
    self.reactViewController = reactViewController
    self.delegate = delegate
  }

  // MARK: View Lifecycle

  override func viewDidLoad() {
    super.viewDidLoad()
    installVisitableView()
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    visitableDelegate?.visitableViewWillAppear(self)
    delegate?.visitableWillAppear(visitable: self)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    visitableDelegate?.visitableViewDidAppear(self)
    delegate?.visitableDidAppear(visitable: self)
  }
    
  override func viewDidDisappear(_ animated: Bool) {
    delegate?.visitableDidDisappear(visitable: self)
  }

  // MARK: Visitable

  func visitableDidRender() {
    delegate?.visitableDidRender(visitable: self)
  }
    
  func showVisitableActivityIndicator() {
    delegate?.showVisitableActivityIndicator()
  }
    
  func hideVisitableActivityIndicator() {
    delegate?.hideVisitableActivityIndicator()
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
