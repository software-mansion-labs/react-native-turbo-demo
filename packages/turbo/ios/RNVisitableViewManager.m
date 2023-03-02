//
//  RNTTurboWebviewManager.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 22/06/2022.
//

#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNVisitableViewManager, NSObject)

  RCT_EXPORT_VIEW_PROPERTY(url, NSString)
  RCT_EXPORT_VIEW_PROPERTY(sessionHandle, NSString)
  RCT_EXPORT_VIEW_PROPERTY(onVisitProposal, RCTDirectEventBlock)
  RCT_EXPORT_VIEW_PROPERTY(onLoad, RCTDirectEventBlock)
  RCT_EXPORT_VIEW_PROPERTY(onVisitError, RCTDirectEventBlock)

@end

