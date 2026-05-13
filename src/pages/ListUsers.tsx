import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllRoles,
  getAllProvinces,
  getCitiesByProvinceId,
} from "../services/UserService";
import { toaster } from "../utils/toaster";
import {
  Box,
  Spinner,
  Text,
  AvatarRoot,
  AvatarFallback,
  Flex,
  Button,
  Input,
  HStack,
  Field,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from "@chakra-ui/react";
import { Role } from "../types/Role";

const ListUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    roleName: string;
    address: string;
    provinceName: string;
    cityName: string;
    heightMeters: string;
    password: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleName: "",
    address: "",
    provinceName: "",
    cityName: "",
    heightMeters: "",
    password: "",
  });
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
    getAllRoles()
      .then((data: Role[]) => setRoles(data.map((r) => ({ label: r.roleName, value: r.roleName }))))
      .catch(() => {});
    getAllProvinces()
      .then((data: any[]) =>
        setProvinces(data.map((p) => ({ label: p.provinceName, value: p.provinceName }))),
      )
      .catch(() => {});
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: any) => {
    setEditingId(user.idUser);
    setEditForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
      roleName: user.roleName ?? "",
      address: user.address ?? "",
      provinceName: user.provinceName ?? "",
      cityName: user.cityName ?? "",
      heightMeters: user.heightMeters != null ? String(user.heightMeters) : "",
      password: "",
    });
    if (user.provinceName) {
      getCitiesByProvinceId(user.provinceName)
        .then((data: any[]) =>
          setCities(data.map((c) => ({ label: c.cityName, value: c.cityName }))),
        )
        .catch(() => setCities([]));
    } else {
      setCities([]);
    }
  };

  const handleSave = async (idUser: number) => {
    setSaving(true);
    try {
      const { password, ...rest } = editForm;
      const payload: any = {
        ...rest,
        heightMeters: Number(editForm.heightMeters),
      };
      if (password.trim()) payload.password = password;
      await updateUser(idUser, payload);
      setUsers((prev) => prev.map((u) => (u.idUser === idUser ? { ...u, ...payload } : u)));
      setEditingId(null);
      toaster.create({ title: "Usuario actualizado con éxito", type: "success", duration: 3000 });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toaster.create({ title: "Error al actualizar usuario", type: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idUser: number) => {
    setDeletingId(idUser);
    try {
      await deleteUser(idUser);
      setUsers((prev) => prev.filter((u) => u.idUser !== idUser));
      toaster.create({ title: "Usuario eliminado", type: "success", duration: 3000 });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toaster.create({ title: "Error al eliminar usuario", type: "error", duration: 3000 });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bgColor="#EFF2F9" p={8}>
      <Box maxW="760px" mx="auto">
        {/* Header card */}
        <Box
          bg="white"
          rounded="xl"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="sm"
          overflow="hidden"
          mb={6}
        >
          <Box bg="teal.500" px={6} py={4}>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold" fontSize="xl" color="white" fontFamily="Raleway">
                  Lista de Usuarios
                </Text>
                <Text fontSize="sm" color="teal.100">
                  {users.length} usuarios registrados
                </Text>
              </Box>
              <Button
                size="sm"
                bg="white"
                color="teal.700"
                _hover={{ bg: "teal.50" }}
                fontWeight="semibold"
                px={6}
                minW="140px"
                onClick={() => navigate("/register")}
              >
                + Crear usuario
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* Search */}
        <Box mb={4}>
          <Input
            placeholder="Buscar por nombre, apellido, email o id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
            borderRadius="lg"
            borderColor="gray.300"
            _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
          />
        </Box>

        {/* User cards */}
        <Flex direction="column" gap={3}>
          {users.length > 0 ? (
            users
              .filter((u) => {
                const q = searchQuery.toLowerCase();
                return (
                  !q ||
                  u.firstName?.toLowerCase().includes(q) ||
                  u.lastName?.toLowerCase().includes(q) ||
                  u.email?.toLowerCase().includes(q) ||
                  String(u.idUser).includes(q)
                );
              })
              .map((user) => (
                <Box
                  key={user.idUser}
                  bg="white"
                  rounded="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="sm"
                  overflow="hidden"
                >
                  {editingId === user.idUser ? (
                    /* ── Edit form ── */
                    <Box px={5} py={4}>
                      <Text fontSize="sm" fontWeight="semibold" color="teal.600" mb={3}>
                        Editando usuario
                      </Text>

                      {/* Row 1: Nombre + Apellido */}
                      <Flex gap={3} wrap="wrap" mb={3}>
                        <Field.Root required flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Nombre
                          </Field.Label>
                          <Input
                            size="sm"
                            value={editForm.firstName}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, firstName: e.target.value }))
                            }
                          />
                        </Field.Root>
                        <Field.Root required flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Apellido
                          </Field.Label>
                          <Input
                            size="sm"
                            value={editForm.lastName}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, lastName: e.target.value }))
                            }
                          />
                        </Field.Root>
                      </Flex>

                      {/* Row 2: Email + Teléfono */}
                      <Flex gap={3} wrap="wrap" mb={3}>
                        <Field.Root required flex={2} minW="200px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Email
                          </Field.Label>
                          <Input
                            size="sm"
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          />
                        </Field.Root>
                        <Field.Root flex={1} minW="120px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Teléfono{" "}
                            <span style={{ color: "gray", fontWeight: 400 }}>(opcional)</span>
                          </Field.Label>
                          <Input
                            size="sm"
                            value={editForm.phoneNumber}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))
                            }
                          />
                        </Field.Root>
                      </Flex>

                      {/* Row 3: Dirección + Altura */}
                      <Flex gap={3} wrap="wrap" mb={3}>
                        <Field.Root flex={2} minW="200px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Dirección{" "}
                            <span style={{ color: "gray", fontWeight: 400 }}>(opcional)</span>
                          </Field.Label>
                          <Input
                            size="sm"
                            value={editForm.address}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, address: e.target.value }))
                            }
                          />
                        </Field.Root>
                        <Field.Root required flex={1} minW="100px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Altura (m)
                          </Field.Label>
                          <Input
                            size="sm"
                            type="number"
                            step="0.01"
                            value={editForm.heightMeters}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, heightMeters: e.target.value }))
                            }
                          />
                        </Field.Root>
                      </Flex>

                      {/* Row 4: Provincia + Ciudad */}
                      <Flex gap={3} wrap="wrap" mb={3}>
                        <Field.Root required flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Provincia
                          </Field.Label>
                          <NativeSelectRoot size="sm">
                            <NativeSelectField
                              value={editForm.provinceName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditForm((f) => ({ ...f, provinceName: val, cityName: "" }));
                                setCities([]);
                                if (val) {
                                  getCitiesByProvinceId(val)
                                    .then((data: any[]) =>
                                      setCities(
                                        data.map((c) => ({ label: c.cityName, value: c.cityName })),
                                      ),
                                    )
                                    .catch(() => setCities([]));
                                }
                              }}
                            >
                              <option value="">Seleccione una provincia</option>
                              {provinces.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.label}
                                </option>
                              ))}
                            </NativeSelectField>
                            <NativeSelectIndicator />
                          </NativeSelectRoot>
                        </Field.Root>
                        <Field.Root required flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Ciudad
                          </Field.Label>
                          <NativeSelectRoot size="sm" disabled={!editForm.provinceName}>
                            <NativeSelectField
                              value={editForm.cityName}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, cityName: e.target.value }))
                              }
                            >
                              <option value="">Seleccione una ciudad</option>
                              {cities.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </NativeSelectField>
                            <NativeSelectIndicator />
                          </NativeSelectRoot>
                        </Field.Root>
                      </Flex>

                      {/* Row 5: Rol + Contraseña */}
                      <Flex gap={3} wrap="wrap" mb={4}>
                        <Field.Root required flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Rol
                          </Field.Label>
                          <NativeSelectRoot size="sm">
                            <NativeSelectField
                              value={editForm.roleName}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, roleName: e.target.value }))
                              }
                            >
                              <option value="">Seleccione un rol</option>
                              {roles.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </NativeSelectField>
                            <NativeSelectIndicator />
                          </NativeSelectRoot>
                        </Field.Root>
                        <Field.Root flex={1} minW="140px">
                          <Field.Label fontSize="xs" color="gray.500" fontWeight="semibold">
                            Contraseña{" "}
                            <span style={{ color: "gray", fontWeight: 400 }}>(opcional)</span>
                          </Field.Label>
                          <Input
                            size="sm"
                            type="password"
                            placeholder="Dejar vacío para no cambiar"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, password: e.target.value }))
                            }
                          />
                        </Field.Root>
                      </Flex>

                      <HStack gap={3} justify="flex-end">
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.600"
                          _hover={{ bg: "gray.50" }}
                          minW="130px"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          bg="#1A865F"
                          color="white"
                          _hover={{ bg: "teal.500" }}
                          minW="160px"
                          onClick={() => handleSave(user.idUser)}
                          loading={saving}
                        >
                          Guardar cambios
                        </Button>
                      </HStack>
                    </Box>
                  ) : (
                    /* ── Display row ── */
                    <Flex align="center" justify="space-between" px={5} py={3}>
                      <Flex align="center" gap={4}>
                        <AvatarRoot size="md" bg="teal.500">
                          <AvatarFallback color="white" fontWeight="bold">
                            {user.firstName?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </AvatarRoot>
                        <Box>
                          <Flex align="center" gap={2}>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                              {user.firstName} {user.lastName}
                            </Text>
                            <Text fontSize="10px" color="gray.400" fontWeight="normal">
                              #{user.idUser}
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                          {user.roleName && (
                            <Box
                              display="inline-block"
                              mt={0.5}
                              px={2}
                              py={0.5}
                              bg="teal.50"
                              color="teal.700"
                              fontSize="10px"
                              fontWeight="semibold"
                              rounded="full"
                              border="1px solid"
                              borderColor="teal.200"
                            >
                              {user.roleName}
                            </Box>
                          )}
                        </Box>
                      </Flex>
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          bg="teal.500"
                          color="white"
                          _hover={{ bg: "teal.600" }}
                          fontWeight="medium"
                          fontSize="xs"
                          px={4}
                          onClick={() => startEdit(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          bg="red.50"
                          color="red.600"
                          border="1px solid"
                          borderColor="red.200"
                          _hover={{ bg: "red.100" }}
                          fontWeight="medium"
                          fontSize="xs"
                          px={4}
                          onClick={() => handleDelete(user.idUser)}
                          loading={deletingId === user.idUser}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </Flex>
                  )}
                </Box>
              ))
          ) : (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchQuery
                ? "No se encontraron usuarios con ese criterio."
                : "No hay usuarios disponibles."}
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default ListUsers;
