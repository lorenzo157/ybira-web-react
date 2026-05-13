import { FC, useMemo } from "react";
import { getSimpsonIndexValue } from "../../helpers/getSimpsonIndexValue";
import { Tree } from "../../types/Tree";
import { Neighborhood } from "../../types/Neighborhood";
import { Flex } from "@chakra-ui/react";
import { Chart, ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";

interface Props {
  trees: Tree[];
  neighborhoods: Neighborhood[];
}

const valueLabelsPlugin = {
  id: "simpsonValueLabels",
  afterDatasetsDraw(chart: Chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((bar: any, index: number) => {
      const value = chart.data.datasets[0].data[index] as number;
      if (value == null) return;
      const label = value.toFixed(2);
      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.textBaseline = "middle";
      if (bar.x > 40) {
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(label, bar.x - 6, bar.y);
      } else {
        ctx.fillStyle = "#333";
        ctx.textAlign = "left";
        ctx.fillText(label, bar.x + 4, bar.y);
      }
      ctx.restore();
    });
  },
};

const SimpsonChart: FC<Props> = ({ trees, neighborhoods }) => {
  const data: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: neighborhoods.map((n) => n.neighborhoodName),
      datasets: [
        {
          data: neighborhoods.map((n) => getSimpsonIndexValue(trees, n.idNeighborhood)),
          label: "Índice",
          backgroundColor: "teal",
        },
      ],
    };
  }, [trees, neighborhoods]);
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Bar
        plugins={[valueLabelsPlugin]}
        options={{
          indexAxis: "y" as const,
          responsive: true,
          scales: {
            x: {
              stacked: true,
              beginAtZero: true,
              suggestedMin: 0,
              max: 1,
            },
            y: {
              stacked: true,
            },
          },
          plugins: {
            // legend: {
            //   display: false,
            //   position: "top",
            // },
            title: {
              display: true,
              text: "Distribución índice de simpson por barrio",
            },
            legend: {
              display: false,
              position: "right" as const,
            },
            tooltip: {
              callbacks: {
                // title: (xDatapoint) => {
                //   return xDatapoint.raw;
                // },
                // label: (yDatapoint: TooltipItem<"bar">) => {
                //   return `${Number(yDatapoint.raw).toFixed(2)} %`;
                // },
              },
            },
          },
        }}
        data={data}
      />
    </Flex>
  );
};

export default SimpsonChart;
