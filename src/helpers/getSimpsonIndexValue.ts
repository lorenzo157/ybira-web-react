import { groupBy, isNaN, size } from "lodash";
import { Tree } from "../types/Tree";

// Returns Simpson's Diversity Index (1 - D), range [0, 1]
// 1 = maximum diversity (all different species), 0 = minimum diversity (all same species)
export const getSimpsonIndexValue = (trees: Tree[], neighborhoodID?: number): number => {
  const filteredTrees = trees.filter((tree) => tree.idNeighborhood === neighborhoodID);
  if (filteredTrees.length < 2) return 0;

  // Group trees by species (treeTypeName); ungrouped → "Desconocido"
  const treeSpecies: Record<string, Tree[]> = groupBy(
    filteredTrees,
    (tree: Tree) => tree.treeTypeName ?? "Desconocido",
  );

  // D = Σ ni*(ni-1) / N*(N-1)
  const N = filteredTrees.length;
  const sum = Object.values(treeSpecies).reduce((acc, group) => {
    const ni = size(group);
    return acc + ni * (ni - 1);
  }, 0);

  const D = sum / (N * (N - 1));
  return isNaN(D) ? 0 : 1 - D;
};
