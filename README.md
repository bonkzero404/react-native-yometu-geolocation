# What is react-native-yometu-geolocation

react-native-yometu-geolocation is a library that used to build applications such as fitness, cycling, and other sports that require location updates and timers.

> NOTE: Currently only available for iOS

##

## Installation

```sh
npm install react-native-yometu-geolocation

// or

yarn add react-native-yometu-geolocation
```

<details open>
<summary><strong>iOS Installation Instructions</strong></summary>

### 1. Linking
YFor RN 0.60 or higher, no manual linking is needed. After installing the package, just run pod install from inside ios directory. It'll automatically pickup the package and install it.

### 2. Info.plist usage descriptions
Finally, you then need to make sure you have the correct usage discriptions inside your `Info.plist` file. The message will show in the Alert box when your app requests permissions and lets the user know why you are asking for that permissions. They are also part of the App Store review process.

If you are only requesting "when in use" (foreground) location access you just need to make sure you have the `NSLocationWhenInUseUsageDescription` item in your Plist.

If you are requesting "always" (background) permission you will *also* need to add `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationAlwaysUsageDescription` into your PList file.

The easiest way to add these is to find your `Info.plist` in Xcode, right click on it, and then choose "edit as source code". You can then enter the items you need into the file:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This is the plist item for NSLocationWhenInUseUsageDescription</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This is the plist item for NSLocationAlwaysAndWhenInUseUsageDescription</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This is the plist item for NSLocationAlwaysUsageDescription</string>
```

### 3. Background mode setup (optional)
For background location to work, a few things need to be configured:

1. In the Xcode project, go to Capabilities, switch on "Background Modes" and check "Location updates".
![Screenshot](internals/capabilities-background.png)

2. Set `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationAlwaysUsageDescription` in your `Info.plist` file.

</details>

## Usage

```js
import YometuGeolocation from "react-native-yometu-geolocation";
```

### Get geolocation authorization
This method must be initialized at the beginning (before accessing the location)
```js
YometuGeolocation.requestAuthorization();
```

### Get Realtime Position
In this method you have 2 successful callbacks where one is for realtime location and the other is for getting the timer
```js
// ...

const locationAuthorization = await YometuGeolocation.getPermissionStatus();

if (locationAuthorization.status) {
  watchId = YometuGeolocation.watchLocation(
    {
      accuracy: 'highAccuracy',
      allowBackground: true,
      distanceFilter: 1,
      withTimer: true,
    },
    (loc) => {
      console.log('Watch Current Location ===>', loc);
    },
    (getTimer) => {
      console.log('Watch Timer ====>', getTimer);
    },
    (err: any) => {
      console.log('err watch location ===>', err);
    }
  );
} else {
  // Triger if authorization denied
  console.log(locationAuthorization.message);
}
```
### Stop Realtime Position
```js
// ...

YometuGeolocation.stopWatchLocation(watchId);
```

### Paused Realtime Position
```js
// ...

YometuGeolocation.pauseWatchLocation();
```

### Resume Paused Realtime Position
```js
// ...

YometuGeolocation.resumeWatchLocation();
```
### Get Current Position

This method is used to get the location only occasionally when getting a certain action.

```js
// ...

const locationAuthorization = await YometuGeolocation.getPermissionStatus();

if (locationAuthorization.status) {
  YometuGeolocation.getLocation(
    {
      accuracy: 'highAccuracy',
      cacheAge: 10000,
      distanceFilter: 1,
      timeout: 20000,
    },
    (loc) => {
      console.log('Current Location ===>', loc);
    },
    (err: any) => {
      console.log('err single location ===>', err);
    }
  );
} else {
  console.log(locationAuthorization);
}
```

### Accuracy Options
| Accuracy Value           | Description                                                                                   |
|-------------------|-----------------------------------------------------------------------------------------------|
| bestForNavigation | The highest possible accuracy that uses additional sensor data to facilitate navigation apps. |
| nearestTenMeters  | Accurate to within ten meters of the desired target.                                          |
| hundredMeters     | Accurate to within one hundred meters.                                                        |
| kilometer         | Accurate to the nearest kilometer.                                                            |
| threeKilometers   | Accurate to the nearest three kilometers.                                                     |
| reduced           | The level of accuracy used when an app isn’t authorized for full accuracy location data.      |
| highAccuracy      | The best level of accuracy available.                                                         |

## Troubleshooting
<details>
<summary><strong>Error: Undefined symbol: __swift_FORCE_LOAD_$_swiftWebkit</strong></summary>
if you have problems when building the project as below:

![Screenshot](internals/err-swift.png)

You must enable swift support in your project. Since the iOS implementation is written in swift, you need to add swift support in your project. It can be done just by adding an empty swift file and a bridging header in your project folder. You have to do it from xcode, otherwise swift compiler flag won't be updated.

### 1. Create empty swift file in your project with XCode

![Screenshot](internals/new-file.png)

### 2. Click next button, then save your empty file

![Screenshot](internals/save-file.png)

### 3. XCode will ask you "Create Bridging Header".

![Screenshot](internals/bridging.png)

You can choose "Create Bridging Header", after that rebuild your code, and everything works normally.

</details>

<details>
<summary><strong>Build Error: 'event2/event-config.h' file not found</strong></summary>

This issue is caused by an update to the "Flipper-Folly" pod-spec. If you'd like to keep Flipper enabled, you can override the version in your Podfile:

Open your Podfile in your iOS project and change these lines of codes

```ruby
# use_flipper! --> Change this to
use_flipper!({ 'Flipper-Folly' => '2.3.0' }) # Update this part
post_install do |installer|
  flipper_post_install(installer)
end
```

You will need to update your pods by running
```sh
pod update
```


</details>

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
