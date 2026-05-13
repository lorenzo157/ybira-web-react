import { useEffect, useState } from "react";
import { getTreeDetailsByIdProject } from "../services/TreeService";
import { Tree } from "../types/Tree";

const useTreeDetails = (idProject: number, idTree: number) => {
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTreeDetails = async () => {
      try {
        setLoading(true);
        const treeDetails = await getTreeDetailsByIdProject(idProject, idTree);
        setTree(treeDetails);
      } catch (err: any) {
        setError("Error al obtener los detalles del árbol");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreeDetails();
  }, [idProject, idTree]);

  return { tree, loading, error };
};

export default useTreeDetails;
