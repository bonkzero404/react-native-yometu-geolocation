#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(YometuGeolocation, RCTEventEmitter)
RCT_EXTERN_METHOD(requestAuthorization)
RCT_EXTERN_METHOD(getPermissionStatus: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startWatchLocation:(NSDictionary *)options)
RCT_EXTERN_METHOD(stopWatchLocation)
RCT_EXTERN_METHOD(getLocation:(NSDictionary *)options successCallback:(RCTResponseSenderBlock)successCallback errorCallback:(RCTResponseSenderBlock)errorCallback)

@end
