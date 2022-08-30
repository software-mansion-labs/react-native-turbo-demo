//
//  RNSessionModule.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 25/08/2022.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSessionModule, NSObject)

  RCT_EXTERN_METHOD(injectJavaScript: (nonnull NSNumber) sessionHandle
                    code: (nonnull NSString) code
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)

@end
