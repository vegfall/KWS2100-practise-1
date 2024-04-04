import React, { MutableRefObject, useEffect, useRef } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";

useGeographic();

const map = new Map({
  view: new View({
    center: [11, 60],
    zoom: 10,
  }),
  layers: [new TileLayer({ source: new OSM() })],
});

export default function Application() {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  return (
    <>
      <main ref={mapRef}></main>
    </>
  );
}
