import React, { useState } from 'react';
import dynamic from 'next/dynamic';

interface DirectionsProps {
  apiResponse: object | null;
  onNext?: () => void;
}

const DirectionsClient = dynamic(
  () => import('./directionsClient'),
  { ssr: false }
);

const Directions = ({ apiResponse, onNext }: DirectionsProps) => {
  return <DirectionsClient apiResponse={apiResponse} onNext={onNext} />;
};

export default Directions;