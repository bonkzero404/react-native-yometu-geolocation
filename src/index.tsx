/* eslint-disable radix */
import { NativeEventEmitter, NativeModules } from 'react-native';

let subscriptions: any[] = [];
let timerInterval: any = null;

export type Location = {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
  verticalAccuracy?: number;
  course?: number;
  timestamp?: number;
};
export interface CallbackLocation {
  (location: Location): void;
}
export interface CallbackTimer {
  (location: string | null): void;
}

type OptionsGeolocation = {
  allowBackground: boolean;
  accuracy: string;
  distanceFilter?: number;
  withTimer?: boolean;
};

type OptionsGetGeolocation = {
  cacheAge?: number;
  accuracy?: string;
  distanceFilter?: number;
  timeout?: number;
};

type YometuGeolocationType = {
  requestAuthorization(): void;
  getPermissionStatus(): Promise<{ status: boolean; message: string }>;
  watchLocation(
    options: OptionsGeolocation,
    cbSuccessLocation?: CallbackLocation,
    cbTimer?: CallbackTimer,
    cbError?: any
  ): void;
  getLocation(
    options: OptionsGetGeolocation,
    cbSuccessLocation?: CallbackLocation,
    cbError?: any
  ): void;
  stopWatchLocation(watchId: any): void;
  timeFormat(d: Date): string;
};

const { YometuGeolocation } = NativeModules;

const YometuEventEmitter = new NativeEventEmitter(YometuGeolocation);

const YometuGeolocationService = {
  requestAuthorization: () => YometuGeolocation.requestAuthorization(),

  getPermissionStatus: async () => {
    const status = await YometuGeolocation.getPermissionStatus();

    if (status === 'granted') {
      return {
        status: true,
        message: 'Access granted',
      };
    }

    if (status === 'denied') {
      return {
        status: false,
        message: 'Location permission denied',
      };
    }

    if (status === 'disabled') {
      return {
        status: false,
        message:
          'Turn on Location Services to allow permission to determine your location.',
      };
    }

    return {
      status: false,
      message: 'Unknown Access Permission',
    };
  },

  watchLocation: (
    options: OptionsGeolocation,
    cbSuccessLocation: CallbackLocation,
    cbTimer: CallbackTimer,
    cbError: any = null
  ) => {
    YometuGeolocation.stopWatchLocation();
    YometuGeolocation.startWatchLocation(options);

    if (options.withTimer) {
      YometuGeolocationService.startTimer(cbTimer);
    }

    const watchID = subscriptions.length;

    subscriptions.push([
      YometuEventEmitter.addListener('onReceiveYMData', cbSuccessLocation),
      cbError ? YometuEventEmitter.addListener('onErrorYMData', cbError) : null,
    ]);

    return watchID;
  },

  getLocation: (
    options: OptionsGeolocation,
    cbSuccessLocation: CallbackLocation,
    error = () => {}
  ) => {
    if (!cbSuccessLocation) {
      console.error('Must provide a success callback');
    }
    YometuGeolocation.getLocation(options, cbSuccessLocation, error);
  },

  stopWatchLocation: (watchID: any) => {
    YometuGeolocationService.stopTimer();
    YometuGeolocation.stopWatchLocation();

    const sub = subscriptions[watchID];

    if (!sub) {
      return;
    }

    sub[0].remove();

    const sub1 = sub[1];

    if (sub1) {
      sub1.remove();
    }

    subscriptions[watchID] = undefined;

    let noWatchers = true;

    for (let ii = 0; ii < subscriptions.length; ii += 1) {
      if (subscriptions[ii]) {
        noWatchers = false;
      }
    }

    if (noWatchers) {
      YometuGeolocationService.stopObserving();
    }
  },

  stopObserving: () => {
    YometuGeolocation.stopObserving();

    for (let ii = 0; ii < subscriptions.length; ii += 1) {
      const sub = subscriptions[ii];
      if (sub) {
        console.log('Called stopObserving with existing subscriptions.');
        sub[0].remove();

        const sub1 = sub[1];

        if (sub1) {
          sub1.remove();
        }
      }
    }

    subscriptions = [];
  },

  timeFormat: (time: Date) => {
    return (
      ('0' + time.getHours()).slice(-2) +
      ':' +
      ('0' + time.getMinutes()).slice(-2) +
      ':' +
      ('0' + time.getSeconds()).slice(-2)
    );
  },

  startTimer: (cbTimer: any) => {
    let timer = '00:00:00';

    const splitTimer = timer.split(':');
    var countFrom = new Date(
      0,
      0,
      0,
      parseInt(splitTimer[0]),
      parseInt(splitTimer[1]),
      parseInt(splitTimer[2])
    );

    let i = 0;
    timerInterval = setInterval(() => {
      i++;
      const timestamp = new Date(countFrom.getTime() + i * 1000);
      const mytime = YometuGeolocationService.timeFormat(new Date(timestamp));

      cbTimer(mytime);
    }, 1000);
  },

  stopTimer: () => {
    clearInterval(timerInterval);
  },
};

export default YometuGeolocationService as YometuGeolocationType;
