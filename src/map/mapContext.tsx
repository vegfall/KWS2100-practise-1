import React, { Dispatch, SetStateAction } from "react";
import { useGeographic } from "ol/proj";
import { Map, View } from "ol";
import { Layer } from "ol/layer";

useGeographic();

export const map = new Map({
  view: new View({ center: [11, 60], zoom: 10 }),
});

export const MapContext = React.createContext<{
  map: Map;
  setSecondaryLayers: Dispatch<SetStateAction<Layer[]>>;
}>({
  map,
  setSecondaryLayers: () => {},
});
