import { FC, useState } from "react";
import { Box, Text, Image, Stack, Flex } from "@chakra-ui/react";
import { Tree } from "../types/Tree";

interface Props {
  tree: Tree;
  isInListPage?: boolean;
}

// Mirrors mobile's InfoRow
function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Flex py={1.5} borderBottom="1px solid" borderColor="gray.100" gap={2} align="baseline">
      <Text fontWeight="bold" color="gray.500" minW="200px" fontSize="sm">
        {label}
      </Text>
      <Text color="gray.800" flex={1} fontSize="sm">
        {value ?? "N/A"}
      </Text>
    </Flex>
  );
}

// Mirrors mobile's SectionHeader
function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <Box px={3} py={2} borderRadius="md" mt={5} mb={2} bg={color}>
      <Text color="white" fontWeight="bold" fontSize="sm">
        {title}
      </Text>
    </Box>
  );
}

// Mirrors mobile's ListItems
function ListItems({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Box py={1.5} borderBottom="1px solid" borderColor="gray.100">
      <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>
        {label}
      </Text>
      {items.map((item, i) => (
        <Text key={i} color="gray.700" fontSize="sm" ml={3}>
          — {item}
        </Text>
      ))}
    </Box>
  );
}

const TreeDetails: FC<Props> = ({ tree }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const resolvePhotoUrl = (path: string) =>
    path.startsWith("http")
      ? path
      : `https://woodedbucket.s3.us-east-1.amazonaws.com/trees_photos/${path}`;

  const handleImageClick = () => {
    setModalImage(resolvePhotoUrl(tree.pathPhoto!));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const content = (
    <Stack gap={0} flex={1}>
      {/* Header */}
      <Box mb={3}>
        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          ID: {tree.idTree}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {tree.address}
        </Text>
      </Box>

      {/* Photo */}
      {tree.pathPhoto ? (
        <Box
          w="100%"
          mb={3}
          borderRadius="lg"
          overflow="hidden"
          bg="white"
          cursor="pointer"
          onClick={handleImageClick}
        >
          <Image
            src={resolvePhotoUrl(tree.pathPhoto)}
            alt="Árbol"
            w="100%"
            maxH="300px"
            objectFit="contain"
          />
        </Box>
      ) : (
        <Flex
          w="100%"
          h="140px"
          mb={3}
          borderRadius="lg"
          bg="gray.100"
          align="center"
          justify="center"
        >
          <Text color="gray.400" fontStyle="italic">
            Sin foto
          </Text>
        </Flex>
      )}

      <InfoRow label="Nivel de riesgo:" value={tree.risk ?? "N/A"} />
      <InfoRow
        label="Fecha de relevo:"
        value={tree.datetime ? new Date(tree.datetime).toLocaleDateString("es-AR") : "N/A"}
      />
      <InfoRow label="Tiempo de relevo:" value={tree.treeInfoCollectionTime ?? "N/A"} />

      {/* Ubicación */}
      <SectionHeader title="Ubicación" color="#1976D2" />
      {!tree.neighborhoodName ? (
        <Text fontSize="sm" color="#E65100" fontWeight="bold" py={1}>
          ⚠️ Sin barrio asignado
        </Text>
      ) : (
        <InfoRow label="Barrio:" value={tree.neighborhoodName} />
      )}
      <InfoRow label="Manzana:" value={tree.cityBlock ?? "N/A"} />
      <InfoRow label="Dirección:" value={tree.address} />
      <InfoRow label="Latitud:" value={tree.latitude} />
      <InfoRow label="Longitud:" value={tree.longitude} />
      {tree.treesInTheBlock != null && (
        <InfoRow label="Árboles en la cuadra:" value={tree.treesInTheBlock} />
      )}

      {/* Características */}
      <SectionHeader title="Características del árbol" color="#388E3C" />
      {tree.isMissing && <InfoRow label="¿Es árbol faltante?" value="Sí" />}
      {tree.isDead && <InfoRow label="¿Está muerto?" value="Sí" />}
      {!tree.isMissing && !tree.isDead && (
        <>
          <InfoRow label="Tipo de árbol:" value={tree.treeTypeName ?? "N/A"} />
          {tree.gender && <InfoRow label="Género:" value={tree.gender} />}
          {tree.species && <InfoRow label="Especie:" value={tree.species} />}
          {tree.scientificName && (
            <InfoRow label="Nombre científico:" value={tree.scientificName} />
          )}
          <InfoRow
            label="Perímetro:"
            value={tree.perimeter != null ? `${tree.perimeter} cm` : "N/A"}
          />
          <InfoRow label="Altura:" value={tree.height != null ? `${tree.height} m` : "N/A"} />
          <InfoRow label="Inclinación:" value={tree.incline != null ? `${tree.incline}°` : "N/A"} />
          <InfoRow label="DCH:" value={tree.dch ?? "N/A"} />
          <InfoRow label="Valor del árbol:" value={tree.treeValue ?? "N/A"} />
          <ListItems label="Enfermedades:" items={tree.diseasesNames} />
          <ListItems label="Plagas:" items={tree.pestsNames} />

          {/* Factores de carga */}
          <SectionHeader title="Factores de carga" color="#F9A825" />
          <InfoRow label="Exposición al viento:" value={tree.windExposure ?? "N/A"} />
          <InfoRow label="Vigor:" value={tree.vigor ?? "N/A"} />
          <InfoRow label="Densidad del follaje:" value={tree.canopyDensity ?? "N/A"} />

          {/* Condiciones del sitio */}
          <SectionHeader title="Condiciones del sitio" color="#7B1FA2" />
          <ListItems label="Conflictos:" items={tree.conflictsNames} />
          <InfoRow label="Raíces expuestas:" value={tree.exposedRoots ? "Sí" : "No"} />
          <InfoRow label="Espacio de crecimiento:" value={tree.growthSpace ?? "N/A"} />
          <InfoRow label="Materialidad de calle:" value={tree.streetMateriality ?? "N/A"} />

          {/* Blanco debajo del árbol */}
          <SectionHeader title="Blanco debajo del árbol" color="#D32F2F" />
          <InfoRow label="Qué hay bajo el árbol:" value={tree.useUnderTheTree ?? "N/A"} />
          {tree.useUnderTheTree && (
            <>
              <InfoRow label="Frecuencia de uso:" value={tree.frequencyUse ?? "N/A"} />
              <InfoRow label="Daño potencial:" value={tree.potentialDamage ?? "N/A"} />
              <InfoRow label="¿Se puede mover?" value={tree.isMovable ? "Sí" : "No"} />
              <InfoRow label="¿Se puede restringir?" value={tree.isRestrictable ? "Sí" : "No"} />
            </>
          )}

          {/* Defectos — API returns readDefectDto with defectZone */}
          {(() => {
            const allDefects: any[] = (tree as any).readDefectDto ?? tree.defectDto ?? [];
            if (allDefects.length === 0) return null;
            const zones = [
              { key: "raiz", label: "Defectos en raíces" },
              { key: "tronco", label: "Defectos en tronco o cuello" },
              { key: "rama", label: "Defectos en ramas" },
            ];
            return zones.map(({ key, label }) => {
              const group = allDefects.filter((d: any) => d.defectZone === key);
              if (group.length === 0) return null;
              return (
                <Box key={key}>
                  <SectionHeader title={label} color="#E65100" />
                  <Stack gap={2} mt={1}>
                    {group.map((defect: any, index: number) => (
                      <Box key={index} pl={3} borderLeft="3px solid #E65100" py={1}>
                        <Text fontWeight="bold" color="gray.800" fontSize="sm">
                          {defect.defectName}
                        </Text>
                        <Text color="gray.600" fontSize="xs">
                          {defect.textDefectValue}
                        </Text>
                        <Text color="gray.400" fontSize="xs">
                          Severidad: {defect.defectValue}
                        </Text>
                        {defect.branches != null && (
                          <Text color="gray.400" fontSize="xs">
                            {key === "rama"
                              ? `Ramas afectadas: ${defect.branches}`
                              : `Perímetro afectado: ${defect.branches}cm`}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              );
            });
          })()}
        </>
      )}

      {/* Intervenciones */}
      <SectionHeader title="Intervenciones" color="#616161" />
      <ListItems label="Intervenciones a aplicar:" items={tree.interventionsNames} />
    </Stack>
  );

  return (
    <Box bg="white" borderRadius="xl" p={6} shadow="md" h="100%" overflowY="auto">
      {content}

      {/* Image modal */}
      {modalImage && isModalOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={1400}
          bg="blackAlpha.900"
          display="flex"
          justifyContent="center"
          alignItems="center"
          onClick={handleCloseModal}
        >
          <Image
            src={modalImage}
            alt="Árbol"
            objectFit="contain"
            maxH="100vh"
            maxW="100%"
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      )}
    </Box>
  );
};

export default TreeDetails;
