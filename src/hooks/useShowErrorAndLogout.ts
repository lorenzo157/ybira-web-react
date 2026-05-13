import { useAuth } from "../context/authContext";
import { toaster } from "../utils/toaster";

export const useShowErrorAndLogout = (): { showErrorAndLogout: () => void } => {
  const { logout } = useAuth();

  const showErrorAndLogout = () => {
    toaster.create({
      title: "Hubo un error. Intente nuevamente",
      type: "error",
    });
    logout?.();
  };

  return { showErrorAndLogout };
};
export {};
