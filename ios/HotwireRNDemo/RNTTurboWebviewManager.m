//
//  RNTTurboWebviewManager.m
//  HotwireRNDemo
//
//  Created by Bartłomiej Fryz on 22/06/2022.
//

#import <React/RCTViewManager.h>

@interface RNTTurboWebviewManager : RCTViewManager
@end

@implementation RNTTurboWebviewManager

  RCT_EXPORT_MODULE(RNTTurboWebview)

  - (UIView *) view {
    return [[WKWebView alloc] init];
    
  }

RCT_CUSTOM_VIEW_PROPERTY(url, NSString, WKWebView) {
  NSString *passedUrl = [RCTConvert NSString:json];
  
//    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:[RCTConvert NSString:json]]];

    NSLog(@"Requested new url: %@", passedUrl);

    [view loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:passedUrl]]];
  }

@end
