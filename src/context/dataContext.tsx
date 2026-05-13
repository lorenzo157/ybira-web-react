import { createContext, useState, ReactNode, FC, useContext, useEffect } from "react";
import { Tree } from "../types/Tree";
import { Neighborhood } from "../types/Neighborhood";
import { Filter, FilterName } from "../types/Project";
import axios from "axios";
import { useParams } from "react-router-dom";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export type DataContextType = {
  trees: Tree[];
  neighborhoods: Neighborhood[];
  isLoadingTreesData: boolean;
  setTrees: (trees: Tree[]) => void;
  setNeighborhoods: (neighborhoods: Neighborhood[]) => void;
  setLoadingTreesData: (value: boolean) => void;
  filters: Filter;
  isLoadingFiltersData: boolean;
};

const DataContext = createContext<DataContextType>({
  neighborhoods: [],
  trees: [],
  isLoadingTreesData: false,
  setNeighborhoods: () => {},
  setTrees: () => {},
  setLoadingTreesData: () => {},
  filters: {},
  isLoadingFiltersData: false,
});

export const useData = () => useContext(DataContext);

interface Props {
  children: ReactNode;
}

export const DataProvider: FC<Props> = ({ children }) => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoadingTreesData, setLoadingTreesData] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filter>({});
  const [isLoadingFiltersData, setIsLoadingFiltersData] = useState<boolean>(true);
  const { idProject, idUnitwork } = useParams<{ idProject: string; idUnitwork: string }>();

  useEffect(() => {
    const init = async () => {
      setIsLoadingFiltersData(true);
      try {
        const filterNames = Object.values(FilterName).join(",");
        const url = `/project/${idProject}/tree/${idUnitwork}/get-all-filters`;
        const response = await api.get(url, {
          params: {
            filterNames: filterNames,
          },
        });

        const responseData = response.data;

        const transformedFilters: Record<string, string[]> = responseData.reduce(
          (acc: { [x: string]: any }, filter: { filterName: string | number; values: any[] }) => {
            if (filter.filterName) {
              acc[filter.filterName] = filter.values.map((item) => item[filter.filterName]);
            }
            return acc;
          },
          {} as Record<string, string[]>,
        );

        setFilters(transformedFilters);
        setIsLoadingFiltersData(false);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setIsLoadingFiltersData(false);
      }
    };
    if (idProject && idUnitwork) {
      init();
    }
  }, [idProject, idUnitwork]);

  return (
    <DataContext.Provider
      value={{
        trees,
        neighborhoods,
        isLoadingTreesData,
        setTrees: (trees: Tree[]) => setTrees(trees),
        setNeighborhoods: (neighborhood: Neighborhood[]) => setNeighborhoods(neighborhood),
        setLoadingTreesData: (value: boolean) => setLoadingTreesData(value),
        filters,
        isLoadingFiltersData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
