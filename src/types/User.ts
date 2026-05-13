import { LatLng } from "./Neighborhood";

export interface User {
  idUser?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  cityName?: string;
  provinceName?: string;
  roleName?: string;
  heightMeters?: number;
}

export enum UserRole {
  Admin = "admin",
  Gestor = "gestor",
  Inspector = "inspector",
}

export interface City {
  idCity: number;
  name: string;
  center?: LatLng;
  zoom?: number;
  role?: UserRole;
}
