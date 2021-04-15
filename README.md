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
## Watching Position
```js
// ...

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
```
## Stop Watching Position
```js
// ...

YometuGeolocation.stopWatchLocation(watchId);
```
## Get Current Position
```js
// ...

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
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
