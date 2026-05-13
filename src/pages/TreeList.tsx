import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { deleteTreeById, getTreeDetailsByIdProject } from "../services/TreeService";
import { Box, Button, Flex, Heading, Input, Text, VStack, Badge } from "@chakra-ui/react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { toaster } from "../utils/toaster";
import { Tree } from "../types/Tree";
import TreeDetails from "../components/TreeDetails";
import { findAllTreesByIdProject } from "../services/ProjectService";

const riskColor = (risk: number | string | null | undefined): string => {
  if (!risk) return "#9e9e9e";
  const r = Number(risk);
  if (isNaN(r)) return "#9e9e9e";
  if (r <= 3) return "#2e7d32";
  if (r <= 6) return "#f57c00";
  return "#c62828";
};

const TreeList: React.FC = () => {
  const { idProject, idUnitWork } = useParams<{
    idProject: string;
    idUnitWork?: string;
  }>();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrees, setExpandedTrees] = useState<Set<number>>(new Set());
  const [treeDetailsMap, setTreeDetailsMap] = useState<Record<number, Tree | null>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<number | null>(null);
  const [searchId, setSearchId] = useState("");

  const location = useLocation();
  const projectName = location.state?.projectName || "Proyecto Desconocido";
  const projectDescription = location.state?.projectDescription;
  const startDate = location.state?.startDate;
  const endDate = location.state?.endDate;
  const projectType = location.state?.projectType;
  const neighborhoodName = location.state?.neighborhoodName || "Barrio Desconocido";
  const neighborhoodId = location.state?.neighborhoodId;
  const cityName = location.state?.cityName;
  const provinceName = location.state?.provinceName;
  const numBlocksInNeighborhood = location.state?.numBlocksInNeighborhood;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrees = async () => {
      if (!idProject) return;
      setLoading(true);
      try {
        let data: any[] = [];
        const unitWorkId = idUnitWork && Number(idUnitWork) !== 0 ? Number(idUnitWork) : undefined;
        data = await findAllTreesByIdProject(Number(idProject), unitWorkId);
        if (!data || data.length === 0) {
          setError(
            idUnitWork && Number(idUnitWork) !== 0
              ? "La unidad de trabajo seleccionada no contiene árboles."
              : "El proyecto seleccionado no contiene árboles.",
          );
        } else {
          const formattedData: Tree[] = data.map((tree) => ({
            idTree: tree.idTree,
            address: tree.address ?? "Desconocida",
            datetime: new Date(tree.datetime),
            treeValue: tree.treeValue ?? "No asignado",
            treeTypeName: tree.treeTypeName,
            risk: tree.risk ?? "N/A",
            latitude: tree.latitude ?? 0,
            longitude: tree.longitude ?? 0,
            pathPhoto: tree.pathPhoto,
          }));
          setTrees(formattedData);
        }
      } catch {
        setError("No se pudo obtener la información de los árboles.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProject]);

  const toggleExpand = (idTree: number) => {
    setExpandedTrees((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(idTree)) {
        newExpanded.delete(idTree);
      } else {
        newExpanded.add(idTree);
      }
      return newExpanded;
    });
  };

  const confirmDeleteTree = (idTree: number) => {
    setTreeToDelete(idTree);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (treeToDelete === null) return;
    try {
      await deleteTreeById(treeToDelete);
      setTrees((prevTrees) => prevTrees.filter((tree) => tree.idTree !== treeToDelete));
      toaster.create({
        title: "Árbol eliminado",
        description: `El árbol con ID ${treeToDelete} fue eliminado exitosamente.`,
        type: "success",
        duration: 3000,
      });
    } catch {
      toaster.create({
        title: "Error al eliminar",
        description: "No se pudo eliminar el árbol. Inténtalo de nuevo.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsModalOpen(false);
      setTreeToDelete(null);
    }
  };

  const fetchTreeDetails = async (idTree: number) => {
    try {
      const treeDetails = await getTreeDetailsByIdProject(Number(idProject), idTree);
      setTreeDetailsMap((prevDetails) => ({ ...prevDetails, [idTree]: treeDetails }));
    } catch (error) {
      console.error("Error al obtener los detalles del árbol:", error);
    }
  };

  useEffect(() => {
    expandedTrees.forEach((idTree) => {
      if (!treeDetailsMap[idTree]) {
        fetchTreeDetails(idTree);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedTrees, idProject, treeDetailsMap]);

  const filteredTrees = trees.filter(
    (t) => !searchId.trim() || String(t.idTree).includes(searchId.trim()),
  );

  if (loading)
    return (
      <Box
        minHeight="100vh"
        bg="#EFF2F9"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontFamily="Raleway" fontSize="lg" color="teal.600">
          Cargando árboles...
        </Text>
      </Box>
    );

  if (error)
    return (
      <Box
        minHeight="100vh"
        bg="#EFF2F9"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
      >
        <Text fontFamily="Raleway" fontSize="2xl">
          🌳
        </Text>
        <Text fontFamily="Raleway" fontSize="lg" color="gray.500" textAlign="center" maxW="400px">
          {error}
        </Text>
      </Box>
    );

  return (
    <Box minHeight="100vh" bg="#EFF2F9" p={6}>
      <Box maxW="900px" mx="auto">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={8}>
          Listado de Árboles
        </Heading>

        {/* Header card */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          mb={6}
        >
          <Box bg="teal.500" px={6} py={3}>
            <Text fontSize="sm" fontWeight="semibold" color="white">
              {Number(idUnitWork) === 0
                ? `Proyecto: ${projectName} — ID: ${idProject}`
                : `Unidad de Trabajo #${idUnitWork} — Barrio: ${neighborhoodName}`}
            </Text>
          </Box>
          <Box px={6} py={4}>
            {Number(idUnitWork) === 0 ? (
              <VStack align="start" gap={0}>
                {projectDescription && (
                  <Text fontSize="sm" color="gray.500">
                    {projectDescription}
                  </Text>
                )}
                {(provinceName || cityName) && (
                  <Text fontSize="sm" color="gray.500">
                    {[provinceName, cityName].filter(Boolean).join(" — ")}
                  </Text>
                )}
                {projectType && (
                  <Text fontSize="xs" color="gray.400">
                    Tipo: {projectType}
                  </Text>
                )}
                {startDate && (
                  <Text fontSize="xs" color="gray.400">
                    {new Date(startDate).toLocaleDateString("es-AR")} —{" "}
                    {endDate ? new Date(endDate).toLocaleDateString("es-AR") : ""}
                  </Text>
                )}
              </VStack>
            ) : (
              <VStack align="start" gap={0}>
                {neighborhoodId != null && (
                  <Text fontSize="xs" color="gray.400">
                    ID barrio: {neighborhoodId}
                  </Text>
                )}
                {(provinceName || cityName) && (
                  <Text fontSize="sm" color="gray.500">
                    {[provinceName, cityName].filter(Boolean).join(" — ")}
                  </Text>
                )}
                {numBlocksInNeighborhood != null && (
                  <Text fontSize="sm" color="gray.500">
                    {numBlocksInNeighborhood} manzanas
                  </Text>
                )}
              </VStack>
            )}
          </Box>
        </Box>

        {/* Actions row */}
        <Flex gap={3} mb={5} wrap="wrap" align="center">
          <Input
            placeholder="Buscar por ID de árbol..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            bg="white"
            borderRadius="lg"
            borderColor="gray.300"
            maxW="260px"
            _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
          />
          <Text fontSize="sm" color="gray.400" ml="auto">
            {filteredTrees.length} árbol{filteredTrees.length !== 1 ? "es" : ""}
          </Text>
          <Button
            onClick={() => navigate(`/trees/${idProject}/${idUnitWork}`)}
            fontFamily="Raleway"
            bg="#1A865F"
            color="white"
            _hover={{ bg: "teal.500" }}
            px={6}
          >
            Ver mapa
          </Button>
        </Flex>

        {/* Tree cards */}
        <VStack gap={3} align="stretch">
          {filteredTrees.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchId ? "No se encontraron árboles con ese ID." : "No hay árboles disponibles."}
            </Text>
          ) : (
            filteredTrees.map((tree) => (
              <Box
                key={tree.idTree}
                bg="white"
                rounded="xl"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="sm"
                overflow="hidden"
              >
                <Flex align="center" justify="space-between" px={4} py={3}>
                  <Flex
                    align="center"
                    gap={3}
                    flex="1"
                    cursor="pointer"
                    onClick={() => toggleExpand(tree.idTree)}
                    _hover={{ opacity: 0.8 }}
                  >
                    {/* Risk indicator */}
                    <Box w="4px" h="40px" rounded="full" bg={riskColor(tree.risk)} flexShrink={0} />
                    <Box>
                      <Flex align="center" gap={2} mb={0.5}>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                          {tree.treeTypeName || "Sin especie"}
                        </Text>
                        <Text fontSize="10px" color="gray.400">
                          #{tree.idTree}
                        </Text>
                      </Flex>
                      <Flex align="center" gap={2}>
                        <Badge
                          px={2}
                          py={0.5}
                          rounded="full"
                          fontSize="10px"
                          fontWeight="semibold"
                          bg={`${riskColor(tree.risk)}20`}
                          color={riskColor(tree.risk)}
                          border="1px solid"
                          borderColor={`${riskColor(tree.risk)}40`}
                        >
                          Riesgo: {tree.risk ?? "N/A"}
                        </Badge>
                        {tree.address && tree.address !== "Desconocida" && (
                          <Text fontSize="xs" color="gray.400">
                            {tree.address}
                          </Text>
                        )}
                      </Flex>
                    </Box>
                    <Box ml="auto" color="gray.400" fontSize="xs" pr={2}>
                      {expandedTrees.has(tree.idTree) ? "▲" : "▼"}
                    </Box>
                  </Flex>

                  <Button
                    size="sm"
                    bg="red.50"
                    color="red.600"
                    border="1px solid"
                    borderColor="red.200"
                    _hover={{ bg: "red.100" }}
                    px={4}
                    minW="90px"
                    ml={3}
                    onClick={() => confirmDeleteTree(tree.idTree)}
                  >
                    Eliminar
                  </Button>
                </Flex>

                {expandedTrees.has(tree.idTree) && (
                  <Box px={5} py={4} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                    {treeDetailsMap[tree.idTree] ? (
                      <TreeDetails tree={treeDetailsMap[tree.idTree]!} isInListPage />
                    ) : (
                      <Text fontSize="sm" color="gray.400">
                        Cargando detalles...
                      </Text>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </VStack>
      </Box>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="¿Eliminar árbol?"
        confirmLabel="Eliminar"
        confirmColorScheme="red"
        onConfirm={handleConfirmDelete}
      >
        ¿Estás seguro de que deseas eliminar este árbol? Esta acción no se puede deshacer.
      </ConfirmModal>
    </Box>
  );
};

export default TreeList;
