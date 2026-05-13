// hooks/useTrees.ts
import { useEffect, useState } from "react";
import { getFilteredTrees } from "../services/TreeService";
import { Tree } from "../types/Tree";
import { findAllTreesByIdProject } from "../services/ProjectService";

interface FilteredTotal {
  idNeighborhood: number;
  treeQtyFiltered: number;
}

export const useFetchTrees = (idProject: string | undefined) => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [filteredTotals, setFilteredTotals] = useState<FilteredTotal[]>([]);

  useEffect(() => {
    const fetchTrees = async () => {
      if (!idProject) return;
      setLoading(true);
      try {
        const data = await findAllTreesByIdProject(Number(idProject));
        setTrees(data);
      } catch (error) {
        console.error("Error al obtener los árboles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrees();
  }, [idProject]);

  const applyFilters = async (filters: Record<string, string[]>, neighborhoodIds?: number[]) => {
    if (!idProject) return;

    setLoading(true);
    try {
      const filteredTrees = await getFilteredTrees(Number(idProject), filters, neighborhoodIds);

      const totalsMap: Record<number, number> = {};
      filteredTrees.forEach((tree: any) => {
        totalsMap[tree.idNeighborhood] = (totalsMap[tree.idNeighborhood] || 0) + 1;
      });
      const totals = Object.entries(totalsMap).map(([id, count]) => ({
        idNeighborhood: Number(id),
        treeQtyFiltered: count,
      }));

      setTrees(filteredTrees);
      setFilteredTotals(totals);
      setActiveFilters(filters);
    } catch (error) {
      console.error("Error al filtrar árboles:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    trees,
    loading,
    applyFilters,
    activeFilters,
    filteredTotals,
  };
};
