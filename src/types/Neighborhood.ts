import { Coordinate } from "./Location/Coordinate";
import { Tree } from "./Tree";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface FilterInfo {
  percentage: number;
  filteredTreesCount: number;
}

export interface NeighborhoodAdditionalInfo {
  totalTreesCount: number;
  predominantSpecies: string;
  predominantRisk: number;
  simpsonIndex: number;
}

export interface Neighborhood {
  idNeighborhood: number;
  neighborhoodName: string;
  numBlocksInNeighborhood?: number;
  cityName?: string;
  provinceName?: string;
  coordinates: Coordinate[];
  color?: string;
  filterInfo?: FilterInfo;
  additionalInfo?: NeighborhoodAdditionalInfo;
  trees?: Tree;
}

export interface FilterInfo {
  percentage: number;
  filteredTreesCount: number;
}

export interface CreateNeighborhoodDto {
  idCity?: number;
  neighborhoodName: string;
  numBlocksInNeighborhood: number;
  coordinates: Coordinate[];
}
