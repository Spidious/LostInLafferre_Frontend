import React, { useState } from 'react';
import { generatePathElementsFromResponse } from './mapClient';

interface DirectionsProps {
  apiResponse: object | null;
}

  // Add these utility functions at the top of the file after the imports
type Point = [number, number];
type Direction = 'N' | 'S' | 'E' | 'W';

const calculateBearing = (start: Point, end: Point): number => {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (angle + 360) % 360;
};

const getDirection = (bearing: number): Direction => {
  if (bearing >= 315 || bearing < 45) return 'E';
  if (bearing >= 45 && bearing < 135) return 'N';
  if (bearing >= 135 && bearing < 225) return 'W';
  return 'S';
};

const getTurnDirection = (currentDirection: Direction, targetBearing: number): string => {
  const directions: Direction[] = ['N', 'E', 'S', 'W'];
  const currentIndex = directions.indexOf(currentDirection);
  const targetDirection = getDirection(targetBearing);
  const targetIndex = directions.indexOf(targetDirection);
  
  const diff = (targetIndex - currentIndex + 4) % 4;
  if (diff === 0) return 'continue straight';
  if (diff === 1) return 'turn left';
  if (diff === 2) return 'turn around';
  return 'turn right';
};

const generateDirections = (path: Point[]): string[] => {
  if (path.length < 2) return [];
  
  const directions: string[] = [];
  let currentDirection: Direction = 'E'; // Assuming starting facing east
  
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const bearing = calculateBearing(start, end);
    const turn = getTurnDirection(currentDirection, bearing);
    const distance = Math.round(
      Math.sqrt(
        Math.abs((end[0] - start[0]) + 
                (end[1] - start[1]))
      )
    );
    console.log(end[0] - start[0] + end[1] - start[1])
    
    directions.push(`${turn}, then walk ${distance} feet`);
    currentDirection = getDirection(bearing);
  }
  
  return directions;
};

// Modify the Directions component to use the generated directions
const Directions = ({ apiResponse }: DirectionsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [directions, setDirections] = useState<string[]>([]);

  const smoothedPath = React.useMemo(() => 
    apiResponse ? 
      Object.values(generatePathElementsFromResponse(apiResponse).smoothed)
        .flatMap(svg => {
          const polyline = svg.querySelector('polyline');
          if (!polyline) return [];
          
          const points = polyline.getAttribute('points');
          if (!points) return [];
          
          return points.trim().split(' ').map(pair => {
            const [x, y] = pair.split(',').map(Number);
            return [x, y] as Point;
          });
        }) 
    : null,
    [apiResponse] // Only recompute when apiResponse changes
  );
  
  // Add useEffect to generate directions when smoothedPath changes
  React.useEffect(() => {
    if (smoothedPath) {
      const newDirections = generateDirections(smoothedPath);
      setDirections(newDirections);
      console.log("Directions: ", directions)
      setCurrentStep(0);
    }
  }, [smoothedPath]);

  const handleNext = () => {
    if (currentStep < directions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
      <h3 className="text-emerald-800 font-semibold mb-2">Directions</h3>
      {directions.length > 0 ? (
        <div className="space-y-4">
          <div className="text-emerald-700">
            <span className="font-medium">Step {currentStep + 1} of {directions.length}: </span>
            {directions[currentStep]}
          </div>
          <div className="flex justify-between pt-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-md ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === directions.length - 1}
              className={`px-4 py-2 rounded-md ${
                currentStep === directions.length - 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="text-emerald-600">Select locations to get directions</p>
      )}
    </div>
  );
};

export default Directions;