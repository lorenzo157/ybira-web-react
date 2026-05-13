import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useData } from "../../context/dataContext";
import TreeSpinner from "../TreeSpinner/TreeSpinner";
import SpeciesChart from "./SpeciesChart";
import DAPChart from "./DAPChart";
import RiskChart from "./RiskChart";
import SimpsonChart from "./SimpsonChart";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../../context/authContext";
import { getCurrentFormattedDate } from "../../helpers/getFormattedDate";
import ReportSummary from "../ReportSummary/ReportSummary";
import MapResults from "../MapResults/MapResults";
import { Tree } from "../../types/Tree";
import { Neighborhood } from "../../types/Neighborhood";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportCard: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => (
  <Box
    bg="white"
    rounded="xl"
    border="1px solid"
    borderColor="gray.200"
    boxShadow="sm"
    overflow="hidden"
  >
    {title && (
      <Box bg="teal.500" px={4} py={2.5}>
        <Text fontWeight="semibold" fontSize="sm" color="white">
          {title}
        </Text>
      </Box>
    )}
    <Box p={4}>{children}</Box>
  </Box>
);

interface ChartsProps {
  trees?: Tree[];
  neighborhoods?: Neighborhood[];
}

const Charts = ({ trees: propTrees, neighborhoods: propNeighborhoods }: ChartsProps) => {
  const { isLoadingTreesData, neighborhoods: ctxNeighborhoods, trees: ctxTrees } = useData();
  const trees = propTrees ?? ctxTrees;
  const neighborhoods = propNeighborhoods ?? ctxNeighborhoods;
  const { userCity } = useAuth();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Reporte ${userCity?.name} ${getCurrentFormattedDate()}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 12mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .report-grid { break-inside: avoid; }
        * { overflow: visible !important; }
        ::-webkit-scrollbar { display: none !important; }
      }
    `,
  });

  const neighborhoodNames = neighborhoods.map((n) => n.neighborhoodName);
  const totalTreesCount = neighborhoods.map((n) => n.additionalInfo?.totalTreesCount ?? 0);
  const predominantSpecies = neighborhoods.map(
    (n) => n.additionalInfo?.predominantSpecies ?? "N/A",
  );
  const predominantRisk = neighborhoods.map((n) => n.additionalInfo?.predominantRisk ?? "N/A");
  const simpsonIndex = neighborhoods.map((n) => (n.additionalInfo?.simpsonIndex ?? 0).toFixed(2));

  if (isLoadingTreesData) {
    return (
      <Flex flex="1" justifyContent="center" alignItems="center">
        <TreeSpinner />
      </Flex>
    );
  }

  return (
    <Flex flex="1" flexDirection="column" alignItems="center" p={8} gap={6} bg="#EFF2F9" w="100%">
      {/* Printable report */}
      <Box ref={componentRef} w="100%" maxW="960px" display="flex" flexDirection="column" gap={6}>
        {/* Report header */}
        <Box
          bg="white"
          rounded="xl"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="sm"
          px={6}
          py={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="teal.600">
              {userCity?.name ?? "Reporte de Arbolado Urbano"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Reporte generado el {getCurrentFormattedDate()}
            </Text>
          </Box>
          <Box
            bg="teal.500"
            color="white"
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="semibold"
          >
            {totalTreesCount.reduce((a, b) => a + b, 0)} árboles
          </Box>
        </Box>

        {/* Summary + Table */}
        <Grid templateColumns="1fr 1fr" gap={6} className="report-grid">
          <ReportSummary
            selectedNeighborhoods={neighborhoodNames}
            totalTreesCount={totalTreesCount}
            predominantSpecies={predominantSpecies}
            predominantRisk={predominantRisk}
            simpsonIndex={simpsonIndex}
          />
          <MapResults neighborhoods={neighborhoods} isLoading={false} />
        </Grid>

        {/* Charts */}
        <Grid templateColumns="1fr 1fr" gap={6} className="report-grid">
          <ReportCard title="Distribución por especie">
            <SpeciesChart trees={trees} />
          </ReportCard>
          <ReportCard title="Distribución por DAP">
            <DAPChart trees={trees} />
          </ReportCard>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={6} className="report-grid">
          <ReportCard title="Distribución por riesgo">
            <RiskChart neighborhoods={neighborhoods} trees={trees} />
          </ReportCard>
          <ReportCard title="Índice de Simpson">
            <SimpsonChart neighborhoods={neighborhoods} trees={trees} />
          </ReportCard>
        </Grid>
      </Box>

      {/* Print button outside the printable area */}
      <Button
        bg="#1A865F"
        color="white"
        _hover={{ bg: "teal.500" }}
        onClick={handlePrint}
        size="md"
        px={8}
      >
        Imprimir reporte
      </Button>
    </Flex>
  );
};

export default Charts;
