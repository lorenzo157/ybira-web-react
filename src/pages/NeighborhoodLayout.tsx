import React, { FC, useEffect, useRef, useState } from "react";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import FiltersHeader from "../components/FiltersHeader/FiltersHeader";
import { MapComponent } from "../components/Map/MapComponent";
import MapFilters from "../components/MapFilters/MapFilters";
import ReportSummary from "../components/ReportSummary/ReportSummary";
import CenteredText from "../components/CenteredText/CenteredText";
import { getNeighborhoodDataForMaps, findAllTreesByIdProject } from "../services/ProjectService";
import { getSimpsonIndexValue } from "../helpers/getSimpsonIndexValue";
import { useParams } from "react-router-dom";
import { MapRef } from "../types/Map";
import { useFetchTrees } from "../hooks/useFetchTrees";
import { Neighborhood } from "../types/Neighborhood";
import { Tree } from "../types/Tree";
import { Coordinate } from "../types/Location/Coordinate";
import { LatLngTuple } from "leaflet";

const NeighborhoodLayout: FC = () => {
  const [mapCenter, setMapCenter] = useState<LatLngTuple>();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>();
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState<boolean>(true);
  const [selectedNeighborhoodID, setSelectedNeighborhoodID] = useState<string | undefined>(
    undefined,
  );
  const { idProject } = useParams<{ idProject: string }>();
  const mapRef = useRef<MapRef>(null);
  const {
    applyFilters,
    filteredTotals,
    activeFilters,
    trees: hookFilteredTrees,
  } = useFetchTrees(idProject);
  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0);

  const computePredominantSpecies = (neighborhoodTrees: Tree[]): string => {
    if (neighborhoodTrees.length === 0) return "N/A";
    const counts: Record<string, number> = {};
    neighborhoodTrees.forEach((t) => {
      if (t.treeTypeName) counts[t.treeTypeName] = (counts[t.treeTypeName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
  };

  const computePredominantRisk = (neighborhoodTrees: Tree[]): number | string => {
    if (neighborhoodTrees.length === 0) return "N/A";
    const counts: Record<number, number> = {};
    neighborhoodTrees.forEach((t) => {
      counts[t.risk] = (counts[t.risk] || 0) + 1;
    });
    return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
  };

  const applyFiltersWithNeighborhoods = (filters: Record<string, string[]>) => {
    const selectedIds =
      neighborhoods
        ?.filter((n) => selectedOptions.includes(n.neighborhoodName))
        .map((n) => n.idNeighborhood) ?? [];
    applyFilters(filters, selectedIds);
  };

  const [trees, setTrees] = useState<any[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrees, setShowTrees] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadAllTrees = async () => {
      if (!idProject) return;
      setLoading(true);
      try {
        const allTrees = await findAllTreesByIdProject(Number(idProject));
        setTrees(allTrees);
      } catch (error) {
        console.error("Error fetching all trees:", error);
        setTrees([]);
      } finally {
        setLoading(false);
      }
    };

    const loadNeighborhoodData = async () => {
      if (!idProject) return;
      setIsLoadingCoordinates(true);
      try {
        const response = await getNeighborhoodDataForMaps(Number(idProject));

        if (Array.isArray(response)) {
          const formattedNeighborhoods: Neighborhood[] = response.map(
            (neighborhood: Neighborhood) => ({
              idNeighborhood: neighborhood.idNeighborhood,
              neighborhoodName: neighborhood.neighborhoodName,
              coordinates: neighborhood.coordinates.map((coord: Coordinate) => ({
                latitude: Number(coord.latitude),
                longitude: Number(coord.longitude),
              })),
              color: neighborhood.color || "#1A865F",
              additionalInfo: neighborhood.additionalInfo,
              filterInfo: neighborhood.filterInfo || undefined,
            }),
          );
          setNeighborhoods(formattedNeighborhoods);
          const center = calcularCentroCoordenadas(formattedNeighborhoods);
          setMapCenter(center);
        } else {
          setNeighborhoods([]);
        }
      } catch (error) {
        console.error("Error fetching neighborhood data for maps:", error);
        setNeighborhoods([]);
      } finally {
        setIsLoadingCoordinates(false);
      }
    };
    loadAllTrees();
    loadNeighborhoodData();
  }, [idProject]);

  useEffect(() => {
    if (neighborhoods && neighborhoods.length > 0) {
      const formattedOptions = neighborhoods.map((n) => n.neighborhoodName);
      setSelectedOptions(formattedOptions);
      setOptions(formattedOptions);
    }
  }, [neighborhoods]);

  useEffect(() => {
    const filtered = trees.filter(
      (tree) => selectedOptions.length === 0 || selectedOptions.includes(tree.neighborhoodName),
    );
    setFilteredTrees(filtered);
  }, [trees, selectedOptions]);

  const visibleNeighborhoods = neighborhoods?.filter((n) =>
    selectedOptions.some(
      (sel) => sel.toLowerCase().trim() === n.neighborhoodName.toLowerCase().trim(),
    ),
  );

  const calcularCentroCoordenadas = (
    neighborhoods: Neighborhood[],
    fallback: LatLngTuple = [-34.6989, -64.7597], // centro AR
  ): LatLngTuple => {
    const coords = neighborhoods
      .flatMap((neighborhood) => neighborhood.coordinates)
      .filter((c) => typeof c.latitude === "number" && typeof c.longitude === "number");
    if (coords.length === 0) return fallback;

    const sum = coords.reduce(
      (acc, c) => ({ lat: acc.lat + c.latitude, lng: acc.lng + c.longitude }),
      { lat: 0, lng: 0 },
    );

    return [sum.lat / coords.length, sum.lng / coords.length];
  };

  // Keep same order as selectedOptions so index-based mapping in ReportSummary aligns
  const selectedNeighborhoodData = selectedOptions
    .map((name) => neighborhoods?.find((n) => n.neighborhoodName === name))
    .filter((n): n is NonNullable<typeof n> => n != null);

  const totalTreesCount = selectedNeighborhoodData.map(
    (n) => n.additionalInfo?.totalTreesCount ?? 0,
  );

  const predominantSpecies = selectedOptions.map((name, index) => {
    if (!hasActiveFilters)
      return selectedNeighborhoodData[index]?.additionalInfo?.predominantSpecies ?? "N/A";
    return computePredominantSpecies(hookFilteredTrees.filter((t) => t.neighborhoodName === name));
  });

  const predominantRisk = selectedOptions.map((name, index) => {
    if (!hasActiveFilters)
      return selectedNeighborhoodData[index]?.additionalInfo?.predominantRisk ?? "N/A";
    return computePredominantRisk(hookFilteredTrees.filter((t) => t.neighborhoodName === name));
  });

  const simpsonIndex = selectedOptions.map((_name, index) => {
    if (!hasActiveFilters)
      return (selectedNeighborhoodData[index]?.additionalInfo?.simpsonIndex ?? 0).toFixed(2);
    const idNeighborhood = selectedNeighborhoodData[index]?.idNeighborhood;
    const value = getSimpsonIndexValue(hookFilteredTrees, idNeighborhood);
    return value.toFixed(2);
  });

  return (
    <Flex h="100vh" bgColor="#EFF2F9" flexDir="column">
      <FiltersHeader
        showNeighborhoodSelect
        selectedNeighborhoodId={selectedNeighborhoodID ? Number(selectedNeighborhoodID) : undefined}
        onNeighborhoodSelect={(id) => setSelectedNeighborhoodID(id?.toString())}
        showTrees={showTrees}
        setShowTrees={setShowTrees}
        options={options}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />

      <Grid h="100%" columnGap={6} templateColumns="2fr 1fr" px="6" pb="10" overflow="hidden">
        <GridItem w="100%" h="100%">
          {isLoadingCoordinates ? (
            <CenteredText text="Cargando información del barrio..." />
          ) : (
            <MapComponent
              center={mapCenter}
              trees={showTrees ? filteredTrees : []}
              selectedNeighborhood={undefined}
              neighborhoods={visibleNeighborhoods}
              showPopup={true}
              zoom={14}
              mapRef={mapRef}
            />
          )}
        </GridItem>

        <GridItem w="100%" h="100%" overflow="hidden">
          <Grid h="100%" gap={4} flexDir="column" overflow="auto" templateRows="auto 1fr">
            <MapFilters
              idProject={Number(idProject)}
              map={mapRef.current ?? undefined}
              onApplyFilters={applyFiltersWithNeighborhoods}
            />

            {loading ? (
              <CenteredText text="Cargando información del barrio..." />
            ) : selectedOptions.length === 0 ? (
              <CenteredText text="Selecciona al menos un barrio" />
            ) : (
              <ReportSummary
                name={`Barrios: ${selectedOptions.join(" | ")}`}
                selectedNeighborhoods={selectedOptions}
                predominantSpecies={predominantSpecies}
                simpsonIndex={simpsonIndex}
                predominantRisk={predominantRisk}
                totalTreesCount={totalTreesCount}
                filteredTotals={
                  selectedNeighborhoodData?.map((n) => ({
                    idNeighborhood: n.idNeighborhood,
                    treeQtyFiltered:
                      filteredTotals.find((f) => f.idNeighborhood === n.idNeighborhood)
                        ?.treeQtyFiltered ?? 0,
                  })) ?? []
                }
              />
            )}
          </Grid>
        </GridItem>
      </Grid>
    </Flex>
  );
};

export default NeighborhoodLayout;
