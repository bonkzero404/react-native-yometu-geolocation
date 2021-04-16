# react-native-yometu-geolocation

This module is only for the iOS platform (supports iOS 13+)

## Installation

```sh
npm install react-native-yometu-geolocation
```

## Usage

```js
import YometuGeolocation from "react-native-yometu-geolocation";
```

## Authorization

```js
YometuGeolocation.requestAuthorization();
```

## Watching Position
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
      setObserving(true);
      setLocationData(loc);
      console.log('Watch Current Location ===>', loc);
    },
    (getTimer) => {
      setTimer(getTimer);
      console.log('Watch Timer ====>', getTimer);
    },
    (err: any) => {
      setObserving(false);
      console.log('err watch location ===>', err);
    }
  );
} else {
  // Triger if authorization denied
  console.log(locationAuthorization.message);
}
```
## Stop Watching Position
```js
// ...

YometuGeolocation.stopWatchLocation(watchId);
```
## Get Current Position
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
      setSingleLocationData(loc);
      console.log('Current Location ===>', loc);
    },
    (err: any) => {
      setObserving(false);
      console.log('err single location ===>', err);
    }
  );
} else {
  console.log(locationAuthorization);
}
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
