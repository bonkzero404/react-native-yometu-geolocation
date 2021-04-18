import Foundation
import CoreLocation

enum LocationError: Int {
	case PERMISSION_DENIED = 1
	case POSITION_UNAVAILABLE
	case TIMEOUT
}

enum PermitStatus: String {
	case disabled, granted, denied, restricted
}

@objc(YometuGeolocation)
class YometuGeolocation: RCTEventEmitter, CLLocationManagerDelegate {
  var locationManager: CLLocationManager = CLLocationManager()
  var hasListeners: Bool = false
  var observing: Bool = false
  var lastLocation: [String: Any] = [:]
  var timeoutTimer: Timer? = nil
  var resolvePermitStatus: RCTPromiseResolveBlock? = nil
  var successCallback: RCTResponseSenderBlock? = nil
  var errorCallback: RCTResponseSenderBlock? = nil

  override var methodQueue: DispatchQueue {
		get {
			return DispatchQueue.main
		}
	}

	override static func requiresMainQueueSetup() -> Bool {
		return false
	}

	override func supportedEvents() -> [String]! {
    	return ["onReceiveYMData", "onErrorYMData"]
  	}

	override func startObserving() -> Void {
		hasListeners = true
	}

	override func stopObserving() -> Void {
		hasListeners = false
	}

  @discardableResult func configureLocationManager(options: NSDictionary, type: String) -> CLLocationManager? {
    if type == "watch" {
      let allowBackground = RCTConvert.bool(options["allowBackground"])
      let distanceFilter = options["distanceFilter"] as? Double ?? kCLDistanceFilterNone

      self.locationManager.delegate = self
      self.locationManager.desiredAccuracy = self.chooseAccuracy(options as! [String : Any])
      self.locationManager.distanceFilter = distanceFilter

      if CLLocationManager.locationServicesEnabled() {
        self.locationManager.startUpdatingLocation()
        self.locationManager.allowsBackgroundLocationUpdates = allowBackground;
        self.observing = true
      }

      return self.locationManager
    } else {
      let locManager = CLLocationManager()
      let distanceFilter = options["distanceFilter"] as? Double ?? kCLDistanceFilterNone

      locManager.delegate = self
      locManager.desiredAccuracy = self.chooseAccuracy(options as! [String : Any])
      locManager.distanceFilter = distanceFilter

      if CLLocationManager.locationServicesEnabled() {
        locManager.startUpdatingLocation()
      }

      return locManager
    }
  }

  @objc func requestAuthorization() -> Void {
    self.locationManager.requestWhenInUseAuthorization()
  }

  @objc func getPermissionStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    if !CLLocationManager.locationServicesEnabled() {
      resolve(PermitStatus.disabled.rawValue)
      return
    }

    switch CLLocationManager.authorizationStatus() {
      case .authorizedWhenInUse, .authorizedAlways:
        resolve(PermitStatus.granted.rawValue)
        return
      case .denied:
        resolve(PermitStatus.denied.rawValue)
        return
      case .restricted:
        resolve(PermitStatus.restricted.rawValue)
        return
      default:
        break
    }

    resolvePermitStatus = resolve
  }

  @objc func startWatchLocation(_ options: NSDictionary) -> Void {
    DispatchQueue.main.async {
      self.configureLocationManager(options: options, type: "watch")
    }
  }

  @objc func getLocation(_ options: NSDictionary, successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) -> Void {
    DispatchQueue.main.async {
      let cacheAge = options["cacheAge"] as? Double ?? Double.infinity
      let timeout = options["timeout"] as? Double ?? Double.infinity

      if !self.lastLocation.isEmpty {
        let elapsedTime = (Date().timeIntervalSince1970 * 1000) - (self.lastLocation["timestamp"] as! Double)

        if elapsedTime < cacheAge {
          successCallback([self.lastLocation])
          return
        }
      }

      let locManager = self.configureLocationManager(options: options, type: "single")

      self.successCallback = successCallback
      self.errorCallback = errorCallback

      if timeout > 0 && timeout != Double.infinity {
        self.timeoutTimer = Timer.scheduledTimer(
          timeInterval: timeout / 1000.0, // timeInterval is in seconds
          target: self,
          selector: #selector(self.callTimer),
          userInfo: [
            "errorCallback": errorCallback,
            "manager": locManager as Any
          ],
          repeats: false
        )
      }
    }
  }

  @objc func stopWatchLocation() -> Void {
    self.locationManager.stopUpdatingLocation()
    observing = false
  }

  @objc func callTimer(timer: Timer) -> Void {
    let data = timer.userInfo as! [String: Any]
    let errorCallback = data["errorCallback"] as! RCTResponseSenderBlock
    let manager = data["manager"] as! CLLocationManager

    manager.stopUpdatingLocation()
    manager.delegate = nil
    errorCallback([errorResponse(code: LocationError.TIMEOUT.rawValue)])
  }

  func chooseAccuracy(_ options: [String: Any]) -> Double {
    let accuracyDict = options["accuracy"] as? [String: String] ?? [:]
    let accuracyLevel = accuracyDict["ios"] ?? ""

    switch accuracyLevel {
      case "bestForNavigation":
        return kCLLocationAccuracyBestForNavigation
      case "best":
        return kCLLocationAccuracyBest
      case "nearestTenMeters":
        return kCLLocationAccuracyNearestTenMeters
      case "hundredMeters":
        return kCLLocationAccuracyHundredMeters
      case "kilometer":
        return kCLLocationAccuracyKilometer
      case "threeKilometers":
        return kCLLocationAccuracyThreeKilometers
      case "reduced":
        if #available(iOS 14.0, *) {
          return kCLLocationAccuracyReduced
        } else {
          return kCLLocationAccuracyThreeKilometers
        }
      case "highAccuracy":
        return kCLLocationAccuracyBest
      default:
        return kCLLocationAccuracyHundredMeters
    }
  }

  func errorResponse(code: Int, message: String = "") -> [String: Any] {
    var msg: String = message

    if msg.isEmpty {
      switch code {
        case LocationError.PERMISSION_DENIED.rawValue:
          msg = "Location permission denied"
        case LocationError.POSITION_UNAVAILABLE.rawValue:
          msg = "Unable to retrieve location due to a network failure"
        case LocationError.TIMEOUT.rawValue:
          msg = "Location request timed out"
        default:
          break
      }
    }

    return [
      "code": code,
      "message": msg
    ]
  }

  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    if status == .notDetermined || resolvePermitStatus == nil {
      return
    }

    switch status {
      case .authorizedWhenInUse, .authorizedAlways:
        resolvePermitStatus?(PermitStatus.granted.rawValue)
      case .denied:
        resolvePermitStatus?(PermitStatus.denied.rawValue)
      case .restricted:
        resolvePermitStatus?(PermitStatus.restricted.rawValue)
      default:
        break
    }

    resolvePermitStatus = nil
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    let userLocation:CLLocation = locations[0] as CLLocation

    let locationResult = [
      "latitude": NSNumber(value: userLocation.coordinate.latitude),
      "longitude": NSNumber(value: userLocation.coordinate.longitude),
      "altitude": NSNumber(value: userLocation.altitude),
      "speed": NSNumber(value: userLocation.speed),
      "accuracy": NSNumber(value: userLocation.horizontalAccuracy),
      "verticalAccuracy": NSNumber(value: userLocation.verticalAccuracy),
      "course": NSNumber(value: userLocation.course),
      "timestamp": NSNumber(value: userLocation.timestamp.timeIntervalSince1970 * 1000),
    ]

    if manager.isEqual(locationManager) && hasListeners && observing {
      sendEvent(withName: "onReceiveYMData", body: locationResult)
      return
    }

    guard successCallback != nil else { return }

    lastLocation = locationResult
    successCallback!([locationResult])

    // Cleanup
    manager.stopUpdatingLocation()
    manager.delegate = nil
    timeoutTimer?.invalidate()
    successCallback = nil
    errorCallback = nil
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    var errorData: [String: Any] = errorResponse(
      code: LocationError.POSITION_UNAVAILABLE.rawValue,
      message: "Unable to retrieve location"
    )

    if let clErr = error as? CLError {
      switch clErr.code {
        case CLError.denied:
          if !CLLocationManager.locationServicesEnabled() {
            errorData = errorResponse(
              code: LocationError.POSITION_UNAVAILABLE.rawValue,
              message: "Location service is turned off"
            )
          } else {
            errorData = errorResponse(code: LocationError.PERMISSION_DENIED.rawValue)
          }
        case CLError.network:
          errorData = errorResponse(code: LocationError.POSITION_UNAVAILABLE.rawValue)
        default:
          break
      }
    }

    if manager.isEqual(locationManager) && hasListeners && observing {
      sendEvent(withName: "onErrorYMData", body: errorData)
      return
    }

    guard errorCallback != nil else { return }

    errorCallback!([errorData])

    // Cleanup
    manager.stopUpdatingLocation()
    manager.delegate = nil
    successCallback = nil
    errorCallback = nil
  }
}
