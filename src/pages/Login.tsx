import React, { useState, useEffect } from "react";
import { Flex, Input, Button, Box, Text, Stack, Image } from "@chakra-ui/react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserAlt } from "react-icons/fa";
import logo from "../assets/logo_yvira.png";
import api from "../api/axiosInstance";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.get<{ authenticated: boolean }>("/auth/check");
        if (data.authenticated) {
          navigate("/home", { replace: true });
        }
      } catch {
        // no active session, stay on login
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleShowClick = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setError("");
      const loggedUser = await login?.(email, password);
      if (loggedUser?.roleName === "Inspector") {
        setError("Acceso no permitido para rol de usuario Inspector.");
        setIsLoggingIn(false);
        return;
      }
      setIsLoggingIn(false);
      navigate("/home");
    } catch (error: any) {
      let errorMessage: string;
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.error?.message ?? error?.response?.data?.message;
      if (status === 401 || serverMessage === "Invalid credentials") {
        errorMessage = "Credenciales incorrectas.";
      } else if (!status || error?.code === "ERR_NETWORK") {
        errorMessage = "No se pudo conectar con el servidor.";
      } else {
        errorMessage = "Hubo un error inesperado.";
      }
      setError(errorMessage);
      setIsLoggingIn(false);
    }
  };

  return (
    <Flex minH="100vh" bg="gray.100" align="center" justify="center" px={4}>
      <Box bg="white" borderRadius="2xl" boxShadow="lg" p={10} w="full" maxW="420px">
        {/* Logo */}
        <Flex justify="center" mb={6}>
          <Image src={logo} alt="Yvyra" h="90px" objectFit="contain" />
        </Flex>

        <Text
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          color="teal.600"
          fontFamily="Raleway"
          mb={8}
        >
          Iniciar sesión
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            {/* Email */}
            <Box position="relative">
              <Box
                position="absolute"
                left={3}
                top="50%"
                style={{ transform: "translateY(-50%)" }}
                pointerEvents="none"
                color="gray.400"
                zIndex={1}
              >
                <FaUserAlt />
              </Box>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                pl="2.5rem"
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            {/* Password */}
            <Box position="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                pl={4}
                pr="3rem"
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
              />
              <Box
                position="absolute"
                right={3}
                top="50%"
                style={{ transform: "translateY(-50%)", cursor: "pointer" }}
                color="gray.400"
                onClick={handleShowClick}
                zIndex={1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Box>
            </Box>

            {/* Forgot password */}
            {/* <Text
              textAlign="right"
              fontSize="sm"
              color="teal.500"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
              onClick={() => navigate(Pages.PasswordReset)}
            >
              ¿Olvidaste tu contraseña?
            </Text> */}

            {/* Submit */}
            <Button
              bg="#1A865F"
              color="white"
              _hover={{ bg: "teal.500" }}
              width="full"
              type="submit"
              size="lg"
              borderRadius="lg"
              loading={isLoggingIn}
              loadingText="Ingresando..."
              mt={2}
            >
              Ingresar
            </Button>
          </Stack>
        </form>

        {error && (
          <Text color="red.500" fontSize="sm" textAlign="center" mt={4}>
            {error}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default Login;
