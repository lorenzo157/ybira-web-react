import React, { FC } from "react";
import { Popup, CircleMarker } from "react-leaflet";
import { Flex, Text } from "@chakra-ui/react";
import { LeafletMouseEvent } from "leaflet";
import { Tree } from "../../types/Tree";
import { MarkerRadius, TreeColor } from "../../types/Map";

interface Props {
  tree: Tree;
  onClick?: () => void;
  isSelected?: boolean; // <- Recibido desde el componente padre
}

const TreeMarker: FC<Props> = ({ tree, onClick, isSelected }) => {
  const handleOnClickMarker = (e: LeafletMouseEvent) => {
    onClick?.(); // Llama al handler externo, que puede actualizar selectedTree
  };

  const handleOnMouseOverMarker = (e: LeafletMouseEvent) => {
    e.target.openPopup();
  };

  const handleOnMouseOutMarker = (e: LeafletMouseEvent) => {
    e.target.closePopup();
  };

  if (!tree.latitude || !tree.longitude) {
    console.warn(`Tree ID: ${tree.idTree} has missing coordinates.`);
    return null;
  }

  const isSelectedTree = isSelected ?? false;

  return (
    <CircleMarker
      center={{ lat: tree.latitude, lng: tree.longitude }}
      radius={isSelectedTree ? MarkerRadius.Selected : MarkerRadius.NotSelected}
      pathOptions={{
        color: isSelectedTree ? TreeColor.Selected : (tree.color ?? TreeColor.NotSelected),
        fillColor: isSelectedTree ? TreeColor.Selected : (tree.color ?? TreeColor.NotSelected),
        fillOpacity: 1,
      }}
      eventHandlers={{
        click: handleOnClickMarker,
        mouseover: handleOnMouseOverMarker,
        mouseout: handleOnMouseOutMarker,
      }}
    >
      <Popup closeOnClick={true} autoClose={false} closeButton={false}>
        <Flex flexDirection="column">
          <Text fontSize="xl" fontWeight="bold" p={0} m={0}>
            {`Arbol ID: ${tree.idTree}`}
          </Text>
        </Flex>
      </Popup>
    </CircleMarker>
  );
};

export default TreeMarker;
