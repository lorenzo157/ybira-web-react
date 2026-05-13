import {
  Box,
  Flex,
  Text,
  TableRoot,
  TableBody,
  TableCell,
  TableFooter,
  TableColumnHeader,
  TableHeader,
  TableRow,
} from "@chakra-ui/react";
import React from "react";
import TreeSpinner from "../TreeSpinner/TreeSpinner";
import { Neighborhood } from "../../types/Neighborhood";

interface MapResultsProps {
  neighborhoods: Neighborhood[];
  isLoading: boolean;
  idProject?: string;
  filteredTotals?: { idNeighborhood: number; treeQtyFiltered: number }[];
}

const percentageColor = (pct: number): string => {
  if (pct >= 75) return "#C53030";
  if (pct >= 40) return "#C05621";
  return "#276749";
};

const MapResults: React.FC<MapResultsProps> = ({ neighborhoods, isLoading, filteredTotals }) => {
  let totalTreesCount = 0;
  let filteredTreesCount = 0;

  const rows = neighborhoods.map((n) => {
    const match = filteredTotals?.find((f) => f.idNeighborhood === n.idNeighborhood);
    const filtered = match?.treeQtyFiltered ?? 0;
    const total = n.additionalInfo?.totalTreesCount ?? 0;
    totalTreesCount += total;
    filteredTreesCount += filtered;
    const pct = total > 0 ? (filtered / total) * 100 : null;
    return { n, filtered, total, pct };
  });

  const totalPct =
    totalTreesCount > 0 ? ((filteredTreesCount / totalTreesCount) * 100).toFixed(1) : null;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={6}>
        <TreeSpinner />
      </Flex>
    );
  }

  return (
    <Box
      bg="white"
      rounded="xl"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      overflow="hidden"
    >
      {/* Header */}
      <Box bg="teal.500" px={4} py={2.5}>
        <Text fontWeight="semibold" fontSize="sm" color="white">
          Resultados por barrio
        </Text>
      </Box>

      <Box overflowX="auto">
        <TableRoot size="sm" variant="outline">
          <TableHeader>
            <TableRow bg="gray.50">
              <TableColumnHeader
                px={3}
                py={2}
                fontSize="xs"
                color="gray.500"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Barrio
              </TableColumnHeader>
              <TableColumnHeader
                px={3}
                py={2}
                fontSize="xs"
                color="gray.500"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Totales
              </TableColumnHeader>
              <TableColumnHeader
                px={3}
                py={2}
                fontSize="xs"
                color="gray.500"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Filtrados
              </TableColumnHeader>
              <TableColumnHeader
                px={3}
                py={2}
                fontSize="xs"
                color="gray.500"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                %
              </TableColumnHeader>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map(({ n, filtered, total, pct }, idx) => (
              <TableRow key={idx} _hover={{ bg: "gray.50" }}>
                <TableCell px={3} py={2} fontSize="sm" fontWeight="medium" color="gray.800">
                  {n.neighborhoodName}
                </TableCell>
                <TableCell px={3} py={2} fontSize="sm" color="gray.600">
                  {total}
                </TableCell>
                <TableCell px={3} py={2} fontSize="sm" color="gray.600">
                  {filtered}
                </TableCell>
                <TableCell px={3} py={2} fontSize="sm" fontWeight="semibold">
                  {pct !== null ? (
                    <Text as="span" color={percentageColor(pct)}>
                      {pct.toFixed(1)} %
                    </Text>
                  ) : (
                    <Text as="span" color="gray.400">
                      -
                    </Text>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow bg="gray.50" borderTop="2px solid" borderColor="gray.200">
              <TableColumnHeader px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.700">
                Total
              </TableColumnHeader>
              <TableColumnHeader px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.700">
                {totalTreesCount}
              </TableColumnHeader>
              <TableColumnHeader px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.700">
                {filteredTreesCount}
              </TableColumnHeader>
              <TableColumnHeader px={3} py={2} fontSize="sm" fontWeight="bold">
                {totalPct !== null ? (
                  <Text as="span" color={percentageColor(Number(totalPct))}>
                    {totalPct} %
                  </Text>
                ) : (
                  <Text as="span" color="gray.400">
                    -
                  </Text>
                )}
              </TableColumnHeader>
            </TableRow>
          </TableFooter>
        </TableRoot>
      </Box>
    </Box>
  );
};

export default MapResults;
