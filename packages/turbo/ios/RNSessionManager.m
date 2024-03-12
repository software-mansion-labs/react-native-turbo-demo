//
//  RNSessionManager.m
//  RNTurbo
//
//  Created by Patryk Klatka on 05/01/2024.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSessionManager, NSObject)

  RCT_EXTERN_METHOD(getSessionHandles: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
  RCT_EXTERN_METHOD(reloadSession: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
  RCT_EXTERN_METHOD(refreshSession: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
  RCT_EXTERN_METHOD(clearSessionSnapshotCache: (nonnull NSString) sessionHandle
                    resolver: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)

@end
