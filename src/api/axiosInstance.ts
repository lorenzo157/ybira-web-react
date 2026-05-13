import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url ?? "";
    if (error?.response?.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (error?.response?.status === 403) {
      toast.error("Usted no tiene permisos para realizar esta acción.");
    }
    return Promise.reject(error);
  },
);

export default api;
