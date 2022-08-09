//
//  SessionModule.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 09/08/2022.
//

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(SessionNativeModule, NSObject)

  RCT_EXTERN_METHOD(createSession: (RCTResponseSenderBlock *)successCallback)

@end
