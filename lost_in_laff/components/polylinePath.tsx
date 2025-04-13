import { Polyline } from "react-leaflet";
import L from "leaflet";

interface PolylinePathProps {
  pathCoords: [number, number][];
}

const filterPathByDistance = (path: [number, number][], minDistance: number) => {
  if (!path || path.length < 2) return path;

  const filteredPath: [number, number][] = [path[0]]; // Keep the first point

  for (let i = 1; i < path.length; i++) {
    const [prevLat, prevLng] = filteredPath[filteredPath.length - 1];
    const [currLat, currLng] = path[i];
    
    // Calculate the distance using Leaflet's LatLng function
    const distance = L.latLng(prevLat, prevLng).distanceTo(L.latLng(currLat, currLng));
    console.log("Distance: ", distance)

    if (distance >= minDistance) {
      filteredPath.push(path[i]); // Keep only significant movement
    }
  }
  console.log(filteredPath)

  return filteredPath;
};


const PolylinePath: React.FC<PolylinePathProps> = ({ pathCoords }) => {
  // Normalize the path to remove points that are too close to each other
  const convertedPath = filterPathByDistance(pathCoords, 30000);

  return pathCoords.length > 1 ? (
    <Polyline positions={convertedPath} color="blue" weight={4} />
  ) : null;
};

export default PolylinePath;
