import { Button, Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import React, { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Header: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname.includes("home");
  const isPublicPage = ["/login", "/"].includes(location.pathname);

  if (isPublicPage) return null;

  return (
    <Flex bg="#4CB383" gap={4} px={6} py={6} padding={4} color="white">
      {!isHome && (
        <Button
          fontFamily="Raleway"
          bg="whiteAlpha.200"
          color="white"
          border="2px solid"
          borderColor="whiteAlpha.500"
          _hover={{ bg: "whiteAlpha.300", borderColor: "white" }}
          px={6}
          minW="110px"
          onClick={() => navigate(-1)}
        >
          ← Atrás
        </Button>
      )}
      <Heading color="white" size="lg" fontWeight="light">
        Yvyra
      </Heading>

      <Spacer />
      <Flex gap={4} align="center">
        {user && (
          <Text color="white" textShadow="1px 1px 1px black">
            {user.email}
          </Text>
        )}

        {isHome && (
          <>
            <Button
              textShadow="0.4px 0.4px 0.4px black"
              fontFamily="Raleway"
              bg="#1A865F"
              color="#FFFFFF"
              _hover={{ bg: "teal.500" }}
              px={6}
              minW="120px"
              onClick={() => navigate(`/edituser/${user?.idUser}`)}
            >
              Ver perfil
            </Button>
          </>
        )}

        {!isHome && user && (
          <Button
            textShadow="0.4px 0.4px 0.4px black"
            fontFamily="Raleway"
            bg="#1A865F"
            color="#FFFFFF"
            _hover={{ bg: "teal.500" }}
            px={6}
            minW="110px"
            onClick={() => navigate("/home")}
            variant="solid"
          >
            Inicio
          </Button>
        )}

        {/* Botón solo para administradores */}
        {user?.role === "Administrador" && isHome && (
          <Button
            textShadow="0.4px 0.4px 0.4px black"
            fontFamily="Raleway"
            bg="#1A865F"
            color="#FFFFFF"
            _hover={{ bg: "teal.500" }}
            onClick={() => navigate(`/listusers`)}
          >
            Listar Usuarios
          </Button>
        )}

        <Button
          textShadow="0.4px 0.4px 0.4px black"
          fontFamily="Raleway"
          bg="#1A865F"
          color="#FFFFFF"
          _hover={{ bg: "teal.500" }}
          px={6}
          minW="100px"
          onClick={async () => {
            await logout?.();
            navigate("/");
          }}
          colorScheme="red"
          variant="solid"
        >
          Salir
        </Button>
      </Flex>
    </Flex>
  );
};

export default Header;
