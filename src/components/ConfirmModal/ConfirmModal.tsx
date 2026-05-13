import React from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogBody,
  DialogFooter,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColorScheme?: string;
  onConfirm: () => void;
}

// Chakra UI v3 Dialog components accept children at runtime but their TS types are missing it.
const DC = DialogContent as any;
const DP = DialogPositioner as any;
const DB = DialogBody as any;
const DF = DialogFooter as any;

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmColorScheme = "green",
  onConfirm,
}) => {
  const isRed = confirmColorScheme === "red";

  return (
    <DialogRoot open={isOpen} onOpenChange={(e: any) => !e.open && onClose()}>
      <DialogBackdrop />
      <DP>
        <DC borderRadius="xl" boxShadow="xl" overflow="hidden" maxW="440px" w="90vw">
          {/* Colored header bar */}
          <Box bg={isRed ? "red.500" : "teal.500"} px={6} py={4}>
            <Text fontWeight="bold" fontSize="lg" color="white">
              {title}
            </Text>
          </Box>

          <DB px={6} py={5}>
            <Text fontSize="sm" color="gray.700">
              {children}
            </Text>
          </DB>

          <DF px={6} pb={5} gap={3} justifyContent="flex-end">
            <Button
              bg="white"
              color="gray.600"
              border="1px solid"
              borderColor="gray.300"
              _hover={{ bg: "gray.50" }}
              minW="110px"
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              bg={isRed ? "red.500" : "#1A865F"}
              color="white"
              _hover={{ bg: isRed ? "red.600" : "teal.500" }}
              minW="110px"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </DF>
        </DC>
      </DP>
    </DialogRoot>
  );
};

export default ConfirmModal;
