import React, { FC } from "react";
import { Center, Text } from "@chakra-ui/react";

interface Props {
  text: string;
}
const CenteredText: FC<Props> = ({ text }) => {
  return (
    <Center w="100%" h="100%">
      <Text fontSize={"xl"}>{text}</Text>
    </Center>
  );
};

export default CenteredText;
