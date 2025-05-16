import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { generatePathElementsFromResponse } from './mapClient';

interface DirectionsProps {
  apiResponse: object | null;
  onNext?: () => void;
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

// Add this function after the type definitions
const getInitialDirection = (path: Point[]): Direction => {
  if (path.length < 2) return 'E'; // Default to East if not enough points
  
  const [start, end] = path;
  const bearing = calculateBearing(start, end);
  return getDirection(bearing);
};

// Then modify the generateDirections function to use it
const generateDirections = (path: Point[]): string[] => {
  if (path.length < 2) return [];
  
  const directions: string[] = [];
  let currentDirection = getInitialDirection(path);
  
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
    
    directions.push(`${turn}, then walk ${distance} feet`);
    currentDirection = getDirection(bearing);
  }
  
  return directions;
};

const DirectionsClient = dynamic(
  () => import('./directionsClient'),
  { ssr: false }
);

const Directions = ({ apiResponse, onNext }: DirectionsProps) => {
  return <DirectionsClient apiResponse={apiResponse} onNext={onNext} />;
};

export default Directions;