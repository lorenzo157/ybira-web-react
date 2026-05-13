import React, { createContext, useContext, useState, useEffect, FC } from "react";
import api from "../api/axiosInstance";

type User = {
  [x: string]: string;
  idUser: string;
  firstName: string;
  email: string;
};

type AuthContextType = {
  user?: User;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<User>;
  passwordReset: (email: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
  userCity?: any;
};

const AuthContext = createContext<Partial<AuthContextType>>({});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post(`/auth/login`, {
        email,
        password,
      });

      const { user: userData } = response.data;
      const newUser: User = {
        idUser: userData.idUser,
        firstName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        roleName: userData.roleName,
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Error en el inicio de sesión", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    setUser(undefined);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};
