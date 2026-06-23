import { useEffect, useState } from "react";

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface UseGeolocationState {
  loading: boolean;
  coords: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
  timestamp: number | null;
}

export interface UseGeolocationOptions extends PositionOptions {
  /**
   * When `true`, continuously watch the position via `watchPosition`.
   * Otherwise a single `getCurrentPosition` read is performed. Defaults to
   * `false`.
   */
  watch?: boolean;
}

/**
 * Reads the user's geolocation via `navigator.geolocation`.
 *
 * SSR-safe: starts in a loading state and bails (with an error) when the API is
 * unavailable. When `watch` is set, subscribes to position updates and clears
 * the watch on unmount; otherwise performs a single read.
 *
 * Returns `{ loading, coords, error, timestamp }`.
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationState {
  const { watch = false, enableHighAccuracy, maximumAge, timeout } = options;

  const [state, setState] = useState<UseGeolocationState>({
    loading: true,
    coords: null,
    error: null,
    timestamp: null,
  });

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("geolocation" in navigator) ||
      !navigator.geolocation
    ) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    let active = true;

    const onSuccess = (position: GeolocationPosition) => {
      if (!active) return;
      const c = position.coords;
      setState({
        loading: false,
        error: null,
        timestamp: position.timestamp,
        coords: {
          latitude: c.latitude,
          longitude: c.longitude,
          accuracy: c.accuracy,
          altitude: c.altitude,
          altitudeAccuracy: c.altitudeAccuracy,
          heading: c.heading,
          speed: c.speed,
        },
      });
    };

    const onError = (error: GeolocationPositionError) => {
      if (!active) return;
      setState((prev) => ({ ...prev, loading: false, error }));
    };

    const positionOptions: PositionOptions = {
      enableHighAccuracy,
      maximumAge,
      timeout,
    };

    setState((prev) => ({ ...prev, loading: true }));

    let watchId: number | null = null;
    if (watch) {
      watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        positionOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        positionOptions
      );
    }

    return () => {
      active = false;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watch, enableHighAccuracy, maximumAge, timeout]);

  return state;
}
