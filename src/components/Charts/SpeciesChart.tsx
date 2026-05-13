import { Flex } from "@chakra-ui/react";
import React, { FC, useMemo } from "react";
import { Tree } from "../../types/Tree";
import { groupBy, size } from "lodash";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, ChartData } from "chart.js";
import { stringToRGBColor } from "../../helpers/stringToRGBColor";
Chart.register(ArcElement);

interface Props {
  trees: Tree[];
}

const SpeciesChart: FC<Props> = ({ trees }) => {
  const data: ChartData<"pie", number[], string> = useMemo(() => {
    const treeSpecies: Record<string, Tree[]> = groupBy(
      trees,
      (tree: Tree) => tree.treeTypeName || "Especie no especificada",
    );
    return {
      labels: Object.keys(treeSpecies),
      datasets: [
        {
          label: "#",
          backgroundColor: Object.keys(treeSpecies).map((key) => stringToRGBColor(key)),
          data: Object.values(treeSpecies).map((value) => size(value)),
        },
      ],
    };
  }, [trees]);

  return (
    <Flex
      justifyContent={"center"}
      alignItems={"center"}
      width={"80%"}
      alignSelf={"center"}
      justifySelf={"center"}
    >
      <Pie
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
            title: {
              display: true,
              text: "Especies",
            },
          },
        }}
        data={data}
      />
    </Flex>
  );
};

export default SpeciesChart;
