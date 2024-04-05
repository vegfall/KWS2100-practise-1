import { FeedMessage, VehiclePosition } from "../../generated/gtfs-realtime";
import { useEffect, useMemo, useState } from "react";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";

interface LiveVehiclePosition {
  coordinate: number[];
  timestamp: number;
}

interface LiveVehicle {
  id: string;
  routeId: string;
  position: LiveVehiclePosition;
  history: LiveVehiclePosition[];
}

//FIX
function convertFromProtobuff(
  originalVehicle: VehiclePosition | undefined,
): LiveVehicle | undefined {
  if (!originalVehicle) return;
  const { position, trip, vehicle: protoVehicle } = originalVehicle;
  if (!position || !trip || !protoVehicle) return;
  const { id } = protoVehicle;
  const { longitude, latitude } = position;
  const { routeId } = trip;
  if (!routeId || !id) return;

  const vehiclePosition = {
    coordinate: [longitude, latitude],
    timestamp: 0,
  };

  return {
    id,
    routeId,
    position: vehiclePosition,
    history: [vehiclePosition],
  };
}

export function useVehicles() {
  const [vehicleTable, setVehicleTable] = useState<Record<string, LiveVehicle>>(
    {},
  );

  async function fetchVehiclePoistion() {
    const response = await fetch(
      "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
    );

    if (!response.ok) {
      throw `Error fetching ${response.url}: ${response.statusText}`;
    }

    const responseMessage = FeedMessage.decode(
      new Uint8Array(await response.arrayBuffer()),
    );

    const vehicles: LiveVehicle[] = [];

    for (const { vehicle } of responseMessage.entity) {
      const convertedVehicle = convertFromProtobuff(vehicle);

      if (convertedVehicle) vehicles.push(convertedVehicle);
    }

    setVehicleTable((old) => {
      const updated = { ...old };

      for (const updatedVehicle of vehicles) {
        const oldVehicle = updated[updatedVehicle.id];

        if (oldVehicle) {
          updated[updatedVehicle.id] = {
            ...oldVehicle,
            position: updatedVehicle.position,
            history: [...oldVehicle.history, updatedVehicle.position],
          };
        } else {
          updated[updatedVehicle.id] = updatedVehicle;
        }
      }

      return updated;
    });
  }

  useEffect(() => {
    fetchVehiclePoistion();
    const intervalId = setInterval(() => fetchVehiclePoistion(), 15000);
    return () => clearInterval(intervalId);
  }, []);

  return Object.values(vehicleTable);
}

export function useVehicleLayer() {
  const vehicles = useVehicles();
  const vehicleSource = useMemo(() => {
    return new VectorSource({
      features: vehicles.map(
        (v) => new Feature(new Point(v.position.coordinate)),
      ),
    });
  }, [vehicles]);

  const vehicleLayer = useMemo(
    () => new VectorLayer({ source: vehicleSource }),
    [vehicleSource],
  );

  const vehicleTrailLayer = new VectorLayer({
    source: new VectorSource({
      features: vehicles
        .filter((v) => v.history.length > 1)
        .map(
          (v) =>
            new Feature(new LineString(v.history.map((p) => p.coordinate))),
        ),
    }),
  });

  return { vehicleLayer, vehicleTrailLayer };
}
