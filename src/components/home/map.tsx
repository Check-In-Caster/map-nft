"use client";

import { Map, Marker } from "mapkit-react";
import { useEffect, useState } from "react";

interface MapsProps {
  token: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  coordinatesArray?: {
    lat: number;
    lng: number;
  }[];
}
function rad2degr(rad: number) {
  return (rad * 180) / Math.PI;
}
function degr2rad(degr: number) {
  return (degr * Math.PI) / 180;
}

function calcDistance(lat1: number, lat2: number, lng1: number, lng2: number) {
  lng1 = (lng1 * Math.PI) / 180;
  lng2 = (lng2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lng2 - lng1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers.
  let r = 6371;

  return c * r;
}

function getLatLngCenter(coordinates: { lat: number; lng: number }[]) {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (let i = 0; i < coordinates.length; i++) {
    let lat = degr2rad(coordinates[i].lat);
    let lng = degr2rad(coordinates[i].lng);
    // sum of cartesian coordinates
    sumX += Math.cos(lat) * Math.cos(lng);
    sumY += Math.cos(lat) * Math.sin(lng);
    sumZ += Math.sin(lat);
  }

  let avgX = sumX / coordinates.length;
  let avgY = sumY / coordinates.length;
  let avgZ = sumZ / coordinates.length;

  // convert average x, y, z coordinate to latitude and longtitude
  let lng = Math.atan2(avgY, avgX);
  let hyp = Math.sqrt(avgX * avgX + avgY * avgY);
  let lat = Math.atan2(avgZ, hyp);

  return { lat: rad2degr(lat), lng: rad2degr(lng) };
}

const AppleMap: React.FC<MapsProps> = ({
  token,
  coordinates,
  coordinatesArray,
}) => {
  const [mounted, setMounted] = useState(false);
  const [filteredCoordinatesArray, setFilteredCoordinatesArray] = useState<
    {
      lat: number;
      lng: number;
      name: string;
    }[]
  >([]);
  const [centerCoordinates, setCenterCoordinates] = useState({
    lat: 0,
    lng: 0,
  });
  const [applyRestriction, setApplyRestriction] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // removing duplicates and invalid coordinates
    const newCoordinatesArray = Array.from(
      new Set(
        (
          coordinatesArray?.filter((coordinates) => {
            if (
              (coordinates.lat || coordinates.lat === 0) &&
              (coordinates.lng || coordinates.lng === 0)
            )
              return true;
          }) as { lat: number; lng: number; name: string }[]
        ).map((coordinates) => JSON.stringify(coordinates))
      )
    ).map(
      (coordinates) =>
        JSON.parse(coordinates) as { lat: number; lng: number; name: string }
    );

    if (newCoordinatesArray.length > 0) {
      setFilteredCoordinatesArray(newCoordinatesArray);

      const centerCoordinates =
        newCoordinatesArray.length > 1
          ? getLatLngCenter(newCoordinatesArray)
          : newCoordinatesArray[0];

      let coordinatesCloseToCenter = newCoordinatesArray[0];
      let minDistance = calcDistance(
        centerCoordinates.lat,
        coordinatesCloseToCenter.lat,
        centerCoordinates.lng,
        coordinatesCloseToCenter.lng
      );

      for (let i = 1; i < newCoordinatesArray.length; i++) {
        const distance = calcDistance(
          centerCoordinates.lat,
          newCoordinatesArray[i].lat,
          centerCoordinates.lng,
          newCoordinatesArray[i].lng
        );

        if (distance < minDistance) {
          coordinatesCloseToCenter = newCoordinatesArray[i];
          minDistance = distance;
        }
      }

      setCenterCoordinates(coordinatesCloseToCenter);
      setApplyRestriction(true);
    }

    let timeout = setTimeout(() => {
      setApplyRestriction(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [coordinatesArray]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {mounted && (
        <Map
          token={token}
          cameraBoundary={{
            centerLatitude: centerCoordinates.lat,
            centerLongitude: centerCoordinates.lng,
            latitudeDelta: applyRestriction ? 0.001 : 365,
            longitudeDelta: applyRestriction ? 0.001 : 365,
          }}
          maxCameraDistance={applyRestriction ? 100000 : undefined}
        >
          {coordinates && (
            <Marker latitude={coordinates.lat} longitude={coordinates.lng} />
          )}
          {coordinatesArray
            ? coordinatesArray.map((coordinates) => (
                <Marker
                  key={`${JSON.stringify(coordinates)}`}
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                />
              ))
            : null}
        </Map>
      )}
    </div>
  );
};

export default AppleMap;
