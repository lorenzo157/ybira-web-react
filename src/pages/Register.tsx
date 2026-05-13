import React, { ChangeEvent, useEffect, useState } from "react";
import {
  FieldRoot,
  FieldLabel,
  Flex,
  Input,
  Button,
  Box,
  Text,
  Stack,
  Heading,
  Center,
  Spinner,
  SimpleGrid,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { toaster } from "../utils/toaster";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import {
  createUser,
  getAllProvinces,
  getCitiesByProvinceId,
  getUserById,
  updateProfile,
} from "../services/UserService";
import { getAllRoles } from "../services/UserService";
import { Province } from "../types/Location/Province";
import { Role } from "../types/Role";
import { City } from "../types/Location/City";
import { User } from "../types/User";

// Chakra UI v3: FieldLabel children type is missing in TS definitions — use cast.
const FL = FieldLabel as any;

const Register = () => {
  const navigate = useNavigate();
  const { idUser } = useParams<{ idUser?: string }>();
  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    cityName: "",
    provinceName: "",
    roleName: "",
    heightMeters: undefined,
  });
  const [role, setRole] = useState<{ label: string; value: string } | null>(null);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
  const [province, setProvince] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [city, setCity] = useState<{ label: string; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  const handleShowPasswordClick = () => setShowPassword(!showPassword);
  const handleShowPasswordRepeatClick = () => setShowPasswordRepeat(!showPasswordRepeat);
  const handlePasswordRepeatChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordRepeat(e.target.value);
  };
  const [rawUserData, setRawUserData] = useState<any>(null);

  useEffect(() => {
    getProvinces();
    getRoles();
    if (idUser) {
      fetchUser(Number(idUser));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rawUserData || provinces.length === 0) return;

    const selectedProvince = provinces.find((p) => p.label === rawUserData.provinceName);
    setProvince(selectedProvince || null);

    if (selectedProvince) {
      getCitiesByProvinceId(selectedProvince.value).then((citiesResponse) => {
        const formatCities = citiesResponse.map((city: City) => ({
          label: city.cityName,
          value: city.cityName,
        }));
        setCities(formatCities);
        const selectedCity = formatCities.find(
          (c: { label: any }) => c.label === rawUserData.cityName,
        );
        setCity(selectedCity || null);
      });
    }

    if (roles.length > 0) {
      const selectedRole = roles.find((r) => r.label === rawUserData.roleName);
      setRole(selectedRole || null);
    }
  }, [rawUserData, provinces, roles]);

  const fetchUser = async (id: number) => {
    try {
      setIsLoading(true);
      const userData = await getUserById(id);
      if (userData) {
        setUser({
          ...userData,
          password: "",
        });
        setRawUserData(userData);
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const getProvinces = async () => {
    try {
      const response = await getAllProvinces();
      const formatProvinces = response.map((province: Province) => ({
        label: province.provinceName,
        value: province.provinceName,
      }));
      setProvinces(formatProvinces);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getRoles = async () => {
    try {
      const response = await getAllRoles();
      const formatRoles = response.map((role: Role) => ({
        label: role.roleName,
        value: String(role.idRole),
      }));
      setRoles(formatRoles);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getCities = async (provinceName: string) => {
    try {
      const response = await getCitiesByProvinceId(provinceName);
      const formatCities = response.map((city: City) => ({
        label: city.cityName,
        value: city.cityName,
      }));
      setCities(formatCities);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser((prevUser: any) => {
      const newUser = { ...prevUser, [name]: value };
      return newUser;
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user.password !== passwordRepeat) {
      return;
    }
    try {
      setIsLoading(true);

      const userData = {
        ...user,
        cityName: city?.label || "",
        provinceName: province?.label || "",
        roleName: role?.label || "",
      };

      if (idUser) {
        await updateProfile(Number(idUser), userData);
        toaster.create({
          title: "Actualización",
          description: `Usuario ${userData.email} actualizado con éxito.`,
          type: "success",
          duration: 5000,
        });
        navigate("/home");
      } else {
        await createUser(userData);
        toaster.create({
          title: "Registración",
          description: `Usuario ${userData.email} creado con éxito.`,
          type: "success",
          duration: 5000,
        });

        setUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          address: "",
          cityName: "",
          provinceName: "",
          roleName: "",
          heightMeters: undefined,
        });
        setRole(null);
        setProvince(null);
        setCity(null);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center backgroundColor="gray.200" w="100vw" h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        background: "#EFF2F9",
        padding: "1rem 0",
      }}
    >
      <Box w="90vw" maxW="900px" mx="auto">
        <Heading as="h1" size="lg" textAlign="center" color="teal.600" fontFamily="Raleway" mb={4}>
          {idUser ? "Editar Usuario" : "Registrar Usuario"}
        </Heading>

        <Stack gap={3}>
          {/* Grupo 1: Datos personales */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.500" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Datos personales
              </Text>
            </Box>
            <Box px={4} py={3}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <FieldRoot required>
                  <FL>Nombre</FL>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={user.firstName || ""}
                    onChange={handleChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FL>Apellido</FL>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={user.lastName || ""}
                    onChange={handleChange}
                  />
                </FieldRoot>
                <FieldRoot>
                  <FL>Dirección</FL>
                  <Input
                    id="address"
                    name="address"
                    value={user.address || ""}
                    onChange={handleChange}
                  />
                </FieldRoot>
                <FieldRoot>
                  <FL>Teléfono</FL>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={user.phoneNumber || ""}
                    onChange={handleChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FL>Email</FL>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email || ""}
                    onChange={handleChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FL>Altura (metros)</FL>
                  <Input
                    id="heightMeters"
                    name="heightMeters"
                    type="number"
                    step="0.01"
                    min="0"
                    value={user.heightMeters ?? ""}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        heightMeters: e.target.value !== "" ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </FieldRoot>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Grupo 2: Contraseña */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.400" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Contraseña
              </Text>
            </Box>
            <Box px={4} py={3}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <FieldRoot required={!idUser}>
                  <FL>Contraseña</FL>
                  <Box position="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={user.password || ""}
                      onChange={handleChange}
                      autoComplete="new-password"
                      pr="3rem"
                    />
                    <Box
                      position="absolute"
                      right={3}
                      top="50%"
                      style={{ transform: "translateY(-50%)", cursor: "pointer" }}
                      color="gray.400"
                      onClick={handleShowPasswordClick}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  </Box>
                </FieldRoot>
                <FieldRoot required={!idUser}>
                  <FL>Repetir contraseña</FL>
                  <Box position="relative">
                    <Input
                      type={showPasswordRepeat ? "text" : "password"}
                      id="passwordRepeat"
                      name="passwordRepeat"
                      value={passwordRepeat}
                      onChange={handlePasswordRepeatChange}
                      pr="3rem"
                    />
                    <Box
                      position="absolute"
                      right={3}
                      top="50%"
                      style={{ transform: "translateY(-50%)", cursor: "pointer" }}
                      color="gray.400"
                      onClick={handleShowPasswordRepeatClick}
                    >
                      {showPasswordRepeat ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  </Box>
                </FieldRoot>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Grupo 3: Ubicación */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.300" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Ubicación
              </Text>
            </Box>
            <Box px={4} py={3}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <FieldRoot required>
                  <FL>Provincia</FL>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={province?.value || ""}
                      onChange={(e) => {
                        const selected = provinces.find((p) => p.value === e.target.value) || null;
                        setProvince(selected);
                        setCity(null);
                        setCities([]);
                        setUser((prev) => ({ ...prev, provinceName: selected?.label || "" }));
                        if (selected) getCities(selected.value);
                      }}
                    >
                      <option value="">Seleccione una provincia</option>
                      {provinces.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
                <FieldRoot>
                  <FL>Ciudad</FL>
                  <NativeSelectRoot disabled={!province}>
                    <NativeSelectField
                      value={city?.value || ""}
                      onChange={(e) => {
                        const selected = cities.find((c) => c.value === e.target.value) || null;
                        setCity(selected);
                        setUser((prev) => ({ ...prev, cityName: selected?.label || "" }));
                      }}
                    >
                      <option value="">Seleccione una ciudad</option>
                      {cities.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Grupo 4: Rol */}
          <Box
            bg="white"
            rounded="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="teal.300" px={4} py={2}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Rol
              </Text>
            </Box>
            <Box px={4} py={3}>
              <FieldRoot required>
                <FL>Rol</FL>
                {idUser ? (
                  <Input value={role?.label || ""} readOnly bg="gray.50" color="gray.600" />
                ) : (
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={role?.value || ""}
                      onChange={(e) => {
                        const selected = roles.find((r) => r.value === e.target.value) || null;
                        setRole(selected);
                        setUser((prev) => ({ ...prev, roleName: selected?.label || "" }));
                      }}
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                )}
              </FieldRoot>
            </Box>
          </Box>

          {/* Botones */}
          <Flex justify="center" wrap="wrap" gap={3} pb={2}>
            <Button
              bg="#1A865F"
              color="white"
              _hover={{ bg: "teal.500" }}
              type="submit"
              size="md"
              minW="140px"
            >
              {idUser ? "Editar Usuario" : "Registrar Usuario"}
            </Button>
            <Button
              bg="white"
              color="gray.600"
              variant="outline"
              _hover={{
                bg: "teal.50",
                color: "teal.700",
                borderColor: "teal.300",
              }}
              size="md"
              minW="140px"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </Flex>
        </Stack>
      </Box>
    </form>
  );
};

export default Register;
