import React from "react";
import dynamic from 'next/dynamic';

interface MapProps {
  from: string;
  to: string;
  apiResponse?: string | null;
}

// Dynamically import the map component with SSR disabled
const MapWithNoSSR = dynamic(
  () => import('./mapClient'), 
  { 
    ssr: false,
    loading: () => (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
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
    <div className="w-full aspect-square bg-emerald-50 rounded-lg border-2 border-emerald-200 relative">
      <div className="absolute bottom-4 left-4">
        <div className="w-6 h-6 bg-emerald-700 rounded-full" />
        {from} {to}
      </div>
      <div className="w-full h-full">
        <MapWithNoSSR from={from} to={to} apiResponse={apiResponse} svgFiles={floorsSVG} />
      </div>
    </div>
  );
};

export default Map;
