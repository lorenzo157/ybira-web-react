export interface Project {
  idProject: number;
  projectName: string;
  projectDescription: string | null;
  startDate: string;
  endDate: string;
  projectType: string;
  cityName?: string;
  idUser?: number;
  provinceName?: string;
  containsData?: boolean;
}

export interface Coordenadas {
  idTree: number;
  latitude: number;
  longitude: number;
}

export type Filter = Record<string, string[]>;

export enum FilterName {
  IsDead = "isDead",
  IsMissing = "isMissing",
  Diseases = "diseases",
  ExposedRoots = "exposedRoots",
  TreeTypeName = "treeTypeName",
  Pests = "pests",
  TreeValue = "treeValue",
  Conflicts = "conflicts",
  WindExposure = "windExposure",
  Vigor = "vigor",
  CanopyDensity = "canopyDensity",
  GrowthSpace = "growthSpace",
  Risk = "risk",
  Intervention = "intervention",
  StreetMateriality = "streetMateriality",
  FrequencyUse = "frequencyUse",
}

// Traducción de los nombres de los filtros
export const FilterLabels: Record<FilterName, string> = {
  [FilterName.IsDead]: "Está muerto",
  [FilterName.IsMissing]: "Está ausente",
  [FilterName.Diseases]: "Enfermedades",
  [FilterName.ExposedRoots]: "Raíces expuestas",
  [FilterName.TreeTypeName]: "Especies",
  [FilterName.Pests]: "Plagas",
  [FilterName.TreeValue]: "Valor del árbol",
  [FilterName.Conflicts]: "Conflictos",
  [FilterName.WindExposure]: "Exposición al viento",
  [FilterName.Vigor]: "Vigor",
  [FilterName.CanopyDensity]: "Densidad de copa",
  [FilterName.GrowthSpace]: "Espacio de crecimiento",
  [FilterName.Risk]: "Riesgo",
  [FilterName.Intervention]: "Intervención",
  [FilterName.StreetMateriality]: "Materialidad de la calle",
  [FilterName.FrequencyUse]: "Frecuencia de uso",
};
