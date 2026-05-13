import React, { useState, useEffect, useRef } from "react";
import {
  getUserByProject,
  associateUserWithProject,
  deleteUserFromProject,
} from "../services/ProjectService";
import { searchUsers } from "../services/UserService";
import { User } from "../types/User";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  Box,
  Button,
  Heading,
  Text,
  Input,
  VStack,
  HStack,
  Stack,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { toaster } from "../utils/toaster";

function AssignUsers() {
  const { idProject } = useParams<{ idProject: string }>();
  const projectId = Number(idProject);
  const [email, setEmail] = useState("");
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [addedUsers, setAddedUsers] = useState<User[]>([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const fetchedUsers = await getUserByProject(projectId);
        const mappedUsers = fetchedUsers.map((u: any) => ({
          idUser: Number(u.idUser),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
        })) as User[];

        if (user && user.idUser) {
          const loggedInUser: User = {
            idUser: Number(user.idUser),
            firstName: user.firstName,
            lastName: user.lastName,
            roleName: user.roleName,
            email: user.email,
          };
          const isAlready = mappedUsers.some((u) => u.idUser === loggedInUser.idUser);
          if (!isAlready) mappedUsers.unshift(loggedInUser);
        }
        setExistingUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users for project:", error);
      }
    };
    fetchAssignedUsers();
  }, [projectId, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(value);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectUser = (selected: User) => {
    const alreadyInProject = existingUsers.some((u) => u.idUser === selected.idUser);
    if (alreadyInProject) {
      toaster.create({ title: "El usuario ya está en el proyecto", type: "info", duration: 3000 });
    } else {
      setExistingUsers((prev) => [...prev, selected]);
      setAddedUsers((prev) => [...prev, selected]);
    }
    setEmail("");
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleDeleteUser = (u: User) => {
    setUserToDelete(u);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete?.idUser) {
      try {
        await deleteUserFromProject(projectId, userToDelete.idUser);
        setExistingUsers((prev) => prev.filter((u) => u.idUser !== userToDelete.idUser));
        setAddedUsers((prev) => prev.filter((u) => u.idUser !== userToDelete.idUser));
        toaster.create({
          title: "Usuario eliminado del proyecto",
          type: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error al eliminar usuario del proyecto:", error);
        toaster.create({ title: "Error al eliminar usuario", type: "error", duration: 3000 });
      } finally {
        setShowDeleteConfirmModal(false);
        setUserToDelete(null);
      }
    }
  };

  const confirmAssignment = async () => {
    try {
      await Promise.all(
        addedUsers.map((u) => {
          if (u.idUser !== undefined) return associateUserWithProject(projectId, u.idUser);
          return Promise.resolve();
        }),
      );
      toaster.create({
        title: "Usuarios agregados correctamente",
        type: "success",
        duration: 3000,
      });
      setAddedUsers([]);
    } catch (error) {
      console.error("Error al confirmar usuarios:", error);
      toaster.create({ title: "Error al confirmar los usuarios", type: "error", duration: 3000 });
    }
  };

  return (
    <Box w="100%" minH="100vh" bg="#EFF2F9" p={8}>
      <Heading as="h1" size="xl" textAlign="center" color="teal.600" fontFamily="Raleway" mb={8}>
        Gestionar Asociación de Usuarios
      </Heading>

      <Stack gap={6} maxW="800px" mx="auto">
        {/* Search card */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="visible"
        >
          <Box bg="teal.500" px={6} py={3} roundedTop="xl">
            <Text fontWeight="semibold" fontSize="md" color="white">
              Agregar usuario al proyecto
            </Text>
          </Box>
          <Box p={6}>
            <Box position="relative" ref={dropdownRef}>
              <Box position="relative">
                <Input
                  placeholder="Buscar usuario por email..."
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  pr={isSearching ? "3rem" : undefined}
                />
                {isSearching && (
                  <Box
                    position="absolute"
                    right={3}
                    top="50%"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <Spinner size="sm" color="teal.500" />
                  </Box>
                )}
              </Box>

              {showDropdown && searchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="calc(100% + 4px)"
                  left={0}
                  right={0}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  boxShadow="lg"
                  zIndex={100}
                >
                  {searchResults.map((u) => (
                    <Box
                      key={u.idUser}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{ bg: "teal.50" }}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      onClick={() => handleSelectUser(u)}
                    >
                      <Text fontWeight="medium" fontSize="sm" color="gray.800">
                        {u.firstName} {u.lastName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {u.email}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Text fontSize="xs" color="gray.400" mt={2}>
              Escriba el email para buscar usuarios. Se mostrarán sugerencias automáticamente.
            </Text>
          </Box>
        </Box>

        {/* Users list card */}
        <Box
          bg="white"
          rounded="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box bg="teal.400" px={6} py={3}>
            <HStack justify="space-between">
              <Text fontWeight="semibold" fontSize="md" color="white">
                Usuarios en el proyecto
              </Text>
              <Badge bg="white" color="teal.700" px={2} rounded="full">
                {existingUsers.length}
              </Badge>
            </HStack>
          </Box>
          <Box p={6}>
            {existingUsers.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No hay usuarios asociados a este proyecto.
              </Text>
            ) : (
              <VStack gap={3} align="stretch">
                {existingUsers.map((u) => {
                  const isPending = addedUsers.some((a) => a.idUser === u.idUser);
                  return (
                    <Box
                      key={u.idUser}
                      p={4}
                      bg={isPending ? "teal.50" : "gray.50"}
                      rounded="lg"
                      border="1px solid"
                      borderColor={isPending ? "teal.200" : "gray.200"}
                    >
                      <HStack justify="space-between">
                        <Box>
                          <HStack gap={2} mb={1}>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                              {u.firstName} {u.lastName}
                            </Text>
                            {isPending && (
                              <Badge colorPalette="teal" size="sm">
                                Pendiente
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {u.email}
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          bg="red.500"
                          color="white"
                          _hover={{ bg: "red.600" }}
                          minW="100px"
                          px={6}
                          onClick={() => handleDeleteUser(u)}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Box>

        {/* Confirm button — only visible when there are pending users */}
        {addedUsers.length > 0 && (
          <Box textAlign="center">
            <Button
              bg="#1A865F"
              color="white"
              _hover={{ bg: "teal.500" }}
              onClick={confirmAssignment}
              size="lg"
              minW="200px"
            >
              Confirmar ({addedUsers.length} usuario{addedUsers.length !== 1 ? "s" : ""})
            </Button>
          </Box>
        )}
      </Stack>

      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirmar Eliminación"
        confirmLabel="Eliminar"
        confirmColorScheme="red"
        onConfirm={confirmDeleteUser}
      >
        {userToDelete ? (
          <>
            ¿Estás seguro que deseas eliminar a{" "}
            <strong>
              {userToDelete.firstName} {userToDelete.lastName}
            </strong>{" "}
            del proyecto?
          </>
        ) : (
          "¿Desea eliminar este usuario del proyecto?"
        )}
      </ConfirmModal>
    </Box>
  );
}

export default AssignUsers;
