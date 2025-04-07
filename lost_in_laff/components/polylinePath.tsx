import { Polyline } from "react-leaflet";

interface PolylinePathProps {
  pathCoords: [number, number][];
}

const PolylinePath: React.FC<PolylinePathProps> = ({ pathCoords }) => {
  return pathCoords.length > 1 ? (
    <Polyline positions={pathCoords} color="blue" weight={4} />
  ) : null;
};

export default PolylinePath;
