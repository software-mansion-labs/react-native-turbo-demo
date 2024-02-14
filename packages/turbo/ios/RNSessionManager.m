//
//  RNSessionManager.m
//  RNTurbo
//
//  Created by Patryk Klatka on 05/01/2024.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSessionManager, NSObject)

  RCT_EXTERN_METHOD(getRegisteredSessionHandles: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
  RCT_EXTERN_METHOD(reloadSessionByName: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
  RCT_EXTERN_METHOD(clearSessionSnapshotCacheByName: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)

@end
