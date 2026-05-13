import React, { FC } from "react";
import { Neighborhood } from "../../types/Neighborhood";
import { Bar } from "react-chartjs-2";
import { Flex } from "@chakra-ui/react";

interface Props {
  neighborhoods: Neighborhood[];
}

const BarChart: FC<Props> = ({ neighborhoods }) => {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Bar
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
              position: "top",
            },
            title: {
              display: true,
              text: "Tasa de riesgo",
            },
          },
        }}
        data={{
          labels: neighborhoods.map((neighborhood) => neighborhood.neighborhoodName),
          datasets: [
            {
              label: "Numero de arboles",
              backgroundColor: neighborhoods.map((neighborhood) => neighborhood.color),
              data: neighborhoods.map((n) => n.filterInfo?.filteredTreesCount),
            },
          ],
        }}
      />
    </Flex>
  );
};

export default BarChart;
