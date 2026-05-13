import { NeighborhoodColor } from "../../types/Map";

export const getNeighborhoodColor = (index: number, id1?: string) =>
  id1 === String(index + 1) ? NeighborhoodColor.Selected : NeighborhoodColor.NotSelected;
