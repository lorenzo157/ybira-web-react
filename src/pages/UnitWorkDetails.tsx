import React, { useEffect, useState } from "react";
import {
  getCampaignByIdUnitWork,
  getCalculate,
  getStandardDeviation,
  getMeanOfTreesInBlockByNeighborhood,
  getQtyOfTreesInPopulation,
  deleteCampaign,
  createCampaign,
} from "../services/UnitWorkService";
import { useLocation, useNavigate } from "react-router-dom";
import "./Style.css";
import {
  Box,
  VStack,
  Heading,
  Text,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Button,
  HStack,
  Badge,
  FieldRoot,
  FieldLabel,
  Input,
} from "@chakra-ui/react";
import { toaster } from "../utils/toaster";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

const FL = FieldLabel as any;

const UnitWorkDetails: React.FC<{}> = () => {
  const location = useLocation();
  const selectedUnitWork = location.state?.selectedUnitWork || {};
  const idUnitWork = selectedUnitWork.idUnitWork;
  const navigate = useNavigate();
  const [idProject] = useState<number>(selectedUnitWork?.projectId || 0);
  const [stDev, setstDev] = useState<number>(0);
  const [mean, setMean] = useState<number>(0);
  const [qtyOfTreesInPopulation, setQtyOfTreesInPopulation] = useState<number>(0);
  const [remainWork, setRemainWork] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignDescription, setCampaignDescription] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

  const datosTabla = [
    { label: "Poda (Formación)", key: "pruningTraining" },
    { label: "Poda (Sanitaria)", key: "pruningSanitary" },
    { label: "Poda (Reducción de altura)", key: "pruningHeightReduction" },
    { label: "Poda (Raleo de ramas)", key: "pruningBranchThinning" },
    { label: "Poda (Despeje de señalética)", key: "pruningSignClearing" },
    { label: "Poda (Despeje de conductores eléctricos)", key: "pruningPowerLineClearing" },
    { label: "Poda (Radicular + uso de deflectores)", key: "pruningRootDeflectors" },
    { label: "Mover el blanco", key: "moveTarget" },
    { label: "Restringir acceso", key: "restrictAccess" },
    { label: "Cableado", key: "cabling" },
    { label: "Sujeción", key: "fastening" },
    { label: "Apuntalamiento", key: "propping" },
    { label: "Aumentos de superficie permeable", key: "permeableSurfaceIncreases" },
    { label: "Fertilizaciones", key: "fertilizations" },
    { label: "Descompresión", key: "descompression" },
    { label: "Drenajes", key: "drains" },
    { label: "Extracciones", key: "extractions" },
    { label: "Plantaciones", key: "plantations" },
    { label: "Aperturas de cazuela", key: "openingsPot" },
    { label: "Inspecciones avanzadas", key: "advancedInspections" },
  ];

  const fetchCampaigns = async () => {
    try {
      if (idUnitWork) {
        const data = await getCampaignByIdUnitWork(Number(idUnitWork));
        setCampaigns(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar las campañas:", error);
    }
  };

  const fetchRemainWork = async () => {
    try {
      if (idProject && idUnitWork) {
        const trabajo = await getCalculate(Number(idProject), Number(idUnitWork));
        setRemainWork(trabajo);
      }
    } catch (error) {
      console.error("Error al cargar el trabajo restante:", error);
    }
  };

  const fetchQtyOfTreesInPopulation = async () => {
    try {
      if (idProject && idUnitWork) {
        const qty = await getQtyOfTreesInPopulation(Number(idProject), Number(idUnitWork));
        setQtyOfTreesInPopulation(qty);
      }
    } catch (error) {
      console.error("Error al obtener la cantidad de árboles en la población:", error);
    }
  };

  const fetchMeanOfTreesInBlockByNeighborhood = async () => {
    try {
      if (idProject && idUnitWork) {
        const m = await getMeanOfTreesInBlockByNeighborhood(Number(idProject), Number(idUnitWork));
        setMean(m);
      }
    } catch (error) {
      console.error("Error al obtener la desviación estándar:", error);
    }
  };

  const fetchStDev = async () => {
    try {
      if (idProject && idUnitWork) {
        const sd = await getStandardDeviation(Number(idProject), Number(idUnitWork));
        setstDev(sd);
      }
    } catch (error) {
      console.error("Error al obtener la desviación estándar:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (idProject) {
      fetchCampaigns();
      fetchRemainWork();
      fetchStDev();
      fetchMeanOfTreesInBlockByNeighborhood();
      fetchQtyOfTreesInPopulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProject, idUnitWork]);

  const handleCrearCampaña = async () => {
    if (!campaignDescription.trim()) {
      toaster.create({ title: "La descripción es obligatoria.", type: "error", duration: 3000 });
      return;
    }
    try {
      await createCampaign(Number(idProject), Number(idUnitWork), campaignDescription);
      setCampaignDescription("");
      await fetchCampaigns();
      toaster.create({ title: "Campaña creada.", type: "success", duration: 3000 });
    } catch (error) {
      console.error("Error al crear la campaña:", error);
      toaster.create({ title: "Error al crear la campaña.", type: "error", duration: 3000 });
    }
  };

  const handleModificar = (idCampaign: number) => {
    navigate(`/editcampaign/${idCampaign}`, {
      state: { idUnitWork: Number(idUnitWork), selectedUnitWork },
    });
  };

  const handleEliminar = async (idCampaign: number) => {
    try {
      await deleteCampaign(idCampaign);
      await fetchCampaigns();
      toaster.create({
        title: "Campaña eliminada.",
        description: `La campaña ID ${idCampaign} fue eliminada exitosamente.`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al eliminar la campaña:", error);
      toaster.create({
        title: "Error al eliminar.",
        description: "Hubo un problema al eliminar la campaña. Intente nuevamente.",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (campaignToDelete !== null) {
      handleEliminar(campaignToDelete);
      setIsModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  return (
    <Box w="100%" minH="100vh" bg="#EFF2F9" p={8}>
      <VStack gap={6} align="center">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={2}>
          Unidad de Trabajo ID: {selectedUnitWork.idUnitWork}
        </Heading>
        <HStack>
          <Text fontSize="lg" color="teal.800">
            <strong>Barrio:</strong> {selectedUnitWork.neighborhoodName}
          </Text>
          <Text fontSize="lg" color="gray.700">
            <strong>Cantidad de árboles en el barrio:</strong> {qtyOfTreesInPopulation}
          </Text>
        </HStack>
        <Text fontSize="lg" color="gray.700">
          Promedio de Árboles en cada manzana: <strong>{mean}</strong> — Desviación Estándar:{" "}
          <strong>{stDev}</strong>
        </Text>
        {/* Main content: table left, campaigns right */}
        <Box
          w="100%"
          display="flex"
          flexDirection={{ base: "column", lg: "row" }}
          gap={6}
          alignItems="flex-start"
        >
          {/* Intervenciones table */}
          <Box
            flex="1"
            minW="0"
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Box bg="teal.400" px={6} py={3} flexShrink={0}>
              <Text fontWeight="semibold" fontSize="md" color="white" fontFamily="Raleway">
                Intervenciones
              </Text>
            </Box>
            <Box overflowX="auto">
              <TableRoot variant="outline" size="md">
                <TableHeader bg="teal.50">
                  <TableRow>
                    <TableColumnHeader
                      color="teal.700"
                      fontWeight="semibold"
                      fontSize="md"
                      py={3}
                      pl={5}
                    >
                      Intervención
                    </TableColumnHeader>
                    <TableColumnHeader
                      color="teal.700"
                      fontWeight="semibold"
                      fontSize="md"
                      textAlign="center"
                    >
                      Trabajo Inicial
                    </TableColumnHeader>
                    {campaigns.map((c) => (
                      <TableColumnHeader
                        key={c.idUnitWork ?? c.idCampaign}
                        color="teal.700"
                        fontWeight="semibold"
                        fontSize="md"
                        textAlign="center"
                        px={4}
                        maxW="140px"
                      >
                        <Text
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          maxW="120px"
                          mx="auto"
                          title={
                            c.campaignDescription || `Campaña #${c.idUnitWork ?? c.idCampaign}`
                          }
                        >
                          {c.campaignDescription || `Campaña #${c.idUnitWork ?? c.idCampaign}`}
                        </Text>
                      </TableColumnHeader>
                    ))}
                    <TableColumnHeader
                      color="teal.700"
                      fontWeight="semibold"
                      fontSize="md"
                      textAlign="center"
                      pr={5}
                    >
                      Trabajo Restante
                    </TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosTabla.map(({ label, key }, i) => {
                    const initial = selectedUnitWork?.[key] ?? 0;
                    const remaining = remainWork?.[key] ?? "-";
                    return (
                      <TableRow key={key} bg={i % 2 === 0 ? "white" : "gray.50"}>
                        <TableCell fontWeight="medium" fontSize="md" color="gray.700" pl={5} py={3}>
                          {label}
                        </TableCell>
                        <TableCell textAlign="center" fontSize="md" color="gray.600" py={3}>
                          {initial}
                        </TableCell>
                        {campaigns.map((c) => {
                          const val = c[key] ?? 0;
                          return (
                            <TableCell
                              key={c.idUnitWork ?? c.idCampaign}
                              textAlign="center"
                              fontSize="md"
                              color={val > 0 ? "green.600" : ""}
                              fontWeight={val > 0 ? "bold" : "normal"}
                              py={3}
                            >
                              {val}
                            </TableCell>
                          );
                        })}
                        <TableCell
                          textAlign="center"
                          fontSize="md"
                          color={Number(remaining) > 0 ? "red.500" : "green.600"}
                          fontWeight={"bold"}
                          pr={5}
                          py={3}
                        >
                          {remaining}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableRoot>
            </Box>{" "}
            {/* end scroll wrapper */}
          </Box>
          {/* Right column: create + list */}
          <VStack gap={6} w={{ base: "100%", lg: "480px" }} flexShrink={0} align="stretch">
            {/* Create campaign */}
            <Box
              w="100%"
              bg="white"
              rounded="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
            >
              <Box bg="teal.500" px={6} py={3}>
                <Text fontWeight="semibold" fontSize="md" color="white" fontFamily="Raleway">
                  Crear Nueva Campaña
                </Text>
              </Box>
              <Box px={6} py={5}>
                <FieldRoot mb={4}>
                  <FL fontSize="xs" color="gray.500" fontWeight="semibold" mb={1}>
                    Descripción de la campaña
                  </FL>
                  <Input
                    placeholder="Ingrese la descripción"
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    bg="gray.50"
                    borderColor="gray.300"
                    borderRadius="lg"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
                  />
                </FieldRoot>
                <Button
                  bg="#1A865F"
                  color="white"
                  _hover={{ bg: "teal.500" }}
                  onClick={handleCrearCampaña}
                  px={8}
                  minW="160px"
                  fontFamily="Raleway"
                >
                  Crear Campaña
                </Button>
              </Box>
            </Box>

            {/* Campaign list */}
            <Box
              w="100%"
              bg="white"
              rounded="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
            >
              <Box bg="teal.400" px={6} py={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="md" color="white" fontFamily="Raleway">
                    Listado de campañas
                  </Text>
                  <Badge bg="white" color="teal.700" px={2} rounded="full">
                    {campaigns.length}
                  </Badge>
                </HStack>
              </Box>
              <Box px={6} py={5}>
                {campaigns.length > 0 ? (
                  <VStack align="stretch" gap={3}>
                    {campaigns.map((campaign) => (
                      <Box
                        key={campaign.idUnitWork ?? campaign.idCampaign}
                        bg="gray.50"
                        rounded="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        px={4}
                        py={3}
                      >
                        <HStack justify="space-between" align="center">
                          <Box>
                            <HStack gap={2} mb={0.5}>
                              <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                                {campaign.campaignDescription}
                              </Text>
                              <Text fontSize="10px" color="gray.400">
                                #{campaign.idUnitWork ?? campaign.idCampaign}
                              </Text>
                            </HStack>
                          </Box>
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              bg="#1A865F"
                              color="white"
                              _hover={{ bg: "teal.500" }}
                              px={4}
                              minW="100px"
                              onClick={() =>
                                handleModificar(campaign.idUnitWork ?? campaign.idCampaign)
                              }
                            >
                              Modificar
                            </Button>
                            <Button
                              size="sm"
                              bg="red.50"
                              color="red.600"
                              border="1px solid"
                              borderColor="red.200"
                              _hover={{ bg: "red.100" }}
                              px={4}
                              minW="100px"
                              onClick={() => {
                                setCampaignToDelete(campaign.idUnitWork ?? campaign.idCampaign);
                                setIsModalOpen(true);
                              }}
                            >
                              Eliminar
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No hay campañas creadas para esta unidad de trabajo.
                  </Text>
                )}
              </Box>
            </Box>
          </VStack>{" "}
          {/* end right column */}
        </Box>{" "}
        {/* end flex row */}
      </VStack>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Eliminación"
        confirmLabel="Eliminar"
        confirmColorScheme="red"
        onConfirm={handleConfirmDelete}
      >
        ¿Estás seguro de que deseas eliminar esta campaña? Esta acción no se puede deshacer.
      </ConfirmModal>
    </Box>
  );
};

export default UnitWorkDetails;
