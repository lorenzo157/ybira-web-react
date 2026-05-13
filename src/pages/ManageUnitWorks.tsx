import React, { useState, useEffect } from "react";
import {
  getUnitWorkByIdProject,
  generateUnitWorksByIdProject,
  deleteUnitWorks,
} from "../services/UnitWorkService";
import { getProjectById } from "../services/ProjectService";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Button,
  Flex,
  Text,
  Heading,
  Box,
  Stack,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { UnitWork } from "../types/UnitWork";
import { Project } from "../types/Project";

const ManageUnitWorks: React.FC = () => {
  const { idProject } = useParams<{ idProject: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [unitWorks, setUnitWorks] = useState<UnitWork[]>([]);
  const [showUnitWorks, setShowUnitWorks] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>(
    location.state?.projectName || "Proyecto Desconocido",
  );
  const [project, setProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitWorkToDelete, setUnitWorkToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  useEffect(() => {
    if (idProject) {
      getProjectById(Number(idProject))
        .then((p) => {
          setProject(p);
          setProjectName(p.projectName);
        })
        .catch(() => {});
    }
  }, [idProject]);

  const fetchUnitWorks = async () => {
    if (!idProject) return;
    try {
      const unidades = await getUnitWorkByIdProject(Number(idProject));
      if (unidades.length > 0) {
        setUnitWorks(unidades);
        setShowUnitWorks(true);
        if (unidades[0].projectName) {
          setProjectName(unidades[0].projectName);
        }
      }
    } catch (error) {
      console.error("Error al obtener unidades de trabajo:", error);
    }
  };

  useEffect(() => {
    if (idProject) {
      fetchUnitWorks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProject]);

  const handleGenerateUnitWorks = async () => {
    if (!idProject || loading) {
      console.error("ID del proyecto no disponible o ya está en proceso");
      return;
    }
    setLoading(true);
    setHasGenerated(true); // Evitar doble generación mientras está en proceso

    try {
      await generateUnitWorksByIdProject(Number(idProject));
      await new Promise((resolve) => setTimeout(resolve, 500)); // Pequeña espera antes de refrescar
      await fetchUnitWorks();
    } catch (error) {
      console.error("Error al generar unidades de trabajo:", error);
    } finally {
      setLoading(false);
      setHasGenerated(false); // Permitir generar de nuevo después de la operación
    }
  };

  useEffect(() => {
    setShowUnitWorks(unitWorks.length > 0);
  }, [unitWorks]);

  const handleNavigate = (neighborhoodId: number) => {
    const selected = unitWorks.find((uw) => uw.neighborhoodId === neighborhoodId);
    if (selected) {
      navigate(`/unitworkdetails/${selected.idUnitWork}`, {
        state: { selectedUnitWork: selected },
      });
    } else {
      console.error("No unit work found for neighborhood ID:", neighborhoodId);
    }
  };

  const handleOpenModal = (unitWorkId: number) => {
    setUnitWorkToDelete(unitWorkId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (unitWorkToDelete !== null) {
      try {
        await deleteUnitWorks(Number(idProject));

        setUnitWorks([]);
        setShowUnitWorks(false);
        setIsModalOpen(false);

        await fetchUnitWorks();
      } catch (error) {
        console.error("Error al eliminar unidades de trabajo:", error);
      }
    }
  };

  return (
    <Box w="100%" minH="100vh" bg="#EFF2F9">
      <VStack w="100%" maxW="1100px" mx="auto" px={6} pt={10}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={6}>
          Gestionar Unidades de Trabajo
        </Heading>
        <Box w="100%" p={6} bg="#EFF2F9" borderRadius="lg" boxShadow="lg">
          {!showUnitWorks ? (
            <VStack gap={4} align="center">
              <Text fontSize="md" color="gray.600">
                Genere las unidades de trabajo para el proyecto actual. Este proceso puede tardar
                unos segundos.
              </Text>
              <Button
                bg="#1A865F"
                color="white"
                _hover={{ bg: "teal.500" }}
                loading={loading}
                loadingText="Generando..."
                onClick={handleGenerateUnitWorks}
                disabled={loading || hasGenerated}
                minW="220px"
                size="lg"
              >
                Generar Unidad de Trabajo
              </Button>
            </VStack>
          ) : (
            <Stack gap={6}>
              {/* Project info card */}
              <Box
                bg="white"
                rounded="xl"
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
                boxShadow="sm"
              >
                <Box bg="teal.500" px={6} py={3}>
                  <Text fontWeight="semibold" fontSize="md" color="white">
                    Información del Proyecto
                  </Text>
                </Box>
                <Box p={5}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        Nombre
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {project?.projectName ?? projectName}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        ID
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {idProject}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        Tipo
                      </Text>
                      <Badge bg="teal.50" color="teal.700" borderRadius="md" px={2} fontSize="11px">
                        {project?.projectType ?? "—"}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        Ubicación
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {[project?.provinceName, project?.cityName].filter(Boolean).join(" — ") ||
                          "—"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        Inicio
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {project?.startDate
                          ? new Date(project.startDate).toLocaleDateString("es-AR")
                          : "—"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="bold">
                        Finalización
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {project?.endDate
                          ? new Date(project.endDate).toLocaleDateString("es-AR")
                          : "—"}
                      </Text>
                    </Box>
                    {project?.projectDescription && (
                      <Box gridColumn={{ md: "span 2" }}>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          Descripción
                        </Text>
                        <Text fontSize="sm" color="gray.800">
                          {project.projectDescription}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>
              </Box>
              <HStack justifyContent="right" flexWrap="wrap" gap={4}>
                {unitWorks.length > 0 && (
                  <Button
                    bg="#1A865F"
                    color="white"
                    _hover={{ bg: "teal.500" }}
                    minW="350px"
                    size="lg"
                    onClick={() =>
                      navigate(`/neighborhood/${idProject}`, {
                        state: {
                          idUnitWork: unitWorks[0].idUnitWork,
                          projectName,
                        },
                      })
                    }
                  >
                    Ver unidades de trabajo en el mapa de Barrios
                  </Button>
                )}
                <Button
                  bg="#1A865F"
                  color="white"
                  _hover={{ bg: "teal.500" }}
                  minW="350px"
                  size="lg"
                  onClick={() => navigate(`/city/${idProject}`)}
                >
                  Ver unidades de trabajo en el mapa de Ciudad
                </Button>
                <Button
                  bg="red.600"
                  color="white"
                  _hover={{ bg: "red.700" }}
                  minW="250px"
                  size="lg"
                  onClick={() => handleOpenModal(Number(idProject))}
                >
                  Eliminar Unidades de Trabajo
                </Button>
              </HStack>
              <Heading as="h2" size="lg" color="teal.600" fontFamily="Raleway">
                Unidades de trabajo
              </Heading>

              {unitWorks.map((uw) => (
                <Box key={uw.idUnitWork} p={4} bg="white" borderRadius="md" boxShadow="sm" mb={3}>
                  <Text fontSize="md" fontWeight="medium" color="teal.700">
                    {uw.neighborhoodName || `Neighborhood ID: ${uw.neighborhoodId}`}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    ID unidad: {uw.idUnitWork} — ID barrio: {uw.neighborhoodId}
                  </Text>
                  {(uw.provinceName || uw.cityName) && (
                    <Text fontSize="sm" color="gray.500">
                      {[uw.provinceName, uw.cityName].filter(Boolean).join(" — ")}
                    </Text>
                  )}
                  {uw.numBlocksInNeighborhood != null && (
                    <Text fontSize="sm" color="gray.500">
                      {uw.numBlocksInNeighborhood} manzanas
                    </Text>
                  )}
                  <Flex mt={2} gap={3} flexWrap="wrap">
                    <Button
                      bg="#1A865F"
                      color="white"
                      _hover={{ bg: "teal.500" }}
                      minW="450px"
                      onClick={() => handleNavigate(uw.neighborhoodId)}
                    >
                      Ver detalle unidad de trabajo #{uw.idUnitWork} y gestionar campañas
                    </Button>
                    <Button
                      bg="#1A865F"
                      color="white"
                      _hover={{ bg: "teal.500" }}
                      minW="400px"
                      onClick={() =>
                        navigate(`/treelist/${idProject}/${uw.idUnitWork}`, {
                          state: {
                            idUnitWork: uw.idUnitWork,
                            projectName,
                            neighborhoodName: uw.neighborhoodName,
                            neighborhoodId: uw.neighborhoodId,
                            cityName: uw.cityName,
                            provinceName: uw.provinceName,
                            numBlocksInNeighborhood: uw.numBlocksInNeighborhood,
                          },
                        })
                      }
                    >
                      Listar Árboles pertenecientes a la Unidad de trabajo
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirmar Eliminación"
          confirmLabel="Eliminar"
          confirmColorScheme="red"
          onConfirm={handleConfirmDelete}
        >
          ¿Está seguro de que desea eliminar las unidades de trabajo? Esta acción no se puede
          deshacer.
        </ConfirmModal>
      </VStack>
    </Box>
  );
};

export default ManageUnitWorks;
