//
//  TurboManager.swift
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 24/06/2022.
//

import Turbo

@objc(TurboManager)
class TurboManager: RCTEventEmitter {
    
    private lazy var navigationController = UINavigationController()
    
    private lazy var session: Session = {
        let session = Session(); session.delegate = self; return session;
    }()
    
    @objc(startSingleScreenApp:withOptions:)
    func startSingleScreenApp(_ visitable: Dictionary<AnyHashable, Any>, options: Dictionary<AnyHashable, Any>) {
        addToRootViewController(navigationController); visit(visitable);
    }
    
    @objc(visit:)
    func visit(_ visitable: Dictionary<AnyHashable, Any>) {
        let viewController = VisitableViewController(url: RCTConvert.nsurl(visitable["url"]))
        navigationController.pushViewController(viewController, animated: true)
        session.visit(viewController)
    }
    
    private func addToRootViewController(_ viewController: UIViewController) {
        rootViewController.dismiss(animated: false)
        rootViewController.addChild(viewController)
        rootViewController.view.addSubview(viewController.view)
    }
    
    private var rootViewController: UIViewController {
        return application.keyWindow!.rootViewController!
    }
    
    private var application: UIApplication {
        return UIApplication.shared
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true;
    }
    
    override var methodQueue: DispatchQueue {
        return DispatchQueue.main
    }
    
    override func supportedEvents() -> [String]! {
        return ["turboVisit", "turboError"]
    }
    
}

extension TurboManager: SessionDelegate {
    
    func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
        sendEvent(withName: "turboVisit", body: proposal.toDictionary())
    }
    
    func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
        if let turboError = error as? TurboError {
            sendEvent(withName: "turboError", body: turboError.toDictionary())
        } else {
            sendEvent(withName: "turboError", body: error.toDictionary())
        }
    }
    
}
