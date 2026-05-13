import api from "../api/axiosInstance";
import { CreateNeighborhoodDto } from "../types/Neighborhood";
import { User } from "../types/User";

export const getUserById = async (idUser: number) => {
  try {
    const response = await api.get(`/user/${idUser}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (q: string | number): Promise<User[]> => {
  try {
    const response = await api.get(`/user`, { params: { q } });
    return response.data;
  } catch (error) {
    console.error("Error buscando usuarios:", error);
    return [];
  }
};

export const updateUser = async (idUser: number, userData: Partial<User>) => {
  try {
    const response = await api.patch(`/user/${idUser}`, userData);
    return response.data;
  } catch (error) {
    throw new Error("Error al actualizar el usuario");
  }
};

export const updateProfile = async (idUser: number, userData: Partial<User>) => {
  try {
    const response = await api.patch(`/user/${idUser}/profile`, userData);
    return response.data;
  } catch (error) {
    throw new Error("Error al actualizar el perfil");
  }
};

export const deleteUser = async (idUser: number) => {
  try {
    await api.delete(`/user/${idUser}`);
  } catch (error) {
    throw new Error("Error al eliminar el usuario");
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get(`/user`);
    return response.data;
  } catch (error) {
    console.error("Error al obetener los usuarios:", error);
    throw error;
  }
};

export const getAllRoles = async () => {
  try {
    const response = await api.get(`/user/roles`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    throw error;
  }
};

export const createUser = async (userData: object) => {
  try {
    const response = await api.post(`/user`, userData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error;
  }
};

export const getCitiesByProvinceId = async (provinceName: string) => {
  try {
    const response = await api.get(`/location/cities/${provinceName}`);
    return response.data;
  } catch (error) {
    console.error("Error to get cities from province:", error);
    throw error;
  }
};

export const getAllProvinces = async () => {
  try {
    const response = await api.get(`/location/provinces`);
    return response.data;
  } catch (error) {
    console.error("Error to get all provinces:", error);
    throw error;
  }
};

export const createNeighborhood = async (neighborhoodData: CreateNeighborhoodDto) => {
  try {
    const response = await api.post(`/location/neighborhood`, neighborhoodData);
    return response.data;
  } catch (error) {
    console.error("Error creating neighborhood:", error);
    throw error;
  }
};

export const getAllNeighborhoods = async (): Promise<any[]> => {
  try {
    const response = await api.get(`/location/neighborhoods`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los barrios:", error);
    throw error;
  }
};

export const deleteNeighborhood = async (idNeighborhood: number): Promise<void> => {
  try {
    await api.delete(`/location/neighborhood/${idNeighborhood}`);
  } catch (error) {
    console.error("Error al eliminar el barrio:", error);
    throw error;
  }
};

export const getNeighborhoodsByCity = async (provinceName: string, cityName: string) => {
  try {
    const response = await api.get(`/user/get-neighborhoods-by-city/${provinceName}/${cityName}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener barrios por ciudad:", error);
    throw error;
  }
};

export const getNeighborhood = async (
  provinceName: string,
  cityName: string,
  neighborhoodName: string,
) => {
  const url = `/user/get-neighborhood/${provinceName}/${cityName}/${neighborhoodName}`;
  const response = await api.get(url);
  return response.data;
};
