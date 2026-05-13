import { Badge, Box, Flex, Separator, Text } from "@chakra-ui/react";
import { FC } from "react";

interface FilteredTotal {
  idNeighborhood: number;
  treeQtyFiltered: number;
}

interface Props {
  name?: string;
  selectedNeighborhoods?: string[];
  predominantSpecies?: string[];
  simpsonIndex?: string[];
  predominantRisk?: (number | string)[];
  totalTreesCount?: number[];
  filteredTotals?: FilteredTotal[];
}

const SectionTitle: FC<{ label: string }> = ({ label }) => (
  <Text
    fontSize="xs"
    fontWeight="bold"
    color="teal.600"
    textTransform="uppercase"
    letterSpacing="wide"
    mb={1}
  >
    {label}
  </Text>
);

const NeighborhoodRow: FC<{ name: string; value: React.ReactNode }> = ({ name, value }) => (
  <Flex justify="space-between" align="center" py={0.5}>
    <Text
      fontSize="sm"
      color="gray.600"
      flex={1}
      mr={2}
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
    >
      {name}
    </Text>
    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
      {value}
    </Text>
  </Flex>
);

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box>
    <SectionTitle label={title} />
    {children}
  </Box>
);

const ReportSummary: FC<Props> = ({
  name,
  selectedNeighborhoods = [],
  predominantSpecies,
  predominantRisk,
  simpsonIndex,
  totalTreesCount,
  filteredTotals = [],
}) => {
  const hasActiveFilters = filteredTotals.some((f) => f.treeQtyFiltered > 0);

  const displayCount = (index: number): number =>
    hasActiveFilters
      ? (filteredTotals[index]?.treeQtyFiltered ?? 0)
      : (totalTreesCount?.[index] ?? 0);

  const totalGeneral = selectedNeighborhoods.reduce(
    (acc, _, index) => acc + displayCount(index),
    0,
  );

  const excludedCount = (index: number): number =>
    hasActiveFilters
      ? (totalTreesCount?.[index] ?? 0) - (filteredTotals[index]?.treeQtyFiltered ?? 0)
      : 0;

  const totalExcluded = selectedNeighborhoods.reduce(
    (acc, _, index) => acc + excludedCount(index),
    0,
  );

  const staticTotal = totalTreesCount?.reduce((acc, t) => acc + (t || 0), 0) ?? 0;
  const percentageGlobal = staticTotal > 0 ? ((totalExcluded / staticTotal) * 100).toFixed(1) : "-";

  return (
    <Box
      bg="white"
      rounded="xl"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box bg="teal.500" px={4} py={2.5}>
        <Text
          fontWeight="bold"
          fontSize="sm"
          color="white"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {name ?? "Resumen por barrio"}
        </Text>
      </Box>

      <Box px={4} py={3} overflowY="auto" flex={1} display="flex" flexDirection="column" gap={3}>
        {/* No results banner */}
        {hasActiveFilters && totalGeneral === 0 && (
          <Box
            bg="yellow.50"
            border="1px solid"
            borderColor="yellow.300"
            rounded="lg"
            px={3}
            py={2}
          >
            <Text fontSize="sm" color="yellow.800" fontWeight="medium">
              Ningún árbol coincide con los filtros aplicados.
            </Text>
          </Box>
        )}

        {/* Árboles totales */}
        <Section title={hasActiveFilters ? "Árboles coincidentes" : "Cantidad de árboles"}>
          {selectedNeighborhoods.map((n, index) => (
            <NeighborhoodRow key={`trees${n}`} name={n} value={displayCount(index)} />
          ))}
          <Flex justify="space-between" mt={1} pt={1} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="sm" fontWeight="bold" color="teal.700">
              Total
            </Text>
            <Badge colorScheme="teal" fontSize="sm" px={2}>
              {totalGeneral}
            </Badge>
          </Flex>
        </Section>

        <Separator />

        {/* Especie predominante */}
        <Section title="Especie predominante">
          {selectedNeighborhoods.map((n, index) => (
            <NeighborhoodRow
              key={`species${n}`}
              name={n}
              value={predominantSpecies?.[index] ?? "-"}
            />
          ))}
        </Section>

        <Separator />

        {/* Riesgo predominante */}
        <Section title="Riesgo predominante">
          {selectedNeighborhoods.map((n, index) => (
            <NeighborhoodRow key={`risk${n}`} name={n} value={predominantRisk?.[index] ?? "-"} />
          ))}
        </Section>

        <Separator />

        {/* Índice de Simpson */}
        <Section title="Índice de Simpson">
          {selectedNeighborhoods.map((n, index) => (
            <NeighborhoodRow key={`simpson${n}`} name={n} value={simpsonIndex?.[index] ?? "-"} />
          ))}
        </Section>

        {/* Filtrados — solo cuando hay filtro activo */}
        {hasActiveFilters && (
          <>
            <Separator borderColor="orange.200" />
            <Box bg="orange.50" rounded="lg" p={3} border="1px solid" borderColor="orange.100">
              <SectionTitle label="Árboles excluidos por filtro" />
              {selectedNeighborhoods.map((n, index) => {
                const excluded = excludedCount(index);
                const total = totalTreesCount?.[index] ?? 0;
                const pct = total > 0 ? ((excluded / total) * 100).toFixed(1) : null;
                return (
                  <NeighborhoodRow
                    key={`filtered${n}`}
                    name={n}
                    value={pct !== null ? `${excluded} (${pct}%)` : excluded}
                  />
                );
              })}
              <Flex
                justify="space-between"
                mt={1}
                pt={1}
                borderTop="1px solid"
                borderColor="orange.200"
              >
                <Text fontSize="sm" fontWeight="bold" color="orange.700">
                  Total excluidos
                </Text>
                <Badge colorScheme="orange" fontSize="sm" px={2}>
                  {totalExcluded} ({percentageGlobal}%)
                </Badge>
              </Flex>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ReportSummary;
