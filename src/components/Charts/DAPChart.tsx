import React, { FC, useMemo } from "react";
import { Tree } from "../../types/Tree";
import { countBy, groupBy, gt, inRange, isEqual, isUndefined, last, size } from "lodash";
import { stringToRGBColor } from "../../helpers/stringToRGBColor";
import { Flex } from "@chakra-ui/react";
import { ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";

interface Props {
  trees: Tree[];
}

const dapIntervals: number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const DAPChart: FC<Props> = ({ trees }) => {
  const ranges: string[] = useMemo(() => {
    const rangeTexts: string[] = [];
    for (let i = 0; i < size(dapIntervals) - 1; i++) {
      const start = dapIntervals[i];
      const end = dapIntervals[i + 1];
      const text = `${start} a ${end}cm`;
      rangeTexts.push(text);
    }
    rangeTexts.push(`+${last(dapIntervals)}cm`);
    return rangeTexts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data: ChartData<"bar", number[], string> = useMemo(() => {
    const treeSpecies: Record<string, Tree[]> = groupBy(trees, (tree: Tree) => tree.treeTypeName);

    return {
      labels: ranges,
      // recorro cada especie
      datasets: Object.entries(treeSpecies).map(([key, trees]) => {
        return {
          label: key,
          // voy recorriendo los intervalos
          data: dapIntervals.map((rangeStart, index) => {
            const rangeEnd = dapIntervals[index + 1];
            // si estoy en el ultimo elemento de la lista, rangeEnd es undefined y solo busco
            // los valores de DAP que son mayores a rangeStart
            if (isUndefined(rangeEnd)) {
              const count = countBy(trees, (tree) => {
                if (isUndefined(tree.dch) || isEqual(tree.dch, 0)) return;
                return gt(tree.dch, rangeStart);
              });
              return count.true;
            }
            // voy agarrando los DAP de los arboles que estan en el rango
            // [rangeEnd,rangeStart) y los cuento
            const count = countBy(trees, (tree) => {
              if (isUndefined(tree.dch) || isEqual(tree.dch, 0)) return;
              //   rangeStart,
              //   rangeEnd,
              //   dap: v.DAP,
              //   inRange: inRange(v.DAP, rangeStart, rangeEnd),
              // });
              return inRange(tree.dch, rangeStart, rangeEnd);
            });
            return count.true;
          }),
          backgroundColor: stringToRGBColor(key),
        };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trees, ranges]);

  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Bar
        options={{
          scales: {
            y: {
              beginAtZero: true, // Comenzar en 0
              // suggestedMin: 0, // Mínimo sugerido en el eje Y
              // suggestedMax: 10, // Máximo sugerido en el eje Y
            },
          },
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
            title: {
              display: true,
              text: "Distribución DCH por especie",
            },
            tooltip: {
              callbacks: {
                // title: (xDatapoint) => {
                //   return xDatapoint.raw;
                // },
                label: (yDatapoint) => {
                  return `${yDatapoint.dataset.label}: ${yDatapoint.raw} árboles`;
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

export default DAPChart;
