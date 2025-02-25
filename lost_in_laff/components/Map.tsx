import React from 'react';

interface MapProps {
  from: string;
  to: string;
}

const Map = ({ from, to }: MapProps) => {
  return (
    <div className="w-full aspect-square bg-emerald-50 rounded-lg border-2 border-emerald-200 relative">
      {/* Placeholder for the actual map rendering */}
      <div className="absolute bottom-4 left-4">
        <div className="w-6 h-6 bg-emerald-700 rounded-full" />
        {from} {to}
      </div>
    </div>
  );
};

export default Map;
