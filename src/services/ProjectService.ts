import api from "../api/axiosInstance";
import { Project } from "../types/Project";
import { User } from "../types/User";

export const createProject = async (project: any) => {
  try {
    const response = await api.post(`/project`, project);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const getProjectById = async (idProjects: number) => {
  try {
    const response = await api.get(`/project/${idProjects}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project by id:", error);
    throw error;
  }
};

export const deleteProjectById = async (idProject: number) => {
  try {
    const response = await api.delete(`/project/${idProject}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project by ID:", error);
    throw error;
  }
};

export const updateProjectById = async (idProjects: number, updatedData: object) => {
  try {
    const response = await api.patch(`/project/${idProjects}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating project by id:", error);
    throw error;
  }
};

export const getIdUserByIdProject = async (idProject: string) => {
  try {
    // Realizar la petición para obtener el usuario según el idproject
    const response = await api.get(`/project/${idProject}/user`);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const getAllProjectsCreatedByUser = async (): Promise<Project[]> => {
  try {
    const response = await api.get(`/project/createdproject`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getNeighborhoodDataForMaps = async (idProject: number) => {
  try {
    const response = await api.get(`/project/get-neighborhood-data-of-project/${idProject}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching neighborhood data for maps:", error);
    throw error;
  }
};

export const findAllTreesByIdProject = async (idProject: number, idUnitWork?: number) => {
  try {
    const params = idUnitWork ? { idUnitWork } : undefined;
    const response = await api.get(`/project/${idProject}/tree`, { params });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener los arboles del el proyecto:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getUserByProject = async (idProject: number): Promise<User[]> => {
  try {
    const response = await api.get(`/project/${idProject}/assigneduser`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const deleteUserFromProject = async (idProject: number, idUser: number) => {
  try {
    const response = await api.delete(`/project/${idProject}/assigneduser/${idUser}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al asignar el usuario al proyecto:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getAssignedProjectsByIdUser = async (): Promise<Project[]> => {
  try {
    const response = await api.get(`/project/assignedproject`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const associateUserWithProject = async (idProject: number, idUser: number) => {
  try {
    const response = await api.post(`/project/${idProject}/assigneduser/${idUser}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al asignar el usuario al proyecto:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
