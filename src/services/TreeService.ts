import api from "../api/axiosInstance";

export const getTreeById = async (idTree: number) => {
  try {
    const response = await api.get(`/project/0/tree/${idTree}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el arbol ", error.response?.data || error.message);
    throw error;
  }
};

export const deleteTreeById = async (idTree: number) => {
  try {
    const response = await api.delete(`/project/0/tree/${idTree}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al asignar el usuario al proyecto:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getTreeDetailsByIdProject = async (idProject: number, idTree: number) => {
  try {
    const response = await api.get(`/project/${idProject}/tree/${idTree}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener los arboles:", error.response?.data || error.message);
    throw error;
  }
};

export const getNeighborhoodCoordinates = async (
  provinceName: string,
  cityName: string,
  neighborhoodName: string,
) => {
  const idProject = 0;
  try {
    const response = await api.get(
      `/project/${idProject}/tree/get-neighborhood/${provinceName}/${cityName}/${neighborhoodName}`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error al obtener datos del barrio:", error.response.status);
    } else if (error.request) {
      console.error("Error de red - No se recibió respuesta:", error.request);
    } else {
      console.error("Error desconocido:", error.message);
    }
    throw error;
  }
};

export const getFilteredTrees = async (
  idProject: number,
  filters: Record<string, string[]>,
  neighborhoodIds?: number[],
) => {
  try {
    const body: any = { filters };
    if (neighborhoodIds && neighborhoodIds.length > 0) {
      body.neighborhoodIds = neighborhoodIds;
    }
    const response = await api.post(`/project/${idProject}/tree/filtered-trees`, body);
    return response.data;
  } catch (error) {
    console.error("Error al obtener árboles filtrados:", error);
    throw error;
  }
};

export const getAllFiltersByUnitWork = async (idProject: number, idUnitWork: number) => {
  try {
    const filterNames = [
      "isDead",
      "isMissing",
      "diseases",
      "frequencyUse",
      "exposedRoots",
      "treeTypeName",
      "pests",
      "treeValue",
      "conflicts",
      "windExposure",
      "vigor",
      "canopyDensity",
      "growthSpace",
      "risk",
      "intervention",
      "streetMateriality",
    ].join(",");

    const url = `/project/${idProject}/tree/${idUnitWork}/get-all-filters`;

    const response = await api.get(url, {
      params: { filterNames },
    });

    return response.data;
  } catch (error) {
    console.error("Error obteniendo filtros:", error);
    throw error;
  }
};
