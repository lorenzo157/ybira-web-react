export interface UnitWork {
  idUnitWork?: number;
  projectId: number;
  neighborhoodId: number;
  neighborhoodName: string;
  cityName?: string;
  provinceName?: string;
  numBlocksInNeighborhood?: number;
  projectName?: string;
  pruningTraining?: number;
  pruningSanitary?: number;
  pruningHeightReduction?: number;
  pruningBranchThinning?: number;
  pruningSignClearing?: number;
  pruningPowerLineClearing?: number;
  pruningRootDeflectors?: number;
  moveTarget?: number;
  restrictAccess?: number;
  cabling?: number;
  fastening?: number;
  propping?: number;
  permeableSurfaceIncreases?: number;
  fertilizations?: number;
  descompression?: number;
  drains?: number;
  extractions?: number;
  plantations?: number;
  openingsPot?: number;
  advancedInspections?: number;
}

export interface ReadUnitWorkDto {
  idUnitWork: number;
  projectId: number;
  neighborhoodId: number;
  neighborhoodName: string;
  pruningTraining: number;
  pruningSanitary: number;
  pruningHeightReduction: number;
  pruningBranchThinning: number;
  pruningSignClearing: number;
  pruningPowerLineClearing: number;
  pruningRootDeflectors: number;
  moveTarget?: number;
  restrictAccess?: number;
  cabling: number;
  fastening: number;
  propping: number;
  permeableSurfaceIncreases: number;
  fertilizations: number;
  descompression: number;
  drains: number;
  extractions: number;
  plantations: number;
  openingsPot: number;
  advancedInspections: number;
  campaignDescription: string;
}

export interface UpdateCampaignDto {
  projectName: string;
  campaignDescription: string;

  // Prunning (Poda)
  pruningTraining: number;
  pruningSanitary: number;
  pruningHeightReduction: number;
  pruningBranchThinning: number;
  pruningSignClearing: number;
  pruningPowerLineClearing: number;
  pruningRootDeflectors: number;

  moveTarget?: number;
  restrictAccess?: number;
  cabling: number;
  fastening: number;
  propping: number;
  permeableSurfaceIncreases: number;
  fertilizations: number;
  descompression: number;
  drains: number;
  extractions: number;
  plantations: number;
  openingsPot: number;
  advancedInspections: number;
}
