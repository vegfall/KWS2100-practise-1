import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "ol/ol.css";
import "./application.css";
import { map, MapContext } from "../map/mapContext";
import { Layer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VehicleLayerCheckbox from "../vehicle/vehicleLayerCheckbox";

export default function Application() {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [baseLayer, setBaseLayer] = useState<Layer>(
    () => new TileLayer({ source: new OSM() }),
  );
  const [secondaryLayers, setSecondaryLayers] = useState<Layer[]>([]);

  const layers = useMemo(
    () => [baseLayer, ...secondaryLayers],
    [baseLayer, secondaryLayers],
  );

  useEffect(() => {
    map.setLayers(layers);
  }, [layers]);

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  return (
    <MapContext.Provider value={{ map, setSecondaryLayers }}>
      <nav>
        <VehicleLayerCheckbox />
      </nav>
      <main ref={mapRef}></main>
    </MapContext.Provider>
  );
}
