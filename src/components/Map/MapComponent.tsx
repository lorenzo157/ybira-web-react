import { Map, LeafletMouseEvent, LatLngTuple } from "leaflet";
import { FC, Ref } from "react";
import {
  MapContainer,
  Polygon,
  Polyline,
  CircleMarker,
  TileLayer,
  Tooltip,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Neighborhood } from "../../types/Neighborhood";
import { Tree } from "../../types/Tree";
import { Coordinate } from "../../types/Location/Coordinate";
import TreeMarker from "./TreeMarker";
import ChangeView from "./ChangeView";
import { getNeighborhoodColor } from "./utils";
import { City } from "../../types/User";
import { Flex, Text } from "@chakra-ui/react";

interface Props {
  city?: City;
  center?: LatLngTuple;
  mapRef?: Ref<Map>;
  neighborhoods?: Neighborhood[];
  trees?: Tree[];
  showTrees?: boolean;
  showMarkers?: boolean;
  selectedTree?: Tree;
  onTreeSelect?: (tree: Tree) => void;
  selectedNeighborhood?: Neighborhood;
  selectedNeighborhoodID?: string;
  setNeighborhoodSelected?: (neigh?: Neighborhood) => void;
  setSelectedNeighborhoodID?: (id: string) => void;
  selectableNeighborhoods?: boolean;
  showPopup?: boolean;
  zoom?: number;
  /** Called when the user clicks the map (used to add boundary nodes) */
  onMapClick?: (lat: number, lng: number) => void;
  /** In-progress boundary nodes to draw while creating a neighborhood */
  drawnCoordinates?: Coordinate[];
}

const baseFillOpacity = 0.3;

const parseCoordinates = (coords: any[]): LatLngTuple[] => {
  const parsed = coords
    .map((c) => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      return !isNaN(lat) && !isNaN(lng) ? ([lat, lng] as LatLngTuple) : null;
    })
    .filter((c): c is LatLngTuple => c !== null);

  if (parsed.length >= 3) {
    const [firstLat, firstLng] = parsed[0];
    const [lastLat, lastLng] = parsed[parsed.length - 1];
    if (firstLat !== lastLat || firstLng !== lastLng) {
      parsed.push(parsed[0]);
    }
  }

  return parsed;
};

const getPolygonCenter = (coords: LatLngTuple[]): LatLngTuple => {
  const lat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
  const lng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  return [lat, lng];
};

/** Inner component: captures map clicks and passes them up */
const MapClickHandler: FC<{ onMapClick: (lat: number, lng: number) => void }> = ({
  onMapClick,
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapComponent: FC<Props> = ({
  city,
  mapRef,
  center,
  neighborhoods = [],
  trees = [],
  showTrees = true,
  showMarkers = true,
  selectedTree,
  onTreeSelect,
  selectedNeighborhoodID,
  setNeighborhoodSelected,
  setSelectedNeighborhoodID,
  selectableNeighborhoods = false,
  showPopup = false,
  zoom = 13,
  onMapClick,
  drawnCoordinates = [],
}) => {
  const indices = neighborhoods
    .map((n) => ({
      simpson: Number(n.additionalInfo?.simpsonIndex),
      count: Number(n.additionalInfo?.totalTreesCount),
    }))
    .filter((n) => typeof n.simpson === "number" && typeof n.count === "number");

  const totalTrees = indices.reduce((sum, item) => sum + item?.count, 0);

  const simpsonCity = indices.reduce(
    (sum, item) => sum + (item?.simpson * item?.count) / totalTrees,
    0,
  );

  const handlePolygonClick = (_e: LeafletMouseEvent, index: number) => {
    if (!selectableNeighborhoods) return;
    const selected = neighborhoods[index];
    setNeighborhoodSelected?.(selected);
    setSelectedNeighborhoodID?.(String(selected.idNeighborhood));
  };

  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target.openPopup();
    e.target.setStyle({ fillOpacity: baseFillOpacity * 2 });
  };

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target.closePopup();
    e.target.setStyle({ fillOpacity: baseFillOpacity });
  };

  // Drawn boundary: points the user clicked on the map
  const drawnPoints: LatLngTuple[] = drawnCoordinates
    .map((c) => [c.latitude, c.longitude] as LatLngTuple)
    .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

  const resolvedCenter: LatLngTuple = center ?? [-34.9964963, -64.9672817];

  return (
    <MapContainer
      ref={mapRef}
      center={resolvedCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeView city={city} selectedTree={selectedTree} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {/* In-progress drawn boundary */}
      {drawnPoints.length >= 3 ? (
        <Polygon
          positions={drawnPoints}
          pathOptions={{
            color: "#2B6CB0",
            fillColor: "#63B3ED",
            fillOpacity: 0.25,
            dashArray: "6 4",
          }}
        />
      ) : drawnPoints.length >= 2 ? (
        <Polyline positions={drawnPoints} pathOptions={{ color: "#2B6CB0", dashArray: "6 4" }} />
      ) : null}

      {drawnPoints.map((pos, i) => (
        <CircleMarker
          key={i}
          center={pos}
          radius={6}
          pathOptions={{ color: "#2B6CB0", fillColor: "#fff", fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>
            {i + 1}
          </Tooltip>
        </CircleMarker>
      ))}

      {neighborhoods.map((neighborhood, index) => {
        const coords = parseCoordinates(neighborhood.coordinates || []);
        if (coords.length < 3) return null;
        const centerPos = getPolygonCenter(coords);

        return (
          <Polygon
            key={neighborhood.idNeighborhood}
            positions={coords}
            eventHandlers={{
              click: (e) => handlePolygonClick(e, index),
              mouseover: handleMouseOver,
              mouseout: handleMouseOut,
            }}
            pathOptions={{
              fillColor: neighborhood.color ?? getNeighborhoodColor(index, selectedNeighborhoodID),
              color: neighborhood.color ?? getNeighborhoodColor(index, selectedNeighborhoodID),
            }}
          >
            {typeof neighborhood.filterInfo?.percentage === "number" && (
              <Tooltip
                direction="center"
                permanent
                opacity={1}
                className="percent-tooltip"
                position={centerPos}
              >
                {`${neighborhood.filterInfo.percentage.toFixed(2)} %`}
              </Tooltip>
            )}

            {showPopup && (
              <Popup
                keepInView
                closeOnClick={true}
                autoClose={false}
                closeButton={false}
                maxWidth={280}
              >
                <Flex flexDirection="column" gap="4px">
                  {/* Basic info — always shown */}
                  <Text
                    fontSize="md"
                    color="#1A865F"
                    fontWeight="bold"
                    style={{ padding: 0, margin: 0 }}
                  >
                    {neighborhood.neighborhoodName}
                  </Text>

                  <Text fontSize="xs" color="gray.500" style={{ padding: 0, margin: 0 }}>
                    ID: {neighborhood.idNeighborhood}
                  </Text>

                  {neighborhood.numBlocksInNeighborhood != null && (
                    <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                      <strong>Manzanas:</strong> {neighborhood.numBlocksInNeighborhood}
                    </Text>
                  )}

                  {neighborhood.coordinates && neighborhood.coordinates.length > 0 && (
                    <Flex flexDirection="column" gap="2px">
                      <Text fontSize="sm" fontWeight="bold" style={{ padding: 0, margin: 0 }}>
                        Coordenadas ({neighborhood.coordinates.length}):
                      </Text>
                      <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                        {neighborhood.coordinates.map((c: any, i: number) => (
                          <Text
                            key={i}
                            fontSize="xs"
                            color="gray.600"
                            style={{ padding: 0, margin: 0, fontFamily: "monospace" }}
                          >
                            {i + 1}. {parseFloat(c.latitude).toFixed(5)},{" "}
                            {parseFloat(c.longitude).toFixed(5)}
                          </Text>
                        ))}
                      </div>
                    </Flex>
                  )}

                  {/* Stats section — only when additionalInfo exists */}
                  {neighborhood.additionalInfo && (
                    <Flex
                      flexDirection="column"
                      gap="2px"
                      borderTop="1px solid #e2e8f0"
                      pt="4px"
                      mt="2px"
                    >
                      {neighborhood.additionalInfo.totalTreesCount != null && (
                        <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                          <strong>Árboles:</strong> {neighborhood.additionalInfo.totalTreesCount}
                        </Text>
                      )}
                      {neighborhood.additionalInfo.predominantSpecies && (
                        <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                          <strong>Especie predominante:</strong>{" "}
                          {neighborhood.additionalInfo.predominantSpecies}
                        </Text>
                      )}
                      {neighborhood.additionalInfo.predominantRisk != null && (
                        <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                          <strong>Riesgo predominante:</strong>{" "}
                          {neighborhood.additionalInfo.predominantRisk}
                        </Text>
                      )}
                      <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                        <strong>Simpson ciudad:</strong> {simpsonCity.toFixed(2)}
                      </Text>
                      {neighborhood.additionalInfo.simpsonIndex != null && (
                        <Text fontSize="sm" style={{ padding: 0, margin: 0 }}>
                          <strong>Simpson barrio:</strong>{" "}
                          {neighborhood.additionalInfo.simpsonIndex}
                        </Text>
                      )}
                    </Flex>
                  )}
                </Flex>
              </Popup>
            )}
          </Polygon>
        );
      })}
      {showTrees &&
        trees.map((tree) =>
          showMarkers ? (
            <TreeMarker
              key={tree.idTree}
              tree={tree}
              isSelected={selectedTree?.idTree === tree.idTree}
              onClick={() => onTreeSelect?.(tree)}
            />
          ) : null,
        )}
    </MapContainer>
  );
};
