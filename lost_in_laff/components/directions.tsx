import React from 'react';
import PolylinePath from './polylinePath';

interface DirectionsProps {
  directions: string[];
  apiResponse?: object | null;
}

const Directions = ({ directions, apiResponse }: DirectionsProps) => {
  return (
    <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
      <h3 className="text-emerald-800 font-semibold mb-2">Directions</h3>
      {directions.length > 0 ? (
        <ol className="list-decimal list-inside space-y-2">
          {directions.map((direction, index) => (
            <li key={index} className="text-emerald-700">
              {direction}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-emerald-600">Select locations to get directions</p>
      )}
    </div>
  );
};

export default Directions;
