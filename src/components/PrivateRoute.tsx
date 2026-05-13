import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { Pages } from "../types/Pages";

type PrivateRouteProps = {
  children: React.JSX.Element;
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Puede ser un spinner u otro indicador
  }

  return user ? children : <Navigate to={Pages.Login} />;
};
