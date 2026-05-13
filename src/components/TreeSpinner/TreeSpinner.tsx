import { Flex, Spinner, Text } from "@chakra-ui/react";
import React from "react";

const TreeSpinner = () => {
  return (
    <Flex alignItems={"center"} justifyContent="center" direction={"column"} gap={2} color="white">
      <Spinner size="md" />
      <Text fontWeight={"black"}>Descargando datos</Text>
    </Flex>
  );
};

export default TreeSpinner;
