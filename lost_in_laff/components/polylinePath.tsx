import { Polyline } from "react-leaflet";
import L from "leaflet";

interface PolylinePathProps {
  apiResponse?: object | null
}

interface ApiPoint {
  x: number;
  y: number;
  z: number;
}

const filterPathByDistance = (path: [number, number, number][], minDistance: number) => {
  if (!path || path.length < 2) return path;

  const filteredPath: [number, number, number][] = [path[0]]; // Keep the first point

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


const PolylinePath: React.FC<PolylinePathProps> = ({ apiResponse }) => {
  // Normalize the path to remove points that are too close to each other
  const convertApiResponseToPath = (
    response: object | null | undefined
  ): [number, number, number][] => {
    const points = response as ApiPoint[]; 
    if (!Array.isArray(points)) return [];

    return points.map((point) => [point.y, point.x, point.z]);
  };

  const convertedPath = filterPathByDistance(convertApiResponseToPath(apiResponse), 300000);

  const displayPath = (
    convertedPath: [number, number, number][]
  ): [number, number][] => {
    return convertedPath.map(([y, x]) => [x, y]); // convert to [x, y]
  };  

  console.log("converted path:", displayPath(convertedPath))

  return convertedPath.length > 1 ? (
    <Polyline positions={displayPath(convertedPath)} color="blue" weight={4} />
  ) : null;
};

export default PolylinePath;
