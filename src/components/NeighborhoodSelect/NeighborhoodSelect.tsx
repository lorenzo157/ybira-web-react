import React from "react";
import {
  Flex,
  Box,
  Text,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItemGroup,
  MenuCheckboxItem,
  chakra,
} from "@chakra-ui/react";
import { useData } from "../../context/dataContext";
import { FaChevronDown } from "react-icons/fa";

const MT = MenuTrigger as any;
const MC = MenuContent as any;
const MIG = MenuItemGroup as any;
const MCI = MenuCheckboxItem as any;

interface Props {
  value?: number;
  onChange?: (value: number | undefined) => void;
  showTrees: boolean;
  setShowTrees: (show: boolean) => void;
  options: string[];
  selectedOptions: string[];
  setSelectedOptions: (opts: string[]) => void;
}

const NeighborhoodSelect: React.FC<Props> = ({
  value,
  onChange,
  showTrees,
  setShowTrees,
  options,
  selectedOptions,
  setSelectedOptions,
}) => {
  useData();

  return (
    <>
      <Flex px="6" pt="4" pb="2" align="center" bg="#EFF2F9" gap={6} mt={4}>
        <MenuRoot>
          <MT asChild>
            <chakra.button
              px={4}
              py={2}
              display="inline-flex"
              alignItems="center"
              gap={2}
              flexWrap="wrap"
              fontWeight="medium"
              border="1px solid"
              borderColor="teal.500"
              borderRadius="md"
              color="teal.700"
              bg="white"
              _hover={{ bg: "teal.50" }}
            >
              <Flex gap={2} align="center" flexWrap="wrap">
                {selectedOptions.map((opt: string) => (
                  <Flex
                    key={opt}
                    align="center"
                    bg="teal.100"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {opt}
                    <chakra.span
                      ml={1}
                      cursor="pointer"
                      fontWeight="bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOptions.length === 1) return;
                        setSelectedOptions(selectedOptions.filter((o) => o !== opt));
                      }}
                    >
                      ×
                    </chakra.span>
                  </Flex>
                ))}
                <FaChevronDown />
              </Flex>
            </chakra.button>
          </MT>
          <MC
            minWidth="240px"
            zIndex="popover"
            p={0}
            rounded="xl"
            overflow="hidden"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box bg="teal.500" px={4} py={2.5}>
              <Text fontWeight="semibold" fontSize="sm" color="white">
                Seleccionar barrio
              </Text>
            </Box>
            <MIG>
              {options.map((option) => (
                <MCI
                  key={option}
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked: any) => {
                    const next = checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((o: string) => o !== option);
                    if (next.length === 0) return;
                    setSelectedOptions(next);
                  }}
                  px={4}
                  py={2.5}
                  fontSize="sm"
                  color="gray.700"
                  _hover={{ bg: "teal.50", color: "teal.700" }}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  {option}
                </MCI>
              ))}
            </MIG>
          </MC>
        </MenuRoot>
      </Flex>
    </>
  );
};

export default NeighborhoodSelect;
