import React, { use, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  ImageOverlay,
  SVGOverlay,
  TileLayer,
  useMap,
  LayersControl,
  AttributionControl,
} from "react-leaflet";
import L, { svg } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapClientProps {
  from: string;
  to: string;
  apiResponse?: string | null;
  svgFiles: { [key: number]: string };
}

const mapConverter: { [key: string]: number } = {
  "basement": 0,
  "firstLevel": 1,
  "secondLevel": 2,
  "thirdLevel": 3,
}

// Helper component to access the map instance and handle SVG interaction
function SVGInteractionHandler({
  onAreaClick,
}: {
  onAreaClick: (name: string) => void;
}) {
  const map = useMap();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Find the SVG overlay container
    const overlayContainer = document.querySelector(".leaflet-overlay-pane");
    if (!overlayContainer) return;

    // Set up mutation observer to detect when SVG elements are added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          const svgElement = overlayContainer.querySelector("svg");
          if (svgElement) {
            // Find all interactive elements in the SVG
            const interactiveElements = svgElement.querySelectorAll(
              "polygon, path, text, g"
            );

            interactiveElements.forEach((element) => {
              // Add pointer cursor
              element.setAttribute(
                "style",
                `${element.getAttribute("style") || ""} cursor: pointer;`
              );

              // Remove any existing click handlers to prevent duplicates
              element.removeEventListener("click", handleElementClick);

              // Add click handler
              element.addEventListener("click", handleElementClick);
            });
          }
        }
      });
    });

    // Function to handle element clicks
    function handleElementClick(e: Event) {
      e.stopPropagation();
      const target = e.target as SVGElement;
      console.log("SVG element clicked:", target);

      const name =
        target.id ||
        target.getAttribute("data-name") ||
        target.getAttribute("name") ||
        target.textContent?.trim() ||
        "Unknown area";

      onAreaClick(name);
    }

    // Start observing
    observer.observe(overlayContainer, { childList: true, subtree: true });

    // Cleanup
    return () => {
      observer.disconnect();
      const svgElement = overlayContainer.querySelector("svg");
      if (svgElement) {
        const interactiveElements = svgElement.querySelectorAll(
          "polygon, path, text, g"
        );
        interactiveElements.forEach((element) => {
          element.removeEventListener("click", handleElementClick);
        });
      }
    };
  }, [map, onAreaClick]);

  return null;
}

// Helper component to automatically pan to new coordinates
function AutoPanToMarker({
  position,
  zoom = 4,
  floorNumber,
  floorUpdater,
}: {
  position: [number, number] | null;
  zoom?: number;
  floorNumber?: number;
  floorUpdater: (floorNumber: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
      console.log("Panning to:", position, "on floor:", floorNumber);
    if (position != null && floorNumber != null) {
      console.log("Panning to success:", position, "on floor:", floorNumber);
      floorUpdater(floorNumber);
      map.setView(position, zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [position, zoom, floorNumber]);

  return null;
}

function getRoomCoordsFromName(name: string, svg: SVGElement | null): [number, number] | null {
  // // Find the SVG overlay container
  // const overlayContainer = document.querySelector(".leaflet-overlay-pane");
  // if (!overlayContainer) return null;

  // // Set up mutation observer to detect when SVG elements are added to the DOM
  // const svgElement = overlayContainer.querySelector("svg");

  const svgElement = svg;

  if (svgElement) {
    // Find all interactive elements in the SVG
    const interactiveElements = svgElement.querySelectorAll("text");

    // Use traditional for loop instead of forEach to allow break statement
    for (let i = 0; i < interactiveElements.length; i++) {
      const element = interactiveElements[i];
      console.log(
        "Checking svg element:",
        element.innerHTML,
        name,
        element.innerHTML === name
      );

      // Add pointer cursor
      if (element.innerHTML === name) {
        const centerX = element.getAttribute("x");
        const centerY = element.getAttribute("y");
        console.log("SVG element clicked:", element, centerX, centerY);
        return [parseFloat(centerX || "10"), parseFloat(centerY || "10")];
      }
    }
  }
  return [0, 0];
}

const MapClient = ({
  from,
  to,
  svgFiles,
  apiResponse,
}: MapClientProps) => {
  const [svgSizes, setSvgSizes] = React.useState<{[key: number]: [number, number]} | null>(null);
  const [svgElement, setSvgElement] = React.useState<SVGElement | null>(null);
  const [svgElements, setSvgElements] = React.useState<{[key: number]: SVGElement | null} | null>(null);
  const [selectedArea, setSelectedArea] = React.useState<string>("");
  const [floor, setFloor] = React.useState<number>(0);

  const [fromCoords, setFromCoords] = React.useState<[number, number] | null>(
    null
  );
  const [toCoords, setToCoords] = React.useState<[number, number] | null>(null);

  React.useEffect(() => {
    if (svgElements && svgElements[floor]) {
      setSvgElement(svgElements[floor]);
    }
  }, [floor, svgElements]);

  const svgToMapCoords = (
    coords: [number, number],
    svgElement: SVGElement
  ): [number, number] => {
    // Convert SVG coordinates to map coordinates
    if (svgElement) {
      const svgHeight = svgSizes ? svgSizes[floor][0] : 0;
      const svgWidth = svgSizes ? svgSizes[floor][1] : 0;
      const viewBox = svgElement
        .getAttribute("viewBox")
        ?.split(" ")
        .map(Number) || [0, 0, svgWidth, svgHeight];

      // Normalize coordinates based on viewBox
      const normalizedY = ((coords[0] / svgHeight) * svgHeight) / 100; // Divide by 10 to match your map scaling
      const normalizedX =
        (((svgWidth - coords[1]) / svgWidth) * svgWidth) / 100 - 2; // Divide by 10 to match your map scaling

      return [normalizedX, normalizedY];
    }
    return [0, 0];
  };

  const mapToSVGCoords = (
    coords: [number, number],
    svgElement: SVGElement
  ): [number, number] => {
    return [
      (coords[0] / svgElement.clientWidth) * 10,
      (coords[1] / svgElement.clientHeight) * 10,
    ];
  };

  const getImageAndSize = (
    url: string
  ): Promise<[number, number, SVGElement]> => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
          }
          return response.text();
        })
        .then((svgText) => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
          const svgElement = svgDoc.querySelector("svg");
          if (svgElement) {
            const viewBox = svgElement.getAttribute("viewBox");
            if (viewBox) {
              const [, , width, height] = viewBox.split(" ").map(Number);
              resolve([width, height, svgElement]);
            } else {
              // If no viewBox, use width and height attributes
              const width = svgElement.getAttribute("width");
              const height = svgElement.getAttribute("height");
              if (width && height) {
                resolve([parseFloat(width), parseFloat(height), svgElement]);
              } else {
                reject(
                  new Error(
                    "SVG does not have a viewBox or width/height attributes"
                  )
                );
              }
            }
          } else {
            reject(new Error("No <svg> element found in the file"));
          }
        })
        .catch((err) => reject(err));
    });
  };

  React.useEffect(() => {
    for (const key in svgFiles) {
      getImageAndSize(svgFiles[key])
        .then(([width, height, svgElement]) => {
          setSvgSizes((prevSizes) => ({
            ...prevSizes,
            [key]: [height, width],
          }));

          setSvgElements((prevElements) => ({
            ...prevElements,
            [key]: svgElement,
          }));
        })
        .catch((err) => {
          console.error("Error loading SVG image:", err);
        });
    }
  }, [svgFiles]);

//     getImageAndSize(svgFiles[floor])
//       .then(([width, height, svgElement]) => {
//         setSvgSize([height, width]);
//         setSvgElement(svgElement);
//         console.log("SVG Size: ", [height, width]);
//         console.log("SVG Element: ", svgElement);
//       })
//       .catch((err) => {
//         console.error("Error loading SVG image:", err);
//       });
//   }, [svgFiles]);

  const recolorSVG = (
    svgElement: SVGElement | null,
    fromFull: string,
    toFull: string
  ) => {
    if (!svgElement) return;
    svgElement.querySelectorAll("#Space polygon").forEach((polygon) => {
      const name = polygon.getAttribute("data-name") || "Unknown area";

      const from = fromFull.split("-")[1];
      const to = toFull.split("-")[1];

      if (name == to || name == from) {
        polygon.setAttribute(
          "style",
          "fill: #a5b2ad; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      } else {
        polygon.setAttribute(
          "style",
          "fill: #fff0; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      }
    });

    svgElement.querySelectorAll("#text text").forEach((polygon) => {
      const name = polygon.innerHTML || "Unknown area";

      const from = fromFull.split("-")[1];
      const to = toFull.split("-")[1];
      
      if (name == to || name == from) {
        polygon.setAttribute(
          "style",
          "fill: #131e24; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      } else {
        polygon.setAttribute(
          "style",
          "fill: #fff0; stroke: #404041; stroke-width: 0.5; cursor: pointer;"
        );
      }
    });
  };

  recolorSVG(svgElement, from, to);

  React.useEffect(() => {
    if (!svgElement) return;

    recolorSVG(svgElement, from, to);

    if (from) {
      const floorIndex = mapConverter[from.split("-")[0]];
      const roomName = from.split("-")[1];
      const svg = svgElements ? svgElements[floorIndex] : null;
      const newFromCoords = getRoomCoordsFromName(roomName, svg);
      console.log("New From Coords: ", newFromCoords);
      const normalizedFromCoords = svgToMapCoords(
        newFromCoords || [0, 0],
        svgElement
      );
      console.log("Normalized From Coords: ", normalizedFromCoords);
      setFromCoords(normalizedFromCoords);
      console.log("From Coords: ", fromCoords);
    }

    if (to) {
      const floorIndex = mapConverter[to.split("-")[0]];
      const roomName = to.split("-")[1];
      const svg = svgElements ? svgElements[floorIndex] : null;
      const newToCoords = getRoomCoordsFromName(roomName, svg);
      console.log("New To Coords: ", newToCoords);
      const normalizedToCoords = svgToMapCoords(
        newToCoords || [0, 0],
        svgElement
      );
      console.log("Normalized To Coords: ", normalizedToCoords);
      setToCoords(normalizedToCoords);
      console.log("To Coords: ", toCoords);
    }
  }, [from, to]);

  if (!svgSizes || Object.keys(svgSizes).length < Object.keys(svgFiles).length || !svgElement) {
    return null;
  }

  const path = svgElement?.querySelector("#MidlinePath");
  if (path) {
    path.innerHTML = "";
  }

  const coords = svgToMapCoords([164, 254], svgElement!);
  console.log("New To Map coords:", coords);
  console.log("Wanted Coords: ", [3.43, 1.649]);

  const pngSize = [718, 930];

  //   console.log("SVG Size: ", svgSize);
  //   console.log("PNG Size: ", pngSize);
  //   console.log("Sanity Check", pngSize[0] / pngSize[1]);

  // Fix scale difference between svg and png
  const svgUnit = [333, 300];
  const pngUnit = [75, 67];
  const pngRescale = [svgUnit[0] / pngUnit[0], svgUnit[1] / pngUnit[1]];

  const pngSizeRescaled = [
    pngSize[0] * pngRescale[0],
    pngSize[1] * pngRescale[1],
  ];

  //   console.log("Rescale Factor: ", pngRescale);
  //   console.log("Rescaled PNG Size: ", pngSizeRescaled);
  //   console.log("Sanity Check", pngSizeRescaled[0] / pngSizeRescaled[1]);

  // Fix offset difference between svg and png
  const offsetScale = [-49, 74];
  const offsetMultiplier = 4;
  const pngOffset = [
    offsetScale[0] * offsetMultiplier,
    offsetScale[1] * offsetMultiplier,
  ];

  //   console.log("Offset Scale: ", offsetScale);
  //   console.log("Offset Multiplier: ", offsetMultiplier);
  //   console.log("PNG Offset: ", pngOffset);
  //   console.log("Sanity Check", pngOffset[0] / pngOffset[1]);

  console.log("Offset Scale: ", offsetScale);
  console.log("Offset Multiplier: ", offsetMultiplier);
  console.log("PNG Offset: ", pngOffset);
  console.log("Sanity Check", pngOffset[0] / pngOffset[1]);

//   const svgBounds: L.LatLngBoundsLiteral = [
//     [0, 0],
//     [((svgSizes && svgSizes[floor]) && svgSizes[floor][0] / 100) || 0, ((svgSizes && svgSizes[floor]) && svgSizes[floor][1] / 100) || 0],
//   ];
  const svgBounds: L.LatLngBoundsLiteral = [
    [0, 0],
    [
      ((svgSizes && svgSizes[floor]) && svgSizes[floor][0] / 100) || 0,
      ((svgSizes && svgSizes[floor]) && svgSizes[floor][1] / 100) || 0,
    ],
  ];

  console.log("SVG Bounds: ", svgBounds);
  console.log("SVG Size: ", svgSizes);

  const pngBounds = [
    [pngOffset[0] / 100, pngOffset[1] / 100],
    [
      (pngOffset[0] + pngSizeRescaled[0]) / 100,
      (pngOffset[1] + pngSizeRescaled[1]) / 100,
    ],
  ];

  //   console.log("SVG Bounds: ", svgBounds);
  //   console.log("PNG Bounds: ", pngBounds);
  //   console.log(
  //     "Sanity Check",
  //     (pngBounds[1][0] - pngBounds[0][0]) / (pngBounds[1][1] - pngBounds[0][1])
  //   );

  const atomicUnit = [svgBounds[1][0], svgBounds[1][1]];
  const center: L.LatLngTuple = [svgBounds[1][0] / 2, svgBounds[1][1] / 2];

  const padding = 0.5; // 10% padding
  const maxBounds: L.LatLngBoundsLiteral = [
    [-padding * atomicUnit[0], -padding * atomicUnit[1]] as L.LatLngTuple,
    [
      atomicUnit[0] + padding * atomicUnit[0],
      atomicUnit[1] + padding * atomicUnit[1],
    ] as L.LatLngTuple,
  ];

  const zoomFactor = 0;
  const zoomBounds = [
    [-zoomFactor * atomicUnit[0], -zoomFactor * atomicUnit[1]],
    [
      atomicUnit[0] + zoomFactor * atomicUnit[0],
      atomicUnit[1] + zoomFactor * atomicUnit[1],
    ],
  ];

    console.log("Zoom Bounds: ", zoomBounds);

  //   setFromCoords(center as [number, number]);

  // Force Reload on Fast Refresh
  // FOR DEVELOPMENT ONLY
  // This is a workaround for the issue where the map does not refresh properly on fast refresh in development mode.
//   if (window.innerWidth > document.documentElement.clientWidth) {
//     window.location.reload();
//   }

  return (
    <MapContainer
      style={{ height: "100%", width: "100%" }}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      minZoom={2} // Set max zoom out
      center={center} // Set initial center
      //   zoom={3}
      bounds={zoomBounds as L.LatLngBoundsLiteral}
    >
      <SVGOverlay bounds={svgBounds} opacity={1} interactive={true}>
        {svgElement && (
          <svg
            width="100%"
            height="100%"
            viewBox={svgElement.getAttribute("viewBox") || `0 0 ${svgSizes[floor][1]} ${svgSizes[floor][0]}`}
            dangerouslySetInnerHTML={{ __html: svgElement.innerHTML }}
          />
        )}
      </SVGOverlay>

      {/* <SVGInteractionHandler
      onAreaClick={setSelectedArea} /> */}

      {fromCoords && (mapConverter[from.split("-")[0]] == floor) && (
        <Marker
          position={fromCoords}
          icon={
            new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }
        >
          <Popup>{from}</Popup>
        </Marker>
      )}

      {toCoords && (mapConverter[to.split("-")[0]] == floor) && (
        <Marker
          position={toCoords}
          icon={
            new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }
        >
          <Popup>{to}</Popup>
        </Marker>
      )}

      <AutoPanToMarker floorUpdater={setFloor} floorNumber={mapConverter[from.split("-")[0]]} position={fromCoords} zoom={7} />
      <AutoPanToMarker floorUpdater={setFloor} floorNumber={mapConverter[to.split("-")[0]]} position={toCoords} zoom={7} />

      <div className="leaflet-bottom leaflet-left">
        <div
          className="leaflet-control leaflet-bar p-2 bg-white shadow-md rounded-md"
          style={{ margin: "10px", padding: "8px", display: "block" }}
        >
          <span id="response">
            {apiResponse
              ? "Response: " + apiResponse
              : "Submit to see API response"}
          </span>
        </div>
      </div>

      <div className="leaflet-top leaflet-horiz-center">
        <div
          className="leaflet-control leaflet-bar p-2 bg-white shadow-md rounded-md"
          style={{ margin: "10px", padding: "8px", display: "block" }}
        >
          <span id="response">Floor Number: {floor}</span>
        </div>
      </div>

      <div className="leaflet-bar leaflet-control leaflet-right leaflet-vert-center"
          style={{ margin: "10px", display: "block", background: "white" }}>
        {[0, 1, 2, 3].map((floorNumber) => (
          <a
            key={floorNumber}
            style={{
              backgroundColor: floor == floorNumber ? '#c0c0c0' : '',
            }}
            href="#"
            title={`Go to floor ${floorNumber}`}
            role="button"
            aria-label={`Go to floor ${floorNumber}`}
            aria-disabled={floor === floorNumber}
            onClick={() => setFloor(floorNumber)}
          >
            <span aria-hidden="true">{floorNumber.toString()}</span>
          </a>
        ))}
        </div>
    </MapContainer>
  );
};

export default MapClient;
