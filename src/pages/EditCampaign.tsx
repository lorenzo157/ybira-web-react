import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  patchCampaign,
  getCampaign,
  deleteCampaign,
  getCalculate,
} from "../services/UnitWorkService";
import { ReadUnitWorkDto } from "../types/UnitWork";
import {
  Box,
  Button,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Input,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";
import { toaster } from "../utils/toaster";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import "./Style.css";

const EditCampaign: React.FC = () => {
  const { idCampaign } = useParams<{ idCampaign: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const idUnitWork: number = location.state?.idUnitWork;
  const [campaignData, setCampaignData] = useState<ReadUnitWorkDto | null>(null);
  const [updateCampaignValues, setUpdateCampaignValues] = useState<Record<string, number>>({});
  const [campaignDescription, setCampaignDescription] = useState("");
  const [remainWork, setRemainWork] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [data, remain] = await Promise.all([
          getCampaign(Number(idCampaign)),
          idUnitWork ? getCalculate(0, idUnitWork) : Promise.resolve({}),
        ]);
        setCampaignData(data);
        setCampaignDescription(data.campaignDescription ?? "");
        setUpdateCampaignValues(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}));
        setRemainWork(remain ?? {});
      } catch (err) {
        setError("Error al obtener los datos de la campaña.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [idCampaign, idUnitWork]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateCampaignValues((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSave = async () => {
    try {
      await patchCampaign(Number(idCampaign), {
        ...updateCampaignValues,
        campaignDescription,
      });
      toaster.create({ title: "Modificación guardada", type: "success", duration: 3000 });
      navigate(-1);
    } catch (error) {
      toaster.create({ title: "Error al modificar", type: "error", duration: 3000 });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCampaign(Number(idCampaign));
      toaster.create({ title: "Campaña eliminada", type: "success", duration: 3000 });
      navigate(-1);
    } catch (error) {
      toaster.create({ title: "Error al eliminar", type: "error", duration: 3000 });
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading)
    return (
      <Box minH="100vh" bg="#EFF2F9" display="flex" alignItems="center" justifyContent="center">
        <Text fontFamily="Raleway" color="teal.600">
          Cargando datos de la campaña...
        </Text>
      </Box>
    );

  if (error)
    return (
      <Box minH="100vh" bg="#EFF2F9" display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );

  const intervenciones = [
    { label: "Poda (Formación)", key: "pruningTraining" },
    { label: "Poda (Sanitaria)", key: "pruningSanitary" },
    { label: "Poda (Reducción de altura)", key: "pruningHeightReduction" },
    { label: "Poda (Raleo de ramas)", key: "pruningBranchThinning" },
    { label: "Poda (Despeje de señalética)", key: "pruningSignClearing" },
    { label: "Poda (Despeje de conductores eléctricos)", key: "pruningPowerLineClearing" },
    { label: "Poda (Radicular + uso de deflectores)", key: "pruningRootDeflectors" },
    { label: "Cableado", key: "cabling" },
    { label: "Restringir acceso", key: "restrictAccess" },
    { label: "Mover el blanco", key: "moveTarget" },
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

  return (
    <Box minH="100vh" bg="#EFF2F9" p={6}>
      <Box maxW="1000px" mx="auto">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={8}>
          Editar Campaña
        </Heading>

        {/* Description card */}
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
            <Text fontWeight="semibold" fontSize="md" color="white" fontFamily="Raleway">
              Información general — ID: {idCampaign}
            </Text>
          </Box>
          <Box px={6} py={4}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold" mb={1}>
              Descripción de la campaña
            </Text>
            <Input
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="Descripción de la campaña"
              bg="gray.50"
              borderColor="gray.300"
              borderRadius="lg"
              _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
            />
          </Box>
        </Box>

        {/* Interventions table card */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          mb={6}
        >
          <Box bg="teal.400" px={6} py={3}>
            <Text fontWeight="semibold" fontSize="md" color="white" fontFamily="Raleway">
              Intervenciones
            </Text>
          </Box>
          <Box overflow="auto">
            <TableRoot variant="outline" size="sm">
              <TableHeader bg="teal.50">
                <TableRow>
                  <TableColumnHeader
                    color="teal.700"
                    fontFamily="Raleway"
                    fontWeight="semibold"
                    py={3}
                    pl={6}
                  >
                    Intervención
                  </TableColumnHeader>
                  <TableColumnHeader
                    color="teal.700"
                    fontFamily="Raleway"
                    fontWeight="semibold"
                    textAlign="center"
                  >
                    Realizadas
                  </TableColumnHeader>
                  <TableColumnHeader
                    color="teal.700"
                    fontFamily="Raleway"
                    fontWeight="semibold"
                    textAlign="center"
                  >
                    Nuevos datos
                  </TableColumnHeader>
                  <TableColumnHeader
                    color="teal.700"
                    fontFamily="Raleway"
                    fontWeight="semibold"
                    textAlign="center"
                  >
                    Total
                  </TableColumnHeader>
                  <TableColumnHeader
                    color="teal.700"
                    fontFamily="Raleway"
                    fontWeight="semibold"
                    textAlign="center"
                    pr={6}
                  >
                    Trabajo Restante
                  </TableColumnHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intervenciones.map(({ label, key }, i) => {
                  const current = Number(campaignData?.[key as keyof ReadUnitWorkDto]) || 0;
                  const added = Number(updateCampaignValues[key]) || 0;
                  return (
                    <TableRow key={key} bg={i % 2 === 0 ? "white" : "gray.50"}>
                      <TableCell fontWeight="medium" fontSize="sm" color="gray.700" pl={6} py={2.5}>
                        {label}
                      </TableCell>
                      <TableCell textAlign="center" fontSize="sm" color="gray.600">
                        {current}
                      </TableCell>
                      <TableCell textAlign="center" py={2}>
                        <Input
                          type="number"
                          name={key}
                          value={updateCampaignValues[key] || 0}
                          onChange={handleInputChange}
                          size="sm"
                          w="80px"
                          mx="auto"
                          display="block"
                          borderColor="teal.300"
                          borderRadius="md"
                          textAlign="center"
                          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal" }}
                        />
                      </TableCell>
                      <TableCell textAlign="center">
                        <Text
                          fontSize="sm"
                          fontWeight={added !== 0 ? "bold" : "normal"}
                          color={added !== 0 ? "teal.600" : "gray.700"}
                        >
                          {current + added}
                        </Text>
                      </TableCell>
                      <TableCell textAlign="center" pr={6}>
                        {(() => {
                          const remaining = (Number(remainWork[key]) || 0) - added;
                          return (
                            <Text
                              fontSize="sm"
                              fontWeight={remaining < 0 ? "semibold" : "normal"}
                              color={remaining < 0 ? "red.500" : "gray.700"}
                            >
                              {remaining}
                            </Text>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableRoot>
          </Box>
        </Box>

        {/* Action buttons */}
        <Flex justify="flex-end" gap={3}>
          <Button
            fontFamily="Raleway"
            bg="red.50"
            color="red.600"
            border="1px solid"
            borderColor="red.200"
            _hover={{ bg: "red.100" }}
            px={6}
            minW="120px"
            onClick={() => setIsModalOpen(true)}
          >
            Eliminar
          </Button>
          <Button
            fontFamily="Raleway"
            variant="outline"
            borderColor="gray.300"
            color="gray.600"
            _hover={{ bg: "gray.50" }}
            px={6}
            minW="120px"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            fontFamily="Raleway"
            bg="#1A865F"
            color="white"
            _hover={{ bg: "teal.500" }}
            px={6}
            minW="140px"
            onClick={handleSave}
          >
            Guardar cambios
          </Button>
        </Flex>
      </Box>

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

export default EditCampaign;
