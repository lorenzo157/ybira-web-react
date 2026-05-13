import { useState, useEffect, useRef } from "react";
import { Flex, Text, Box, Button, HStack } from "@chakra-ui/react";
import TreeSpinner from "../TreeSpinner/TreeSpinner";
import { MapRef } from "../../types/Map";
import { FilterLabels } from "../../types/Project";
import { getAllFiltersByUnitWork } from "../../services/TreeService";

interface MapFiltersProps {
  disabled?: boolean;
  idProject: number;
  idUnitWork?: number;
  map?: MapRef;
  onApplyFilters: (filters: Record<string, string[]>) => void;
  onShowFilteredTotals?: (value: boolean) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  disabled = false,
  idProject,
  idUnitWork,
  onApplyFilters,
  onShowFilteredTotals,
}) => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const data = await getAllFiltersByUnitWork(idProject, idUnitWork ?? 0);
        if (!Array.isArray(data)) throw new Error("Formato inesperado.");
        const normalizedFilters: Record<string, string[]> = data.reduce(
          (acc, filter) => {
            const { filterName, values } = filter;
            acc[filterName] = values.map((value: any) => {
              if (typeof value === "string") return value;
              if (typeof value === "object" && value !== null) {
                return value[filterName] ?? Object.values(value)[0]?.toString() ?? "Desconocido";
              }
              return value?.toString() || "Desconocido";
            });
            return acc;
          },
          {} as Record<string, string[]>,
        );
        setFilters(normalizedFilters);
      } catch (err) {
        console.error("Error al obtener filtros:", err);
        setError("No se pudieron cargar los filtros.");
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, [idProject, idUnitWork]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown]?.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const handleOnChange = (param: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[param]?.includes(value)) {
        updated[param] = updated[param].filter((v) => v !== value);
      } else {
        updated[param] = [...(updated[param] || []), value];
      }
      return updated;
    });
  };

  const handleApply = () => {
    const validFilters = Object.keys(selectedFilters).reduce(
      (acc, key) => {
        if (Object.prototype.hasOwnProperty.call(filters, key)) acc[key] = selectedFilters[key];
        return acc;
      },
      {} as Record<string, string[]>,
    );
    onApplyFilters(validFilters);
    onShowFilteredTotals?.(true);
  };

  const handleReset = () => {
    setSelectedFilters({});
    onApplyFilters({});
    onShowFilteredTotals?.(false);
  };

  const activeFilterCount = Object.values(selectedFilters).filter((v) => v.length > 0).length;

  return (
    <Box
      bg="white"
      rounded="xl"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      display="flex"
      flexDir="column"
    >
      {/* Header */}
      <Box bg="teal.500" px={5} py={3} borderTopRadius="xl">
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold" fontSize="md" color="white">
            Filtros
          </Text>
          {activeFilterCount > 0 && (
            <Box
              bg="white"
              color="teal.600"
              fontSize="xs"
              fontWeight="bold"
              px={2}
              py={0.5}
              rounded="full"
            >
              {activeFilterCount} activos
            </Box>
          )}
        </Flex>
      </Box>

      {/* Body */}
      <Box px={4} py={4}>
        {loading ? (
          <Flex justify="center" align="center" py={4}>
            <TreeSpinner />
          </Flex>
        ) : error ? (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        ) : (
          <Flex flexWrap="wrap" gap={2}>
            {Object.entries(filters).map(([filterName, filterValues]) => {
              const values = filterValues || [];
              const label = FilterLabels[filterName as keyof typeof FilterLabels] || filterName;
              const isSelected = (selectedFilters[filterName]?.length ?? 0) > 0;
              const selectedCount = selectedFilters[filterName]?.length ?? 0;

              return (
                <Box
                  key={filterName}
                  position="relative"
                  ref={(el: HTMLDivElement | null) => {
                    dropdownRefs.current[filterName] = el;
                  }}
                >
                  <Button
                    onClick={() => setOpenDropdown(openDropdown === filterName ? null : filterName)}
                    disabled={disabled}
                    size="sm"
                    bg={isSelected ? "teal.500" : "gray.50"}
                    color={isSelected ? "white" : "gray.700"}
                    border="1px solid"
                    borderColor={isSelected ? "teal.500" : "gray.200"}
                    _hover={{ bg: isSelected ? "teal.600" : "gray.100" }}
                    fontWeight="medium"
                    fontSize="xs"
                    px={3}
                    h="32px"
                    gap={1}
                  >
                    {label}
                    {selectedCount > 0 && (
                      <Box
                        as="span"
                        bg="white"
                        color="teal.600"
                        fontSize="10px"
                        fontWeight="bold"
                        px={1.5}
                        py={0.5}
                        rounded="full"
                        lineHeight="1"
                      >
                        {selectedCount}
                      </Box>
                    )}
                    <Box as="span" ml={1} fontSize="10px" opacity={0.8}>
                      ▾
                    </Box>
                  </Button>

                  {openDropdown === filterName && (
                    <Box
                      position="absolute"
                      zIndex={100}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      minW="220px"
                      w="max-content"
                      mt={1}
                      rounded="lg"
                      boxShadow="lg"
                      overflow="hidden"
                    >
                      <Box maxH="200px" overflow="auto">
                        {values.map((value) => {
                          const checked = selectedFilters[filterName]?.includes(value) ?? false;
                          return (
                            <Flex
                              key={value}
                              as="label"
                              align="center"
                              gap={2.5}
                              px={3}
                              py={2}
                              cursor="pointer"
                              bg={checked ? "teal.50" : "white"}
                              _hover={{ bg: checked ? "teal.50" : "gray.50" }}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                              onClick={() => handleOnChange(filterName, value)}
                            >
                              {/* Custom checkbox */}
                              <Box
                                w="16px"
                                h="16px"
                                minW="16px"
                                rounded="sm"
                                border="2px solid"
                                borderColor={checked ? "teal.500" : "gray.300"}
                                bg={checked ? "teal.500" : "white"}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {checked && (
                                  <Box as="span" color="white" fontSize="10px" lineHeight="1">
                                    ✓
                                  </Box>
                                )}
                              </Box>
                              <Text fontSize="sm" color="gray.700" userSelect="none">
                                {value}
                              </Text>
                            </Flex>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Flex>
        )}
      </Box>

      {/* Footer actions */}
      <Box px={4} py={3} borderTop="1px solid" borderColor="gray.100">
        <HStack gap={2} justify="flex-end">
          <Button
            size="sm"
            bg="white"
            color="gray.600"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ bg: "gray.50" }}
            onClick={handleReset}
            disabled={disabled}
            minW="120px"
          >
            Reiniciar
          </Button>
          <Button
            size="sm"
            bg="#1A865F"
            color="white"
            _hover={{ bg: "teal.500" }}
            onClick={handleApply}
            disabled={disabled}
            minW="120px"
          >
            Aplicar filtros
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default MapFilters;
