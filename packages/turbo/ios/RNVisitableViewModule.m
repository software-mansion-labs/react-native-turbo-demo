//
//  RNVisitableViewModule.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNVisitableViewModule, NSObject)

  RCT_EXTERN_METHOD(setConfiguration: (nonnull NSString) sessionHandle
                    applicationNameForUserAgent: (NSString) applicationNameForUserAgent
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)


  RCT_EXTERN_METHOD(registerSession: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)


  RCT_EXTERN_METHOD(removeSession: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)


  RCT_EXTERN_METHOD(injectJavaScript: (nonnull NSString) sessionHandle
                    code: (nonnull NSString) code
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)

@end
