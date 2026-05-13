import { FC, useEffect } from "react";
import { useMap } from "react-leaflet";
import { City } from "../../types/User";
import { Tree } from "../../types/Tree";
import { isUndefined } from "lodash";

interface Props {
  city?: City;
  selectedTree?: Tree;
}

const ChangeView: FC<Props> = ({ city, selectedTree }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedTree) return;

    const lat = selectedTree.latitude;
    const lng = selectedTree.longitude;

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return;

    map.setView([lat, lng], 18);
  }, [selectedTree, map]);

  useEffect(() => {
    if (isUndefined(city)) return;

    const { center, zoom } = city;
    const newCenter = center ?? { lat: -34.9964963, lng: -64.9672817 };
    const newZoom = zoom ?? 6;

    if (
      map.getCenter().lat !== newCenter.lat ||
      map.getCenter().lng !== newCenter.lng ||
      map.getZoom() !== newZoom
    ) {
      map.setView(newCenter, newZoom);
    }
  }, [city, map]);

  return null;
};

export default ChangeView;
