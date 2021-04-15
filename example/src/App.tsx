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

  let watchId: any = null;

  React.useEffect(() => {
    YometuGeolocation.requestAuthorization();
  }, []);

  const startWatchLocation = async (): Promise<void> => {
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
      Alert.alert(locationAuthorization.message);
    }
  };

  const stopWatchLocation = (): void => {
    setObserving(false);
    YometuGeolocation.stopWatchLocation(watchId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerCount}>{timer}</Text>
      {!observing ? (
        <TouchableOpacity
          onPress={startWatchLocation}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>Watch Position</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={stopWatchLocation}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>Stop Watching Position</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={getLocation} style={styles.appButtonContainer}>
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
    backgroundColor: '#009688',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  appButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
