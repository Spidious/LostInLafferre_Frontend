import React from "react";
import dynamic from 'next/dynamic';

interface MapProps {
  from: string;
  to: string;
  apiResponse?: Object | null;
}

// Dynamically import the map component with SSR disabled
const MapWithNoSSR = dynamic(
  () => import('./mapClient'), 
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full">
      <div className="loading-circle"></div>
      <style jsx>{`
          .loading-circle {
              border: 4px solid rgba(0, 0, 0, 0.1);
              border-left-color: #000;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
          }
          @keyframes spin {
              to {
                  transform: rotate(360deg);
              }
          }
      `}</style>
  </div>
    )
  }
);

const Map = ({ from, to, apiResponse }: MapProps) => {
  const floorsSVG = {
    0: "/maps/zero_frontend.svg",
    1: "/maps/one_frontend.svg",
    2: "/maps/two_frontend.svg",
    3: "/maps/three_frontend.svg",
  }

  return (
    <div className="w-full aspect-square relative rounded-xl border border-emerald-200 shadow-lg bg-white overflow-hidden">

      <div className="absolute z-20 bottom-4 left-4 bg-white px-3 py-1 rounded-full shadow text-sm text-emerald-700 font-medium">
        {from} {to}
      </div>

      <div className="absolute inset-0 z-10">
        <MapWithNoSSR from={from} to={to} apiResponse={apiResponse} svgFiles={floorsSVG} />
      </div>
    </div>
  );
};

export default Map;
