import React, { useEffect, useState } from "react";
import { Project } from "../types/Project";
import { getAllProjectsCreatedByUser, deleteProjectById } from "../services/ProjectService";
import { useNavigate } from "react-router-dom";
import "./Style.css";
import { Box, Badge, Button, Text, Flex, Heading, Input, Stack } from "@chakra-ui/react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { toaster } from "../utils/toaster";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "muestreo">(
    () => (sessionStorage.getItem("homeTypeFilter") as "all" | "individual" | "muestreo") ?? "all",
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    () => sessionStorage.getItem("homeSearchQuery") ?? "",
  );

  const filteredProjects = projects.filter((p) => {
    const matchesType = typeFilter === "all" ? true : p.projectType === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || p.projectName.toLowerCase().includes(q) || String(p.idProject).includes(q);
    return matchesType && matchesSearch;
  });

  const handleTypeFilter = (type: "all" | "individual" | "muestreo") => {
    setTypeFilter(type);
    sessionStorage.setItem("homeTypeFilter", type);
  };

  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
    sessionStorage.setItem("homeSearchQuery", value);
  };

  const handleModify = (idProject: number) => {
    navigate(`/editproject/${idProject}`);
  };

  const handleNavigate = (idProject: number) => {
    navigate(`/assignusers/${idProject}`);
  };

  // En Home, modificar la navegación para pasar el nombre del proyecto
  const handleNavigateByProjectType = (
    projectType: string,
    idProject: number,
    idUnitWork?: number,
  ) => {
    const selectedProject = projects.find((project) => project.idProject === idProject);
    if (selectedProject) {
      const projectName = selectedProject.projectName;
      if (projectType === "individual") {
        if (!projectName) {
          toaster.create({
            title: "Error",
            description: `No se encontró el proyecto para el ID ${idProject}`,
            type: "error",
            duration: 5000,
          });
        }
        navigate(`/treelist/${idProject}/0`, {
          state: {
            idUnitWork,
            projectName,
            projectDescription: selectedProject.projectDescription,
            startDate: selectedProject.startDate,
            endDate: selectedProject.endDate,
            projectType: selectedProject.projectType,
            provinceName: selectedProject.provinceName,
            cityName: selectedProject.cityName,
          },
        });
      } else {
        navigate(`/unitworks/${idProject}`, {
          state: { idProject, projectName },
        });
      }
    }
  };

  const handleDelete = async (idProject: number) => {
    try {
      await deleteProjectById(idProject);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.idProject !== idProject),
      );
    } catch (error) {
      setError("Error al eliminar el proyecto.");
      console.error("Error al eliminar el proyecto:", error);
    }
  };

  const openDeleteModal = (id: number) => {
    setProjectToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete !== null) {
      handleDelete(projectToDelete);
      setIsModalOpen(false);
      setProjectToDelete(null);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await getAllProjectsCreatedByUser();
        setProjects(fetchedProjects);
      } catch (error) {
        setError("Error al obtener los proyectos.");
        console.error("Error al obtener los proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const actionBtnStyle = {
    bg: "white",
    color: "teal.700",
    fontFamily: "Raleway",
    fontWeight: "semibold",
    border: "2px solid",
    borderColor: "teal.400",
    borderRadius: "lg",
    px: 8,
    py: 5,
    minW: "160px",
    _hover: { bg: "teal.50", borderColor: "teal.600" },
    boxShadow: "sm",
  };

  const cardBtnStyle = {
    bg: "#1A865F",
    color: "white",
    fontFamily: "Raleway",
    borderRadius: "md",
    px: 5,
    minW: "120px",
    _hover: { bg: "teal.500" },
  };

  return (
    <Box bg="#EFF2F9" minH="100vh" pt={8} pb={4}>
      <Box px={6} maxW="1100px" mx="auto">
        {/* Always-visible header + action bar */}
        <Heading as="h1" size="2xl" textAlign="center" color="teal.700" fontFamily="Raleway" mb={2}>
          Panel de Proyectos
        </Heading>
        <Text textAlign="center" color="gray.500" fontFamily="Raleway" mb={8}>
          Administrá tus proyectos de arbolado urbano
        </Text>

        <Box bg="white" borderRadius="xl" boxShadow="md" px={6} py={4} mb={8}>
          <Flex wrap="wrap" justifyContent="center" gap={3}>
            <Button {...actionBtnStyle} onClick={() => navigate("/formproject")}>
              Crear Proyecto
            </Button>
            <Button {...actionBtnStyle} onClick={() => navigate("/listusers")}>
              Listar Usuarios
            </Button>
            <Button {...actionBtnStyle} onClick={() => navigate("/manageneighborhood")}>
              Gestionar Barrios
            </Button>
            <Button {...actionBtnStyle} onClick={() => navigate("/register")}>
              Registrar Usuario
            </Button>
          </Flex>
        </Box>

        {loading && (
          <Text fontFamily="Raleway" color="gray.500" textAlign="center">
            Cargando proyectos...
          </Text>
        )}
        {error && <Text color="red.500">{error}</Text>}
        {!loading && projects.length === 0 && (
          <Text fontFamily="Raleway" color="gray.500" textAlign="center">
            No hay proyectos asignados para este usuario.
          </Text>
        )}

        {!loading && projects.length > 0 && (
          <>
            {/* Filters */}
            <Flex align="center" gap={3} mb={4} wrap="wrap">
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => handleSearchQuery(e.target.value)}
                fontFamily="Raleway"
                bg="white"
                w="320px"
                borderRadius="md"
                borderColor="gray.300"
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
              />
              <Flex gap={1}>
                {(["all", "individual", "muestreo"] as const).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    px={5}
                    minW="100px"
                    fontFamily="Raleway"
                    borderRadius="full"
                    bg={typeFilter === type ? "teal.600" : "white"}
                    color={typeFilter === type ? "white" : "gray.600"}
                    border="1px solid"
                    borderColor={typeFilter === type ? "teal.600" : "gray.300"}
                    _hover={{ bg: typeFilter === type ? "teal.700" : "gray.50" }}
                    onClick={() => handleTypeFilter(type)}
                  >
                    {type === "all" ? "Todos" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </Flex>
              <Text fontSize="sm" color="gray.400" fontFamily="Raleway" ml="auto">
                {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""}
              </Text>
            </Flex>

            <Stack gap={4}>
              {filteredProjects.map((project) => (
                <Box
                  key={project.idProject}
                  borderRadius="xl"
                  boxShadow="sm"
                  bg="white"
                  fontFamily="Raleway"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.100"
                  _hover={{ boxShadow: "md", borderColor: "teal.200" }}
                  transition="all 0.15s"
                >
                  {/* Card header accent */}
                  <Box
                    bg={project.projectType === "individual" ? "teal.500" : "purple.500"}
                    h="4px"
                  />

                  <Box p={5}>
                    <Flex align="flex-start" justify="space-between" mb={3} wrap="wrap" gap={2}>
                      <Box>
                        <Flex align="center" gap={2} mb={1}>
                          <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            {project.projectName}
                          </Text>
                          <Badge
                            bg={project.projectType === "individual" ? "teal.100" : "purple.100"}
                            color={project.projectType === "individual" ? "teal.700" : "purple.700"}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="semibold"
                            textTransform="capitalize"
                          >
                            {project.projectType}
                          </Badge>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                          ID: {project.idProject}
                        </Text>
                      </Box>
                      <Flex direction="column" align="flex-end" gap={1}>
                        <Text fontSize="sm" color="gray.600">
                          <strong>Inicio:</strong> {formatDate(project.startDate)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>Fin:</strong> {formatDate(project.endDate)}
                        </Text>
                      </Flex>
                    </Flex>

                    {project.projectDescription && (
                      <Text fontSize="sm" color="gray.600" mb={3}>
                        {project.projectDescription}
                      </Text>
                    )}

                    <Flex gap={4} mb={4} wrap="wrap">
                      <Text fontSize="sm" color="gray.500">
                        📍 {project.provinceName} — {project.cityName}
                      </Text>
                    </Flex>

                    {/* Divider */}
                    <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
                      <Flex wrap="wrap" gap={2} align="center">
                        <Button {...cardBtnStyle} onClick={() => handleModify(project.idProject)}>
                          Modificar
                        </Button>
                        <Button
                          bg="red.500"
                          color="white"
                          fontFamily="Raleway"
                          borderRadius="md"
                          px={5}
                          minW="120px"
                          _hover={{ bg: "red.600" }}
                          onClick={() => openDeleteModal(project.idProject)}
                        >
                          Eliminar
                        </Button>
                        <Button {...cardBtnStyle} onClick={() => handleNavigate(project.idProject)}>
                          Gestionar Usuarios
                        </Button>
                        {project.projectType === "muestreo" && (
                          <Button
                            {...cardBtnStyle}
                            onClick={() =>
                              handleNavigateByProjectType(project.projectType, project.idProject)
                            }
                          >
                            Unidades de Trabajo
                          </Button>
                        )}
                        <Button
                          {...cardBtnStyle}
                          onClick={() =>
                            navigate(`/treelist/${project.idProject}/0`, {
                              state: {
                                projectName: project.projectName,
                                projectDescription: project.projectDescription,
                                startDate: project.startDate,
                                endDate: project.endDate,
                                projectType: project.projectType,
                                provinceName: project.provinceName,
                                cityName: project.cityName,
                              },
                            })
                          }
                        >
                          Listar Árboles
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}

        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirmar Eliminación"
          confirmLabel="Eliminar"
          confirmColorScheme="red"
          onConfirm={handleConfirmDelete}
        >
          ¿Desea eliminar el proyecto? Cuidado: se eliminarán también los árboles relacionados.
        </ConfirmModal>
      </Box>
    </Box>
  );
};

export default Home;
