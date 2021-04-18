# What is react-native-yometu-geolocation

react-native-yometu-geolocation is a library that is used to build applications such as fitness, cycling, and other sports that require location updates and timers.

## Installation

```sh
npm install react-native-yometu-geolocation

// or

yarn add react-native-yometu-geolocation
```

## Usage

```js
import YometuGeolocation from "react-native-yometu-geolocation";
```

## Get geolocation authorization
This method must be initialized at the beginning (before accessing the location)
```js
YometuGeolocation.requestAuthorization();
```

## Get Realtime Position
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
## Stop Realtime Position
```js
// ...

YometuGeolocation.stopWatchLocation(watchId);
```

## Paused Realtime Position
```js
// ...

YometuGeolocation.pauseWatchLocation();
```

## Resume Paused Realtime Position
```js
// ...

YometuGeolocation.resumeWatchLocation();
```
## Get Current Position

This module is used to get the location only occasionally when getting a certain action.

```js
// ...

const locationAuthorization = await YometuGeolocation.getPermissionStatus();

if (locationAuthorization.status) {
  YometuGeolocation.getLocation(
    {
      accuracy: 'highAccuracy',
      cacheAge: 10000,
      distanceFilter: 1,
      timeout: 15000,
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

## Accuracy Options
| Accuracy Value           | Description                                                                                   |
|-------------------|-----------------------------------------------------------------------------------------------|
| bestForNavigation | The highest possible accuracy that uses additional sensor data to facilitate navigation apps. |
| nearestTenMeters  | Accurate to within ten meters of the desired target.                                          |
| hundredMeters     | Accurate to within one hundred meters.                                                        |
| kilometer         | Accurate to the nearest kilometer.                                                            |
| threeKilometers   | Accurate to the nearest three kilometers.                                                     |
| reduced           | The level of accuracy used when an app isn’t authorized for full accuracy location data.      |
| highAccuracy      | The best level of accuracy available.                                                         |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
