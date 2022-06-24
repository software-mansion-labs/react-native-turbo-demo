//
//  RNTTurboWebviewManager.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 22/06/2022.
//

#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNTTurboWebviewManager, NSObject)

  RCT_EXPORT_VIEW_PROPERTY(url, NSString)

@end
