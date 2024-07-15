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

const AppleMap: React.FC<MapsProps> = ({
  token,
  coordinates,
  coordinatesArray,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {mounted && (
        <Map
          token={token}
          cameraBoundary={
            coordinates
              ? {
                  centerLatitude: coordinates.lat,
                  centerLongitude: coordinates.lng,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
              : undefined
          }
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
