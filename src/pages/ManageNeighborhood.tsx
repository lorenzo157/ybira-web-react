import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  FieldRoot,
  FieldLabel,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  VStack,
  HStack,
  Text,
  Flex,
  Heading,
  Badge,
} from "@chakra-ui/react";
import {
  getAllProvinces,
  getCitiesByProvinceId,
  createNeighborhood,
  getAllNeighborhoods,
  deleteNeighborhood,
} from "../services/UserService";
import { toaster } from "../utils/toaster";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { Coordinate } from "../types/Location/Coordinate";
import { MapComponent } from "../components/Map/MapComponent";
import { Neighborhood } from "../types/Neighborhood";

const FL = FieldLabel as any;

export default function ManageNeighborhood() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [province, setProvince] = useState<string>("");
  const [city, setCiudad] = useState<string>("");
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [numBlocksInNeighborhood, setNumBlocksInNeighborhood] = useState<number | null>(null);
  const mapRef = useRef(null);
  /** Full neighborhood list with coordinates — always shown on map */
  const [mapNeighborhoods, setMapNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodToDelete, setNeighborhoodToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const onDeleteOpen = () => setIsDeleteOpen(true);
  const onDeleteClose = () => setIsDeleteOpen(false);
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState<Set<number>>(new Set());
  const toggleCoordinates = (id: number) =>
    setExpandedNeighborhoods((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getAllProvinces();
        setProvinces(
          response.map((prov: { provinceName: string }) => ({
            label: prov.provinceName,
            value: prov.provinceName,
          })),
        );
      } catch (error) {
        console.error("Error al obtener provincias:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (province) {
        try {
          const data = await getCitiesByProvinceId(province);
          setCities(
            data.map((c: { cityName: string }) => ({ label: c.cityName, value: c.cityName })),
          );
        } catch {
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [province]);

  // Load ALL neighborhoods on mount so they're visible on the map immediately
  const refreshMapNeighborhoods = async () => {
    try {
      const data = await getAllNeighborhoods();
      setMapNeighborhoods(
        data.map((n: any) => ({
          idNeighborhood: n.idNeighborhood,
          neighborhoodName: n.neighborhoodName,
          numBlocksInNeighborhood: n.numBlocksInNeighborhood,
          cityName: n.cityName,
          provinceName: n.provinceName,
          coordinates: Array.isArray(n.coordinates)
            ? n.coordinates.map((c: any) => ({
                latitude: parseFloat(c.latitude),
                longitude: parseFloat(c.longitude),
              }))
            : [],
        })),
      );
    } catch {
      setMapNeighborhoods([]);
    }
  };

  useEffect(() => {
    refreshMapNeighborhoods();
  }, []);

  // --- Map click: add vertex ---
  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates((prev) => [...prev, { latitude: lat, longitude: lng }]);
  };

  const handleDeleteCoordinate = (index: number) => {
    setCoordinates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUndoLast = () => {
    setCoordinates((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!neighborhoodName || !city || !province || coordinates.length < 3) {
      toaster.create({
        title: "Error",
        description:
          coordinates.length < 3
            ? "Agrega al menos 3 puntos en el mapa para definir el límite del barrio."
            : "Por favor, completa todos los campos.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (numBlocksInNeighborhood === null || numBlocksInNeighborhood <= 0) {
      toaster.create({
        title: "Error",
        description: "Ingrese un número válido para la cantidad de manzanas.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    onOpen();
  };

  const handleConfirmarGuardar = async () => {
    onClose();

    const neighborhoodData = {
      neighborhoodName,
      numBlocksInNeighborhood: numBlocksInNeighborhood || 0,
      provinceName: province,
      cityName: city,
      coordinates: coordinates.map((c) => ({ latitude: c.latitude, longitude: c.longitude })),
    };

    try {
      await createNeighborhood(neighborhoodData);
      toaster.create({
        title: "Éxito",
        description: "Barrio guardado correctamente.",
        type: "success",
        duration: 3000,
      });
      // Reset only the drawing fields, keep province/city, refresh map
      setNeighborhoodName("");
      setCoordinates([]);
      setNumBlocksInNeighborhood(null);
      await refreshMapNeighborhoods();
    } catch {
      toaster.create({
        title: "Error",
        description: "Hubo un error al guardar el barrio.",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!neighborhoodToDelete) return;
    onDeleteClose();
    try {
      await deleteNeighborhood(neighborhoodToDelete.id);
      toaster.create({
        title: "Barrio eliminado",
        description: `"${neighborhoodToDelete.name}" fue eliminado correctamente.`,
        type: "success",
        duration: 3000,
      });
      await refreshMapNeighborhoods();
    } catch {
      toaster.create({
        title: "Error",
        description: "No se pudo eliminar el barrio.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setNeighborhoodToDelete(null);
    }
  };

  const handleCancelar = () => {
    setProvince("");
    setCiudad("");
    setNeighborhoodName("");
    setNumBlocksInNeighborhood(null);
  };

  return (
    <Box bg="#EFF2F9" minH="100vh" py={8} px={{ base: 4, md: 8 }}>
      <VStack gap={4} align="stretch" mb={6} maxW="1500px" mx="auto">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={6}>
          Gestionar Barrios
        </Heading>

        {/* Datos del Barrio */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box bg="teal.500" px={6} py={3}>
            <Text fontWeight="semibold" fontSize="md" color="white">
              Datos del Barrio
            </Text>
          </Box>
          <Box p={6}>
            <VStack gap={4} align="stretch">
              {/* Row 1: Nombre + Cant. Manzanas */}
              <HStack gap={4} wrap="wrap">
                <FieldRoot w={{ base: "100%", md: "48%" }}>
                  <FL>Nombre de Barrio</FL>
                  <Input
                    type="text"
                    placeholder="Ingrese el nombre del barrio"
                    value={neighborhoodName}
                    onChange={(e) => setNeighborhoodName(e.target.value)}
                  />
                </FieldRoot>
                <FieldRoot w={{ base: "100%", md: "48%" }}>
                  <FL>Cant. de Manzanas</FL>
                  <Input
                    type="number"
                    placeholder="Cantidad de manzanas"
                    value={numBlocksInNeighborhood !== null ? numBlocksInNeighborhood : ""}
                    onChange={(e) =>
                      setNumBlocksInNeighborhood(parseInt(e.target.value, 10) || null)
                    }
                  />
                </FieldRoot>
              </HStack>

              {/* Row 2: Provincia + Ciudad */}
              <HStack gap={4} wrap="wrap">
                <FieldRoot w={{ base: "100%", md: "48%" }}>
                  <FL>Provincia</FL>
                  <NativeSelectRoot>
                    <NativeSelectField
                      placeholder="Selecciona una provincia"
                      value={province}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setProvince(e.target.value);
                        setCiudad("");
                      }}
                    >
                      {provinces.map((prov) => (
                        <option key={prov.value} value={prov.value}>
                          {prov.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
                <FieldRoot w={{ base: "100%", md: "48%" }}>
                  <FL>Ciudad</FL>
                  <NativeSelectRoot disabled={!province}>
                    <NativeSelectField
                      placeholder="Selecciona una ciudad"
                      value={city}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCiudad(e.target.value)
                      }
                    >
                      {cities.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </HStack>
            </VStack>
            <Flex justify="flex-end" mt={4}>
              <Button
                bg="white"
                color="red.600"
                border="1px solid"
                borderColor="red.300"
                _hover={{ bg: "red.50" }}
                size="sm"
                minW="140px"
                onClick={handleCancelar}
              >
                Limpiar datos
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* Map — click to add boundary nodes */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box bg="teal.400" px={6} py={3}>
            <Text fontWeight="semibold" fontSize="md" color="white">
              Límite del barrio
            </Text>
          </Box>
          <Box p={6}>
            <HStack mb={3} justify="space-between" wrap="wrap">
              <Text fontSize="sm" color="gray.500">
                Haz clic en el mapa para agregar los vértices del polígono.
                {coordinates.length > 0 && (
                  <>
                    {" "}
                    Se agregaron <strong>{coordinates.length}</strong> punto
                    {coordinates.length !== 1 ? "s" : ""}.{coordinates.length < 3 && " (mínimo 3)"}
                  </>
                )}
              </Text>
              <HStack>
                <Button
                  size="sm"
                  minW="150px"
                  bg="white"
                  color="orange.600"
                  border="1px solid"
                  borderColor="orange.300"
                  _hover={{ bg: "orange.50" }}
                  onClick={handleUndoLast}
                  disabled={coordinates.length === 0}
                >
                  Deshacer último
                </Button>
                <Button
                  size="sm"
                  minW="170px"
                  bg="white"
                  color="red.600"
                  border="1px solid"
                  borderColor="red.300"
                  _hover={{ bg: "red.50" }}
                  onClick={() => setCoordinates([])}
                  disabled={coordinates.length === 0}
                >
                  Limpiar coordenadas
                </Button>
              </HStack>
            </HStack>

            <Box h="100vh" borderRadius="md" overflow="hidden">
              <MapComponent
                mapRef={mapRef}
                center={[-31.6333, -60.7]}
                zoom={13}
                neighborhoods={mapNeighborhoods}
                selectableNeighborhoods={false}
                showTrees={false}
                showMarkers={false}
                showPopup={true}
                onMapClick={handleMapClick}
                drawnCoordinates={coordinates}
              />
            </Box>

            {/* Coordinate list */}
            {coordinates.length > 0 && (
              <Box mt={4} borderWidth="1px" borderRadius="md" p={4} maxH="200px" overflowY="auto">
                <Text fontWeight="bold" mb={2} fontSize="sm">
                  Vértices agregados
                </Text>
                <VStack gap={1} align="stretch">
                  {coordinates.map((coord, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack>
                        <Badge colorScheme="blue" borderRadius="full" px={2}>
                          {index + 1}
                        </Badge>
                        <Text fontSize="sm" fontFamily="mono">
                          {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        bg="transparent"
                        color="red.500"
                        _hover={{ bg: "red.50" }}
                        onClick={() => handleDeleteCoordinate(index)}
                      >
                        ✕
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        </Box>

        {/* Action buttons */}
        <Box mt={6} mb={6} px={{ base: 4, md: 12 }}>
          <Flex direction="row" justify="center" wrap="wrap" gap={4}>
            <Button
              bg="#1A865F"
              color="white"
              _hover={{ bg: "teal.500" }}
              onClick={handleSave}
              minW="160px"
              size="lg"
            >
              Guardar
            </Button>
          </Flex>
        </Box>

        {/* Neighborhood list — manage existing */}
        {mapNeighborhoods.length > 0 && (
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.500" px={6} py={3}>
              <Text fontWeight="semibold" fontSize="md" color="white">
                Barrios existentes
              </Text>
            </Box>
            <Box p={6}>
              <Input
                placeholder="Buscar por ID o nombre..."
                value={neighborhoodSearch}
                onChange={(e) => setNeighborhoodSearch(e.target.value)}
                mb={4}
                size="sm"
              />
              <VStack gap={3} align="stretch">
                {mapNeighborhoods
                  .filter((n) => {
                    const q = neighborhoodSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      n.neighborhoodName.toLowerCase().includes(q) ||
                      String(n.idNeighborhood).includes(q)
                    );
                  })
                  .map((n) => (
                    <Box
                      key={n.idNeighborhood}
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="teal.100"
                    >
                      <Flex
                        align="center"
                        justify="space-between"
                        wrap="wrap"
                        gap={2}
                        px={4}
                        py={3}
                        bg="white"
                        cursor="pointer"
                        onClick={() => toggleCoordinates(n.idNeighborhood)}
                      >
                        <HStack gap={2} flex={1} wrap="wrap">
                          <Text fontWeight="semibold" fontSize="sm" color="teal.700">
                            {n.neighborhoodName}
                          </Text>
                          <Badge
                            bg="gray.100"
                            color="gray.500"
                            borderRadius="md"
                            px={2}
                            fontSize="10px"
                          >
                            ID: {n.idNeighborhood}
                          </Badge>
                          {(n.provinceName || n.cityName) && (
                            <Badge
                              bg="teal.50"
                              color="teal.700"
                              borderRadius="md"
                              px={2}
                              fontSize="10px"
                            >
                              {[n.provinceName, n.cityName].filter(Boolean).join(" — ")}
                            </Badge>
                          )}
                          {n.numBlocksInNeighborhood != null && (
                            <Badge
                              bg="green.50"
                              color="green.700"
                              borderRadius="md"
                              px={2}
                              fontSize="10px"
                            >
                              {n.numBlocksInNeighborhood} manzanas
                            </Badge>
                          )}
                        </HStack>
                        <HStack flexShrink={0} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            minW="80px"
                            bg="white"
                            color="blue.600"
                            border="1px solid"
                            borderColor="blue.300"
                            _hover={{ bg: "blue.50" }}
                            disabled
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            minW="90px"
                            bg="red.500"
                            color="white"
                            _hover={{ bg: "red.600" }}
                            onClick={() => {
                              setNeighborhoodToDelete({
                                id: n.idNeighborhood,
                                name: n.neighborhoodName,
                              });
                              onDeleteOpen();
                            }}
                          >
                            Eliminar
                          </Button>
                        </HStack>
                      </Flex>

                      {expandedNeighborhoods.has(n.idNeighborhood) &&
                        n.coordinates &&
                        n.coordinates.length > 0 && (
                          <Box px={4} pb={3} bg="white" borderTop="1px solid" borderColor="teal.50">
                            <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1}>
                              Coordenadas ({n.coordinates.length} vértices):
                            </Text>
                            <Box
                              maxH="130px"
                              overflowY="auto"
                              bg="gray.50"
                              borderWidth="1px"
                              borderColor="gray.200"
                              borderRadius="md"
                              p={2}
                            >
                              <VStack gap={0} align="stretch">
                                {n.coordinates.map((c: any, i: number) => (
                                  <HStack key={i} gap={2} py="1px">
                                    <Badge
                                      bg="teal.400"
                                      color="white"
                                      borderRadius="full"
                                      px={1}
                                      fontSize="10px"
                                      flexShrink={0}
                                    >
                                      {i + 1}
                                    </Badge>
                                    <Text fontSize="xs" fontFamily="mono" color="gray.700">
                                      {parseFloat(c.latitude).toFixed(6)},{" "}
                                      {parseFloat(c.longitude).toFixed(6)}
                                    </Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </Box>
                          </Box>
                        )}
                    </Box>
                  ))}
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>

      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        title="Confirmar Acción"
        confirmLabel="Confirmar"
        confirmColorScheme="green"
        onConfirm={handleConfirmarGuardar}
      >
        ¿Estás seguro de que deseas guardar los datos del barrio?
      </ConfirmModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Eliminar Barrio"
        confirmLabel="Eliminar"
        confirmColorScheme="red"
        onConfirm={handleConfirmDelete}
      >
        ¿Estás seguro de que deseas eliminar el barrio{" "}
        <strong>"{neighborhoodToDelete?.name}"</strong>? Esta acción no se puede deshacer.
      </ConfirmModal>
    </Box>
  );
}
