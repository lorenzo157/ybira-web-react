import React, { FC, useMemo } from "react";
import { Tree } from "../../types/Tree";
import { Flex } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { ChartData, TooltipItem } from "chart.js";
import { Neighborhood } from "../../types/Neighborhood";
import { countBy, includes, max, min, size } from "lodash";

interface Props {
  trees: Tree[];
  neighborhoods: Neighborhood[];
}

const riskIntervals: { name: string; values: number[]; color: string }[] = [
  { name: "Bajo", values: [0, 1, 2, 3, 4, 5], color: "rgb(0,128,0)" },
  { name: "Medio", values: [5, 6, 7, 8, 9, 10], color: "rgb(255,200, 0)" },
  {
    name: "Alto",
    values: [10, 11, 12, 13, 14, 15],
    color: "rgb(255, 0,0)",
  },
];
const RiskChart: FC<Props> = ({ trees, neighborhoods }) => {
  const data: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: neighborhoods.map((n) => n.neighborhoodName),
      datasets: riskIntervals.map((risk) => {
        return {
          label: `${risk.name} [${min(risk.values)},${max(risk.values)})`,
          data: neighborhoods.map((neighborhood) => {
            const filteredTrees = trees.filter(
              (tree) => tree.idNeighborhood === neighborhood.idNeighborhood,
            );
            const total = size(filteredTrees);
            if (total === 0) return 0;
            const count =
              countBy(filteredTrees, (tree) => {
                return includes(risk.values, Number(tree.risk));
              }).true ?? 0;

            return (count / total) * 100;
          }),

          backgroundColor: risk.color,
        };
      }),
    };
  }, [trees, neighborhoods]);
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Bar
        options={{
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
              suggestedMin: 0,
              // suggestedMax: 10,
            },
          },
          plugins: {
            // legend: {
            //   display: false,
            //   position: "top",
            // },
            title: {
              display: true,
              text: "Distribución riesgo por barrio",
            },
            tooltip: {
              callbacks: {
                // title: (xDatapoint) => {
                //   return xDatapoint.raw;
                // },
                label: (yDatapoint: TooltipItem<"bar">) => {
                  return `${Number(yDatapoint.raw).toFixed(2)} %`;
                },
              },
            },
          },
        }}
        data={data}
      />
    </Flex>
  );
};

export default RiskChart;
