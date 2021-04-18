#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(YometuGeolocation, RCTEventEmitter)

RCT_EXTERN_METHOD(requestAuthorization)
RCT_EXTERN_METHOD(getPermissionStatus: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getLocation:(NSDictionary *)options successCallback:(RCTResponseSenderBlock)successCallback errorCallback:(RCTResponseSenderBlock)errorCallback)

_RCT_EXTERN_REMAP_METHOD(startObserving, startWatchLocation:(NSDictionary *)options, false)
_RCT_EXTERN_REMAP_METHOD(stopObserving, stopWatchLocation, false)

@end
