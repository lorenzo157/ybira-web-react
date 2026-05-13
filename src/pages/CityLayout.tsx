import { FC, useRef, useEffect, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { MapRef } from "../types/Map";
import { MapComponent } from "../components/Map/MapComponent";
import MapFilters from "../components/MapFilters/MapFilters";
import Charts from "../components/Charts/Charts";
import { useFetchTrees } from "../hooks/useFetchTrees";
import { Neighborhood } from "../types/Neighborhood";
import { getNeighborhoodDataForMaps } from "../services/ProjectService";
import { Coordinate } from "../types/Location/Coordinate";
import { LatLngTuple } from "leaflet";
import CenteredText from "../components/CenteredText/CenteredText";
import { useData } from "../context/dataContext";

const CityLayout: FC = () => {
  const mapRef = useRef<MapRef>(null);
  const { idProject } = useParams<{ idProject: string }>();
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState<boolean>(true);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>();
  const { setNeighborhoods: setContextNeighborhoods, setTrees: setContextTrees } = useData();
  const { trees, applyFilters } = useFetchTrees(idProject);

  const calcularCentroCoordenadas = (
    neighborhoods: Neighborhood[],
    fallback: LatLngTuple = [-34.6989, -64.7597],
  ): LatLngTuple => {
    const coords = neighborhoods
      .flatMap((n) => n.coordinates)
      .filter((c) => typeof c.latitude === "number" && typeof c.longitude === "number");
    if (coords.length === 0) return fallback;
    const sum = coords.reduce(
      (acc, c) => ({ lat: acc.lat + c.latitude, lng: acc.lng + c.longitude }),
      { lat: 0, lng: 0 },
    );
    return [sum.lat / coords.length, sum.lng / coords.length];
  };

  useEffect(() => {
    setContextTrees(trees);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trees]);

  useEffect(() => {
    const loadNeighborhoodData = async () => {
      if (!idProject) return;
      setIsLoadingCoordinates(true);
      try {
        const response = await getNeighborhoodDataForMaps(Number(idProject));
        if (Array.isArray(response)) {
          const formattedNeighborhoods: Neighborhood[] = response.map((neighborhood: any) => ({
            idNeighborhood: neighborhood.idNeighborhood,
            neighborhoodName: neighborhood.neighborhoodName,
            coordinates: neighborhood.coordinates.map((coord: Coordinate) => ({
              latitude: Number(coord.latitude),
              longitude: Number(coord.longitude),
            })),
            color: neighborhood.color || undefined,
            additionalInfo: neighborhood.additionalInfo,
            filterInfo: neighborhood.filterInfo || undefined,
          }));
          setNeighborhoods(formattedNeighborhoods);
          setContextNeighborhoods(formattedNeighborhoods);
          setMapCenter(calcularCentroCoordenadas(formattedNeighborhoods));
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
    loadNeighborhoodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProject]);

  return (
    <Grid h="100vh" bgColor="#EFF2F9" templateColumns="3fr 2fr" overflow="hidden">
      {/* Left: Map */}
      <GridItem h="100%" p={4}>
        {isLoadingCoordinates ? (
          <CenteredText text="Cargando información del barrio..." />
        ) : (
          <MapComponent
            trees={trees}
            center={mapCenter}
            showTrees={true}
            neighborhoods={neighborhoods}
            showPopup={true}
            selectableNeighborhoods={true}
            mapRef={mapRef}
          />
        )}
      </GridItem>

      {/* Right: Filters + Report (scrollable) */}
      <GridItem h="100%" overflowY="auto" display="flex" flexDir="column" gap={4} p={4}>
        <MapFilters
          idProject={Number(idProject)}
          map={mapRef.current ?? undefined}
          onApplyFilters={applyFilters}
        />
        <Charts trees={trees} neighborhoods={neighborhoods} />
      </GridItem>
    </Grid>
  );
};

export default CityLayout;
