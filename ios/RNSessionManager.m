//
//  SessionModule.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 09/08/2022.
//

#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSessionManager, NSObject)

  RCT_EXPORT_VIEW_PROPERTY(onMessage, RCTDirectEventBlock)

@end
