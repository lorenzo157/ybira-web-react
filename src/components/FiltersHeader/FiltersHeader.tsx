import React, { FC } from "react";
import {
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  CheckboxHiddenInput,
  Flex,
  Input,
  Stack,
} from "@chakra-ui/react";
import NeighborhoodSelect from "../NeighborhoodSelect/NeighborhoodSelect";
import TreeSelect from "../TreeSelect/TreeSelect";
import { Tree } from "../../types/Tree";

const CL = CheckboxLabel as any;

interface Props {
  showNeighborhoodSelect?: boolean;
  showTreeSelect?: boolean;
  showDatesInput?: boolean;
  startDate?: string;
  endDate?: string;
  showAll?: boolean;
  onStartDateChange?: (value?: string) => void;
  onEndDateChange?: (value?: string) => void;
  onShowAllChange?: (checked: boolean) => void;
  trees?: Tree[];
  selectedTree?: Tree;
  onTreeSelect?: (tree?: Tree) => void;
  selectedNeighborhoodId?: number;
  onNeighborhoodSelect?: (id: number | undefined) => void;
  showTrees?: boolean;
  setShowTrees?: (show: boolean) => void;
  options?: string[];
  selectedOptions?: string[];
  setSelectedOptions?: (opts: string[]) => void;
}

const FiltersHeader: FC<Props> = ({
  showNeighborhoodSelect,
  showTreeSelect,
  showDatesInput = false,
  startDate,
  endDate,
  showAll = true,
  onStartDateChange,
  onEndDateChange,
  onShowAllChange,
  trees,
  selectedTree,
  onTreeSelect,
  selectedNeighborhoodId,
  onNeighborhoodSelect,
  showTrees: externalShowTrees,
  setShowTrees: externalSetShowTrees,
  options: externalOptions = [],
  selectedOptions: externalSelectedOptions = [],
  setSelectedOptions: externalSetSelectedOptions,
}) => {
  const actualShowTrees = externalShowTrees ?? false;
  const actualSetShowTrees = externalSetShowTrees ?? (() => {});
  const actualSelectedOptions = externalSelectedOptions ?? [];
  const actualSetSelectedOptions = externalSetSelectedOptions ?? (() => {});
  const actualOptions = externalOptions ?? [];

  const disabledInputs = false;

  const handleShowAllChange = (checked: boolean) => {
    onShowAllChange?.(checked);
    if (checked) {
      onStartDateChange?.(undefined);
      onEndDateChange?.(undefined);
    }
  };

  const handleStartDateChange = (value: string) => {
    onStartDateChange?.(value || undefined);
    if (showAll) onShowAllChange?.(false);
  };

  const handleEndDateChange = (value: string) => {
    onEndDateChange?.(value || undefined);
    if (showAll) onShowAllChange?.(false);
  };

  return (
    <Flex
      flexDir="row"
      justifyContent="flex-start"
      alignItems="center"
      py={2}
      flexWrap="wrap"
      gap={2}
    >
      {showNeighborhoodSelect && (
        <NeighborhoodSelect
          value={selectedNeighborhoodId}
          onChange={onNeighborhoodSelect}
          showTrees={actualShowTrees}
          setShowTrees={actualSetShowTrees}
          options={actualOptions}
          selectedOptions={actualSelectedOptions}
          setSelectedOptions={actualSetSelectedOptions}
        />
      )}

      {showTreeSelect && (
        <TreeSelect trees={trees} selectedTree={selectedTree} onChange={onTreeSelect} />
      )}

      {showDatesInput && (
        <Stack
          gap={6}
          direction="row"
          w="min-content"
          justifyContent="center"
          alignItems="center"
          color="white"
        >
          <Input
            disabled={disabledInputs}
            size="xs"
            placeholder="Fecha inicio"
            type="date"
            borderRadius="2px"
            value={startDate ?? ""}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
          <Input
            disabled={disabledInputs}
            size="xs"
            placeholder="Fecha fin"
            type="date"
            borderRadius="2px"
            value={endDate ?? ""}
            onChange={(e) => handleEndDateChange(e.target.value)}
          />
          <CheckboxRoot
            disabled={disabledInputs}
            checked={showAll}
            onCheckedChange={(e: any) => handleShowAllChange(!!e.checked)}
            size="sm"
            whiteSpace="nowrap"
            fontWeight="bold"
          >
            <CheckboxHiddenInput />
            <CheckboxControl />
            <CL>Mostrar todos</CL>
          </CheckboxRoot>
        </Stack>
      )}
    </Flex>
  );
};

export default FiltersHeader;
