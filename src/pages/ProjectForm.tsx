import React, { forwardRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Style.css";
import { getAllProvinces, getCitiesByProvinceId } from "../services/UserService";
import {
  FieldRoot,
  FieldLabel,
  Flex,
  Stack,
  Heading,
  Text,
  Textarea,
  Box,
  Input,
  Button,
  SimpleGrid,
  IconButton,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { createProject, getProjectById, updateProjectById } from "../services/ProjectService";
import { useAuth } from "../context/authContext";
import { toaster } from "../utils/toaster";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from "date-fns";
import DatePicker from "react-datepicker";
import { FaCalendar } from "react-icons/fa";

// Chakra UI v3: FieldLabel children type is missing in TS definitions — use cast.
const FL = FieldLabel as any;

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { idUser: paramIdUser, idProject } = useParams<{
    idUser?: string;
    idProject?: string;
  }>();

  const [formData, setFormData] = useState({
    projectName: "",
    userId: "",
    projectDescription: "",
    startDate: "",
    endDate: "",
    projectType: "muestreo",
  });

  const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
  const [province, setProvince] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [city, setCity] = useState<{ label: string; value: string } | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const idUser = paramIdUser || user?.idUser;

    if (!idUser) {
      alert("No se encontró el ID de usuario.");
      navigate("/login");
    }
  }, [paramIdUser, user, navigate]);
  useEffect(() => {
    setIsFormValid(
      formData.projectName.trim() !== "" &&
        formData.startDate.trim() !== "" &&
        formData.projectType.trim() !== "" &&
        province !== null &&
        city !== null,
    );
  }, [formData, province, city]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getAllProvinces();
        const formattedProvinces = response.map((prov: { provinceName: any }) => ({
          label: prov.provinceName,
          value: prov.provinceName, // Ahora usamos provinceName
        }));
        setProvinces(formattedProvinces);
      } catch (error) {
        console.error("Error al obtener provincias:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!idProject) return;
      try {
        const projectData = await getProjectById(Number(idProject));
        setFormData({
          projectName: projectData.projectName || "",
          projectDescription: projectData.projectDescription || "",
          startDate: projectData.startDate?.split("T")[0] || "",
          endDate: projectData.endDate?.split("T")[0] || "",
          projectType: projectData.projectType,
          userId: projectData.userId || "",
        });

        if (projectData.provinceName) {
          const provinceOption = {
            label: projectData.provinceName,
            value: projectData.provinceName,
          };
          setProvince(provinceOption);

          const cityOption = {
            label: projectData.cityName,
            value: projectData.cityName,
          };
          setCity(cityOption);
        } else {
          setProvince(null);
          setCities([]);
          setCity(null);
        }
      } catch (error) {
        console.error("Error al obtener datos del proyecto:", error);
      }
    };
    fetchProjectData();
  }, [idProject]);

  useEffect(() => {
    if (province) {
      const fetchCities = async () => {
        try {
          const citiesForProvince = await getCitiesByProvinceId(province.value);
          setCities(
            citiesForProvince.map((city: { cityName: string }) => ({
              label: city.cityName,
              value: city.cityName,
            })),
          );
        } catch (error) {
          console.error("Error al obtener ciudades:", error);
          setCities([]); // Reseteamos las ciudades en caso de error
        }
      };

      fetchCities();
    }
  }, [province]); // Este useEffect se ejecuta cuando 'province' cambia

  useEffect(() => {
    setIsFormValid(
      formData.projectName.trim() !== "" &&
        formData.startDate.trim() !== "" &&
        formData.projectType.trim() !== "" &&
        province !== null &&
        city !== null,
    );
  }, [formData, province, city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const idUser = user?.idUser;
    if (!idUser) {
      toaster.create({
        title: "Error",
        description: "No se pudo modificar proyecto.",
        type: "error",
        duration: 5000,
      });
      return;
    }

    const projectData = {
      ...formData,
      userId: idUser,
      projectType: formData.projectType,
      cityName: city ? city.label : "",
      provinceName: province ? province.label : "",
      endDate: formData.endDate || null,
    };

    try {
      if (idProject) {
        await updateProjectById(Number(idProject), projectData);
        toaster.create({
          title: "Proyecto actualizado",
          description: `Proyecto ID ${idProject} actualizado exitosamente.`,
          type: "success",
          duration: 5000,
        });
      } else {
        await createProject(projectData);
        toaster.create({
          title: "Proyecto guardado",
          description: "El proyecto se ha guardado exitosamente.",
          type: "success",
          duration: 5000,
        });
      }
      navigate("/home");
    } catch (error) {
      console.error("Error al procesar el proyecto:", error);
      toaster.create({
        title: "Error",
        description: "Hubo un error. Inténtalo nuevamente.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const CustomDateInput = forwardRef<HTMLInputElement, any>(({ value, onClick }, ref) => (
    <Box position="relative">
      <Input value={value} onClick={onClick} readOnly ref={ref} pr="3rem" />
      <Box position="absolute" right={2} top="50%" style={{ transform: "translateY(-50%)" }}>
        <IconButton
          aria-label="Seleccionar fecha"
          size="sm"
          onClick={onClick}
          variant="ghost"
          tabIndex={-1}
        >
          <FaCalendar />
        </IconButton>
      </Box>
    </Box>
  ));

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        background: "#EFF2F9",
        padding: "1rem 0",
      }}
    >
      <Box w="90vw" maxW="700px" mx="auto">
        <Heading as="h1" size="lg" textAlign="center" color="teal.600" fontFamily="Raleway" mb={4}>
          {idProject ? "Editar Proyecto" : "Crear nuevo proyecto"}
        </Heading>

        <Stack gap={3}>
          {/* Grupo 1: Info básica */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.500" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Información básica
              </Text>
            </Box>
            <Box px={5} py={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <FieldRoot required>
                  <FL>Nombre del proyecto</FL>
                  <Input
                    placeholder="Ej: Arbolado Urbano 2025"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </FieldRoot>

                <FieldRoot required>
                  <FL>Tipo de proyecto</FL>
                  <NativeSelectRoot disabled={!!idProject}>
                    <NativeSelectField
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    >
                      <option value="muestreo">Muestreo</option>
                      <option value="individual">Individual</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>

              <FieldRoot mt={3}>
                <FL>Descripción</FL>
                <FieldRoot>
                  <Textarea
                    placeholder="Descripción del proyecto"
                    value={formData.projectDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDescription: e.target.value,
                      })
                    }
                    resize="vertical"
                    minH="120px"
                    bg="gray.50"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "teal.400",
                      boxShadow: "0 0 0 1px teal.400",
                    }}
                    _hover={{
                      borderColor: "teal.300",
                    }}
                    _placeholder={{ color: "gray.400" }}
                  />
                </FieldRoot>
              </FieldRoot>
            </Box>
          </Box>
          {/* Grupo 2: Fechas */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.400" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Fechas
              </Text>
            </Box>
            <Box px={5} py={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }}>
                <FieldRoot required>
                  <FL>Fecha de inicio</FL>
                  <DatePicker
                    selected={formData.startDate ? parseISO(formData.startDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const iso = date.toISOString().split("T")[0];
                        setFormData((prev) => ({
                          ...prev,
                          startDate: iso,
                          endDate: prev.endDate && iso > prev.endDate ? "" : prev.endDate,
                        }));
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar fecha"
                    customInput={<CustomDateInput />}
                    popperProps={{ strategy: "fixed" }}
                  />
                </FieldRoot>

                <FieldRoot>
                  <FL>Fecha de finalización</FL>
                  <DatePicker
                    selected={formData.endDate ? parseISO(formData.endDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const iso = date.toISOString().split("T")[0];
                        setFormData((prev) => ({ ...prev, endDate: iso }));
                      }
                    }}
                    minDate={formData.startDate ? parseISO(formData.startDate) : undefined}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar fecha"
                    customInput={<CustomDateInput />}
                    popperProps={{ strategy: "fixed" }}
                  />
                </FieldRoot>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Grupo 3: Tipo y ubicación */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.300" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Tipo y ubicación
              </Text>
            </Box>
            <Box px={5} py={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FieldRoot required>
                  <FL>Provincia</FL>
                  <NativeSelectRoot disabled={!!idProject}>
                    <NativeSelectField
                      value={province?.value || ""}
                      onChange={(e) => {
                        const selected = provinces.find((p) => p.value === e.target.value) || null;
                        setProvince(selected);
                        setCity(null);
                        setCities([]);
                      }}
                    >
                      <option value="">Seleccione una provincia</option>
                      {provinces.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>

                <FieldRoot required>
                  <FL>Ciudad</FL>
                  <NativeSelectRoot disabled={!!idProject || !province}>
                    <NativeSelectField
                      value={city?.value || ""}
                      onChange={(e) => {
                        const selected = cities.find((c) => c.value === e.target.value) || null;
                        setCity(selected);
                      }}
                    >
                      <option value="">Seleccione una ciudad</option>
                      {cities.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Botones */}
          <Flex justify="center" wrap="wrap" gap={3} pb={2}>
            <Button
              bg="#1A865F"
              color="white"
              _hover={{ bg: "teal.500" }}
              type="submit"
              size="md"
              minW="140px"
              disabled={!isFormValid}
            >
              {idProject ? "Actualizar" : "Crear"}
            </Button>
            <Button
              bg="white"
              color="gray.600"
              variant="outline"
              _hover={{
                bg: "teal.50",
                color: "teal.700",
                borderColor: "teal.300",
              }}
              size="md"
              minW="140px"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </Flex>
        </Stack>
      </Box>
    </form>
  );
};

export default ProjectForm;
