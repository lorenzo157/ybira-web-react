import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { Tree } from "../../types/Tree";
import { useParams } from "react-router-dom";
import { findAllTreesByIdProject } from "../../services/ProjectService";

interface TreeSelectProps {
  trees?: Tree[];
  selectedTree?: Tree;
  onChange?: (tree: Tree | undefined) => void;
}

const TreeSelect: React.FC<TreeSelectProps> = ({ trees = [], selectedTree, onChange }) => {
  const [isLoadingFiltersData, setIsLoadingFiltersData] = useState<boolean>(true);
  const { idProject } = useParams<{ idProject: string }>();

  // Si no recibe árboles como prop, los carga (opcional)
  useEffect(() => {
    if (trees.length === 0) {
      const fetchTrees = async () => {
        setIsLoadingFiltersData(true);
        try {
          await findAllTreesByIdProject(Number(idProject), 0);
          onChange?.(undefined); // Limpiar selección si cambia proyecto
        } catch (error) {
          console.error("Error al obtener los árboles:", error);
        } finally {
          setIsLoadingFiltersData(false);
        }
      };
      fetchTrees();
    } else {
      setIsLoadingFiltersData(false);
    }
  }, [idProject, trees, onChange]);

  return (
    <Flex gap={2} alignItems="center" justify="center" zIndex={5000}>
      <Select
        disabled={isLoadingFiltersData}
        size="sm"
        chakraStyles={{
          container: (provided) => ({
            ...provided,
            backgroundColor: "gray.200",
            width: "200px",
          }),
          control: (provided) => ({
            ...provided,
            borderColor: selectedTree ? "red" : provided.borderColor,
            boxShadow: selectedTree ? "0 0 0 1px red" : provided.boxShadow,
            "&:hover": {
              borderColor: selectedTree ? "red" : provided.borderColor,
            },
          }),
        }}
        noOptionsMessage={() => "No hay opciones"}
        placeholder="Ingrese el ID"
        isClearable
        value={
          selectedTree ? { value: selectedTree.idTree, label: String(selectedTree.idTree) } : null
        }
        onChange={(value) => {
          const tree = trees.find((t) => t.idTree === value?.value);
          onChange?.(tree);
        }}
        options={trees.map((v) => ({
          value: v.idTree,
          label: String(v.idTree),
        }))}
      />
    </Flex>
  );
};

export default TreeSelect;
