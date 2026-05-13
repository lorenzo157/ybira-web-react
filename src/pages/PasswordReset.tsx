import React, { ChangeEvent, FormEvent, useState } from "react";
import { Flex, Input, Button, Box, Text, Stack, Heading, Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import { Pages } from "../types/Pages";
import { toaster } from "../utils/toaster";

const PasswordReset = () => {
  const { passwordReset } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setisSubmitting] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | undefined>();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setisSubmitting(true);
      setError("");
      await passwordReset?.(email);
      setisSubmitting(false);
      toaster.create({
        title: "Email enviado",
        description: "Se ha enviado un mail para recuperar su contraseña",
        type: "success",
        duration: 5000,
      });
      navigate(Pages.Home);
    } catch (error: any) {
      setError("Hubo un error inesperado.");
      setisSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <Center backgroundColor="gray.200" w="100vw" h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
    >
      <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={6}>
          Recuperar contraseña
        </Heading>
        <Box minW={{ base: "90%", md: "468px" }}>
          <form onSubmit={handleSubmit}>
            <Stack gap={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
              <Box position="relative">
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  style={{ transform: "translateY(-50%)" }}
                  pointerEvents="none"
                  color="gray.300"
                  zIndex={1}
                >
                  <FaUserAlt color="gray.300" />
                </Box>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  pl="2.5rem"
                  onChange={handleChange}
                />
              </Box>
              <Button
                textShadow="0.4px 0.4px 0.4px black"
                fontFamily="Raleway"
                bg="#1A865F"
                color="#FFFFFF"
                _hover={{ bg: "teal.500" }}
                borderRadius={0}
                variant="solid"
                type="submit"
              >
                Enviar
              </Button>
              <Button
                textShadow="0.4px 0.4px 0.4px black"
                fontFamily="Raleway"
                bg="#1A865F"
                color="#FFFFFF"
                _hover={{ bg: "teal.500" }}
                borderRadius={0}
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Volver
              </Button>
            </Stack>
          </form>
        </Box>
        {error && (
          <Text fontSize={"xl"} color="red" mt={8}>
            {error}
          </Text>
        )}
      </Stack>
    </Flex>
  );
};

export default PasswordReset;
