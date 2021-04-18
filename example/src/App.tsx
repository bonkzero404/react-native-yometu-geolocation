import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import YometuGeolocation, { Location } from 'react-native-yometu-geolocation';

export default function App() {
  const [observing, setObserving] = React.useState(false);
  const [timer, setTimer] = React.useState<string | any>('00:00:00');
  const [
    singleLocationData,
    setSingleLocationData,
  ] = React.useState<Location>();
  const [locationData, setLocationData] = React.useState<Location>();
  const [paused, setPaused] = React.useState(false);

  let watchId: any = null;

  React.useEffect(() => {
    YometuGeolocation.requestAuthorization();
  }, []);

  const isPaused = () => {
    if (!paused) {
      setPaused(true);
      YometuGeolocation.pauseWatchLocation();
    } else {
      setPaused(false);
      YometuGeolocation.resumeWatchLocation();
    }
  };

  const startWatchLocation = async (): Promise<void> => {
    const locationAuthorization = await YometuGeolocation.getPermissionStatus();

    if (locationAuthorization.status) {
      watchId = YometuGeolocation.watchLocation(
        {
          accuracy: 'highAccuracy',
          allowBackground: true,
          distanceFilter: 0,
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
      Alert.alert(locationAuthorization.message);
    }
  };

  const getLocation = async (): Promise<void> => {
    const locationAuthorization = await YometuGeolocation.getPermissionStatus();

    if (locationAuthorization.status) {
      YometuGeolocation.getLocation(
        {
          accuracy: 'highAccuracy',
          cacheAge: 10000,
          distanceFilter: 0,
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
      Alert.alert(locationAuthorization.message);
    }
  };

  const stopWatchLocation = (): void => {
    setObserving(false);
    setPaused(false);
    YometuGeolocation.stopWatchLocation(watchId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerCount}>{timer}</Text>
      {!observing ? (
        <TouchableOpacity
          onPress={startWatchLocation}
          style={[styles.appButtonContainer, styles.appButtonColorBlezie]}
        >
          <Text style={styles.appButtonText}>Watch Position</Text>
        </TouchableOpacity>
      ) : (
        <>
          {paused ? (
            <TouchableOpacity
              onPress={isPaused}
              style={[styles.appButtonContainer, styles.appButtonColorOrange]}
            >
              <Text style={styles.appButtonText}>Resume Watching Position</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={isPaused}
              style={[styles.appButtonContainer, styles.appButtonColorPumpkins]}
            >
              <Text style={styles.appButtonText}>Pause Watching Position</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={stopWatchLocation}
            style={[styles.appButtonContainer, styles.appButtonColorAlizarin]}
          >
            <Text style={styles.appButtonText}>Stop Watching Position</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={getLocation}
        style={[styles.appButtonContainer, styles.appButtonColorWisteria]}
      >
        <Text style={styles.appButtonText}>Get Current Location</Text>
      </TouchableOpacity>

      <Text>Watch Position</Text>
      <Text>{JSON.stringify(locationData)}</Text>

      <Text>Get Current Position</Text>
      <Text>{JSON.stringify(singleLocationData)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  timerCount: {
    fontSize: 70,
    marginBottom: 10,
  },
  appButtonContainer: {
    elevation: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  appButtonColorBlezie: {
    backgroundColor: '#2980b9',
  },
  appButtonColorAlizarin: {
    backgroundColor: '#e74c3c',
  },
  appButtonColorWisteria: {
    backgroundColor: '#8e44ad',
  },
  appButtonColorPumpkins: {
    backgroundColor: '#d35400',
  },
  appButtonColorOrange: {
    backgroundColor: '#f39c12',
  },
  appButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
