import { Map } from "leaflet";

export type MapRef = Map | null;

export enum NeighborhoodColor {
  Selected = "#63B3ED",
  NotSelected = "#1A865F",
}

export enum TreeColor {
  Selected = "red",
  NotSelected = "black",
}

export enum MarkerRadius {
  Selected = 8,
  NotSelected = 4,
}
