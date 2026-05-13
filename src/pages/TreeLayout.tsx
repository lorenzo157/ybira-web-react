import React, { FC, useEffect, useState } from "react";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { findAllTreesByIdProject } from "../services/ProjectService";
import { Tree } from "../types/Tree";
import { MapComponent } from "../components/Map/MapComponent";
import FiltersHeader from "../components/FiltersHeader/FiltersHeader";
import CenteredText from "../components/CenteredText/CenteredText";
import TreeDetails from "../components/TreeDetails";
import { getTreeDetailsByIdProject } from "../services/TreeService";
import { LatLngTuple } from "leaflet";

const TreeLayout: FC = () => {
  const { idProject } = useParams<{ idProject: string }>();
  const [mapCenter, setMapCenter] = useState<LatLngTuple>();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | undefined>(undefined);
  const [selectedNeighborhoodID, setSelectedNeighborhoodID] = useState<string | undefined>(
    undefined,
  );

  // Estados para detalles del árbol
  const [treeDetails, setTreeDetails] = useState<Tree | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(false);

  // Cargar árboles cuando cambia el proyecto
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const trees = await findAllTreesByIdProject(Number(idProject));
        const center = calcularCentroCoordenadas(trees);
        setMapCenter(center);
        setTrees(trees);
        if (trees.length > 0) {
          setSelectedTree(trees[0]);
        }
      } catch (error) {
        console.error("Error al obtener los árboles:", error);
      }
    };
    fetchTrees();
  }, [idProject]);

  // Si el árbol seleccionado desaparece del listado, deseleccionar
  useEffect(() => {
    if (selectedTree) {
      const foundTree = trees.find((tree) => tree.idTree === selectedTree.idTree);
      if (!foundTree) {
        setSelectedTree(undefined);
      }
    }
  }, [trees, selectedTree]);

  // Cargar detalles cuando cambia el árbol seleccionado
  useEffect(() => {
    if (!selectedTree) {
      setTreeDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      setErrorDetails(false);
      try {
        const details = await getTreeDetailsByIdProject(Number(idProject), selectedTree.idTree);
        setTreeDetails(details);
      } catch (error) {
        setErrorDetails(true);
        setTreeDetails(null);
        console.error("Error al obtener detalles del árbol:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedTree, idProject]);

  const calcularCentroCoordenadas = (
    trees: Tree[],
    fallback: LatLngTuple = [-34.6989, -64.7597], // centro AR
  ): LatLngTuple => {
    const coords = trees
      .filter(
        (tree) =>
          tree.latitude !== undefined &&
          tree.longitude !== undefined &&
          !isNaN(Number(tree.latitude)) &&
          !isNaN(Number(tree.longitude)),
      )
      .map((tree) => ({
        lat: Number(tree.latitude),
        lng: Number(tree.longitude),
      }));

    if (coords.length === 0) return fallback;

    const sum = coords.reduce(
      (acc, curr) => ({
        lat: acc.lat + curr.lat,
        lng: acc.lng + curr.lng,
      }),
      { lat: 0, lng: 0 },
    );

    return [sum.lat / coords.length, sum.lng / coords.length];
  };

  return (
    <>
      <Flex h="100vh" bgColor="#EFF2F9" flexDir="column">
        <FiltersHeader
          showTreeSelect
          trees={trees}
          selectedTree={selectedTree}
          onTreeSelect={setSelectedTree}
        />

        <Grid h="100%" columnGap={6} templateColumns="2fr 1fr" px="6" pb="10" overflow="hidden">
          <GridItem w="100%" h="100%">
            {mapCenter && trees.length > 0 ? (
              <MapComponent
                trees={trees}
                center={mapCenter}
                showPopup
                selectableNeighborhoods
                onTreeSelect={setSelectedTree}
                selectedTree={selectedTree}
                selectedNeighborhoodID={selectedNeighborhoodID}
                setSelectedNeighborhoodID={setSelectedNeighborhoodID}
              />
            ) : (
              <CenteredText text="Cargando mapa..." />
            )}
          </GridItem>

          <GridItem w="100%" h="100%" overflow="hidden">
            <Grid h="100%" gap={4} flexDir="column" overflow="auto" templateRows="repeat(1,1fr)">
              {loadingDetails ? (
                <CenteredText text="Cargando detalles del árbol..." />
              ) : errorDetails ? (
                <CenteredText text="Error al obtener los detalles del árbol" />
              ) : treeDetails ? (
                <TreeDetails tree={treeDetails} />
              ) : (
                <CenteredText text="Seleccione un Árbol" />
              )}
            </Grid>
          </GridItem>
        </Grid>
      </Flex>
    </>
  );
};

export default TreeLayout;
