import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, SVGOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import PolylinePath from "./polylinePath";
import { fetchMockPath } from "./mockApi";

/**
 * @description Props interface for the MapClient component
 * @interface MapClientProps
 * @property {string} from - Starting location/room number. Format: "floor-room" (e.g., "basement-C0003")
 * @property {string} to - Destination location/room number. Format: "floor-room" (e.g., "firstLevel-C001")
 * @property {Object | null} [apiResponse] - Optional response from the API containing path data
 * @property {{ [key: number]: string }} svgFiles - SVG files for each floor
 */
interface MapClientProps {
  from: string;
  to: string;
  apiResponse?: object | null;
  svgFiles: { [key: number]: string };
}

// Map converter to convert floor names to numbers
// This is a mapping of floor names to their respective indices
// For example, "basement" is mapped to 0, "firstLevel" to 1, etc.
const mapConverter: { [key: string]: number } = {
  basement: 0,
  firstLevel: 1,
  secondLevel: 2,
  thirdLevel: 3,
};

/**
 * AutoPanToMarker component
 * @description Automatically pans the map to a specified marker position when the position changes.
 * @param {Object} props - Component props
 * @param {[number, number] | null} props.position - Position of the marker to pan to
 * @param {number} [props.zoom=4] - Zoom level for the map
 * @param {number} [props.floorNumber] - Floor number to go to
 * @param {(floorNumber: number) => void} props.floorUpdater - Function to update the selected floor number
 */
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
  // Get the map instance from the context
  const map = useMap();

  // Effect to pan the map to the specified position
  // This effect runs whenever the position or floor changes
  useEffect(() => {
    // Check if position and floorNumber are valid
    console.log("Panning to:", position, "on floor:", floorNumber);

    // Check if position and floorNumber are valid
    if (position != null && floorNumber != null) {
      // Update the floor number in the parent component
      floorUpdater(floorNumber);

      // Set the map view to the new position and zoom level
      // The map will animate to the new position over 0.5 seconds
      map.setView(position, zoom, {
        animate: true,
        duration: 0.5,
      });
    }
    // The useEffect hook will run whenever the position or floorNumber changes
  }, [position, floorNumber]);

  // Return null TODO: UNNECESSARY?
  // This component does not render anything itself
  // It only handles the side effect of panning the map
  // when the position changes
  return null;
}

/**
 * @description Function to get the coordinates of a room from its name in the SVG
 * @param {string} name - The name of the room
 * @param {SVGElement | null} svg - The SVG element to look for the room's coordinates
 * @returns {[number, number] | null} - The coordinates of the room in the SVG
 */
function getRoomCoordsFromName(
  name: string,
  svg: SVGElement | null
): [number, number] | null {
  // Find the SVG overlay container
  const svgElement = svg;

  // Ensure the SVG element is not null
  if (svgElement) {
    // Find all label elements in the SVG
    // Whatever element's value matches the name, return its coordinates
    const labelElements = svgElement.querySelectorAll("text");

    // Use traditional for loop instead of forEach to allow break statement
    for (let i = 0; i < labelElements.length; i++) {
      // Get the current label element
      const element = labelElements[i];

      // Check if the label's innerHTML matches the room name
      if (element.innerHTML === name) {
        // Get the coordinates of the label element
        const centerX = element.getAttribute("x");
        const centerY = element.getAttribute("y");

        // Log the coordinates for debugging
        console.log("SVG element clicked:", element, centerX, centerY);

        // Return the coordinates as an array of numbers
        // TODO: Handle the case where the coordinates are not found
        // Should be a failout
        if (centerX && centerY) {
          return [parseFloat(centerX || "0"), parseFloat(centerY || "0")];
        }
      }
    }
  }

  // TODO: Handle the case where the room name is not found
  // Return null if the room name is not found in the SVG
  return [0, 0];
}

/**
 * MapClient component
 * @description This component renders a map with SVG overlays and markers for the starting and destination locations.
 * @param from - The starting location/room number. Format: "floor-room" (e.g., "basement-C0003")
 * @param to - The destination location/room number. Format: "floor-room" (e.g., "firstLevel-C001")
 * @param svgFiles - SVG files for each floor
 * @param apiResponse - Optional response from the API containing path data
 * @returns Element | null
 */
const MapClient = ({ from, to, svgFiles, apiResponse }: MapClientProps) => {
  // State variable that holds the sizes of each SVG file
  const [svgSizes, setSvgSizes] = React.useState<{
    [key: number]: [number, number];
  } | null>(null);
  // State variable that holds the SVG element for the current floor
  const [svgElement, setSvgElement] = React.useState<SVGElement | null>(null);
  // State variable that holds the SVG elements for all floors
  const [svgElements, setSvgElements] = React.useState<{
    [key: number]: SVGElement | null;
  } | null>(null);
  // State variable that holds the current floor number
  const [floor, setFloor] = React.useState<number>(0);

  // State variable that holds the coordinates of the starting location
  const [fromCoords, setFromCoords] = React.useState<[number, number] | null>(
    null
  );
  // State variable that holds the coordinates of the destination location
  const [toCoords, setToCoords] = React.useState<[number, number] | null>(null);

  //const [pathCoords, setPathCoords] = React.useState<[number, number][]>([]);

  // This is the code for when the API will have a valid coordinate response
<!--   React.useEffect(() => {
    if (apiResponse && svgElement) {
      try {
        const parsedResponse = JSON.parse(apiResponse);
        if (parsedResponse.path) {
          const convertedPath = parsedResponse.path.map((coord: [number, number]) =>
            svgToMapCoords(coord, svgElement)
          );
          setPathCoords(convertedPath);
        }
      } catch (error) {
        console.error("Error parsing API response:", error);
      }
    }
  }, [apiResponse, svgElement]);   -->

  // React.useEffect(() => {
  //   const loadMockData = async () => {
  //     console.log("Entered Here")
  //     try {
  //       const mockPath = await fetchMockPath(); // Fetch mock coordinates
  //       const mockApiResponse = JSON.stringify({ path: mockPath }); // Simulate API response
        
  //       if (mockApiResponse && svgElement) {
  //         const parsedResponse = JSON.parse(mockApiResponse);
  //         if (parsedResponse.path) {
  //           const convertedPath = parsedResponse.path.map((coord: [number, number]) =>
  //             svgToMapCoords(coord, svgElement)
  //           );
  //           setPathCoords(convertedPath);
  //           console.log("Path coords: ", pathCoords)
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error loading mock data:", error);
  //     }
  //   };
  
  //   loadMockData();
  // }, [svgElement]); // Removed apiResponse since it's now internally handled
    
  // State variable for pathElements of each floor
  const [pathElements, setPathElements] = React.useState<{
    [key: number]: SVGElement | null;
  } | null>(null);

  // TODO: Combine state variables for floor number and svgElements
  // Effect to update the SVG element when the floor changes
  React.useEffect(() => {
    // Check if the SVG elements are loaded and the current floor is valid
    if (svgElements && svgElements[floor]) {
      // Set the SVG element for the current floor
      setSvgElement(svgElements[floor]);
    }
    // Update the SVG element whenever the floor or svgElements change
  }, [floor, svgElements]);

  /**
   * @description Converts SVG coordinates to map coordinates.
   * @param coords - The coordinates in the SVG.
   * @param svgElement - The SVG element to use for conversion.
   * @returns The converted map coordinates.
   */
  const svgToMapCoords = (
    coords: [number, number],
    svgElement: SVGElement
  ): [number, number] => {
    // Check current SVG element is valid
    if (svgElement) {
      // Get the size of the SVG element
      const svgHeight = svgSizes ? svgSizes[floor][0] : 0;
      const svgWidth = svgSizes ? svgSizes[floor][1] : 0;

      // Normalize coordinates based on viewBox
      // TODO: WHY DOES THIS WORK?
      const normalizedY = ((coords[0] / svgHeight) * svgHeight) / 100; // Divide by 10 to match your map scaling
      const normalizedX =
        (((svgWidth - coords[1]) / svgWidth) * svgWidth) / 100 - 2; // Divide by 10 to match your map scaling

      return [normalizedX, normalizedY];
    }
    // If the SVG element is not valid, return default coordinates
    // TODO: Handle the case where the SVG element is not valid
    return [0, 0];
  };

  /**
   * @description Fetches an SVG file and returns its size and element as a promise
   * @param url - The URL of the SVG file to fetch
   * @returns Promise that resolves to an array containing the width, height, and SVG element
   */
  const getImageAndSize = (
    url: string
  ): Promise<[number, number, SVGElement]> => {
    // Return a new promise to fetch the SVG file
    return new Promise((resolve, reject) => {
      // Fetch the SVG file from the provided URL
      fetch(url)
        // On response, check if the response is OK
        // If not, throw an error with the status text
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
          }
          return response.text();
        })
        // Parse the response text as SVG
        .then((svgText) => {
          // Create a new DOMParser instance to parse the SVG text
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
          const svgElement = svgDoc.querySelector("svg");

          // Check if the SVG element is found
          if (svgElement) {
            // Get the viewBox attribute from the SVG element
            const viewBox = svgElement.getAttribute("viewBox");
            // Either parse the viewBox or use width and height attributes
            if (viewBox) {
              // If viewBox is present, parse its width and height
              const [, , width, height] = viewBox.split(" ").map(Number);
              resolve([width, height, svgElement]);
            } else {
              // If no viewBox, use width and height attributes
              const width = svgElement.getAttribute("width");
              const height = svgElement.getAttribute("height");
              // Check if width and height are present
              if (width && height) {
                resolve([parseFloat(width), parseFloat(height), svgElement]);
              } else {
                // If no viewBox, width, or height, reject the promise
                reject(
                  new Error(
                    "SVG does not have a viewBox or width/height attributes"
                  )
                );
              }
            }
          } else {
            // If no SVG element found, reject the promise
            reject(new Error("No <svg> element found in the file"));
          }
        })
        // Handle any errors that occur during the fetch or parsing
        .catch((err) => reject(err));
    });
  };

  // Effect to load SVG files and set their sizes and elements
  // This effect runs when the component mounts or when svgFiles change
  React.useEffect(() => {
    // Loop through each SVG file in the svgFiles object
    for (const key in svgFiles) {
      // Get the image and size of the SVG file
      getImageAndSize(svgFiles[key])
        // On success, set the SVG sizes and elements in the state
        .then(([width, height, svgElement]) => {
          // Set the SVG sizes in the state
          setSvgSizes((prevSizes) => ({
            ...prevSizes,
            [key]: [height, width],
          }));

          // Set the SVG elements in the state
          setSvgElements((prevElements) => ({
            ...prevElements,
            [key]: svgElement,
          }));
        })
        // Handle any errors that occur during the fetch or parsing
        .catch((err) => {
          console.error("Error loading SVG image:", err);
        });
    }
  }, [svgFiles]);

  // useEffect to generate path from response when apiResponse changed
  React.useEffect(() =>{
    // If response found
    if (apiResponse) {
      try {
        // Get all of the coords from the apiResponse
        // The form of a coordinate is {index: {x: coord, y: coord, z:coord}}
        const coords: {[index: number]: {x: number, y: number, z: number}} = apiResponse as {[index: number]: {x: number, y: number, z: number}};

        // Create a new object to hold the path elements for each floor
        const newPathElements: {[key: number]: SVGElement} = {};

        // Loop through each floor
        for (let floor = 0; floor <= 3; floor++) {
          // Create a svg element to hold path elements
          const pathSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          
          // Only look at the coords for that floor
          // Verticality has a weight of 50 so floor 0 = z: 0, floor 1 = z: 50, ...
          // Group consecutive coordinates
          const groups: Array<Array<{x: number, y: number, z: number}>> = [];
          let currentGroup: Array<{x: number, y: number, z: number}> = [];

          Object.values(coords).forEach((coord, index) => {
            // Skip wrong floor coords
            if (coord.z !== floor * 50) return;

            // If first coordinate of floor or same z as previous coordinate, add to current group
            if (index === 0 || coord.z === coords[index - 1].z) {
              currentGroup.push(coord);
            } else {
              // Else push current group and start a new one
              groups.push([...currentGroup]);
              currentGroup = [coord];
            }
          });

          // If last currentGroup had coords then push it to groups
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }

          // Create polyline or circle for each group
          groups.forEach(group => {
            if (group.length === 1) {
              // Create circle for single point
              const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              circle.setAttribute("cx", group[0].x.toString());
              circle.setAttribute("cy", group[0].y.toString());
              circle.setAttribute("r", "3"); // radius of 3 units
              circle.setAttribute("style", "fill:red;stroke:none");
              pathSvg.appendChild(circle);
            } else {
              // Create polyline for multiple points
              const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
              const points = group.map(point => `${point.x},${point.y}`).join(" ");
              polyline.setAttribute("points", points);
              polyline.setAttribute("style", "fill:none;stroke:red;stroke-width:3");
              pathSvg.appendChild(polyline);
            }
          });

          // Set the pathElement for that floor to the newPathElements
          newPathElements[floor] = pathSvg;
        }

        // Update the pathElements
        setPathElements(newPathElements);
      } catch (error) {
        console.error("Error parsing API response:", error);
      }
    }

  }, [apiResponse]);

  /**
   * @description Recolors the Room Name and Floor SVG elements to "selected" colors if they match the from or to values
   *
   * @param svgElement The SVG element to recolor
   * @param fromFull The original color to change from
   * @param toFull The color to change to
   * @returns void
   */
  const recolorSVG = (
    svgElement: SVGElement | null,
    fromFull: string,
    toFull: string
  ) => {
    // Check if the SVG element is valid
    // If not, return early
    if (!svgElement) return;

    // Split the fromFull and toFull strings to get the floor names
    // For example, "basement-C0003" becomes "basement" and "C0003"
    const from = fromFull.split("-")[1];
    const to = toFull.split("-")[1];

    // Select all polygon elements in the SVG under the group with ID "Space"
    // These are the floor spaces for each room
    svgElement.querySelectorAll("#Space polygon").forEach((polygon) => {
      // Get the name of the area from the data-name attribute
      const name = polygon.getAttribute("data-name") || "Unknown area";

      // Check if the name matches either the from or to area
      if (name == to || name == from) {
        // If it matches, set the fill color to a darkened color
        polygon.setAttribute(
          "style",
          "fill: #a5b2ad; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      } else {
        // If it doesn't match, set the fill color to a white color
        polygon.setAttribute(
          "style",
          "fill: #fff0; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      }
    });

    // Select all text elements in the SVG under the group with ID "text"
    svgElement.querySelectorAll("#text text").forEach((polygon) => {
      // Get the name of the area from the innerHTML
      const name = polygon.innerHTML || "Unknown area";

      // Check if the name matches either the from or to area
      if (name == to || name == from) {
        // If it matches, set the fill color to a darkened color
        polygon.setAttribute(
          "style",
          "fill: #131e24; stroke: #000; stroke-width: 0.5; cursor: pointer;"
        );
      } else {
        // If it doesn't match, set the fill color to a white color
        polygon.setAttribute(
          "style",
          "fill: #fff0; stroke: #404041; stroke-width: 0.5; cursor: pointer;"
        );
      }
    });
  };

  // Recolor on load
  // TODO: Is this necessary?
  recolorSVG(svgElement, from, to);

  // Effect to handle changes made on to and from props
  React.useEffect(() => {
    // Check if the SVG element is valid
    // If not, return early
    if (!svgElement) return;

    // Recolor the SVG elements based on the from and to props
    recolorSVG(svgElement, from, to);

    // Get the SVG element for the current floor
    if (from) {
      // Get the floor index and room name from the from prop
      const floorIndex = mapConverter[from.split("-")[0]];
      const roomName = from.split("-")[1];

      // Get the SVG element for the current floor
      const svg = svgElements ? svgElements[floorIndex] : null;

      // Get the coordinates of the room from the SVG
      const newFromCoords = getRoomCoordsFromName(roomName, svg);
      console.log("New From Coords: ", newFromCoords);

      // Normalize the coordinates to map coordinates
      const normalizedFromCoords = svgToMapCoords(
        newFromCoords || [0, 0],
        svgElement
      );
      console.log("Normalized From Coords: ", normalizedFromCoords);

      // Set the from coordinates in the state
      setFromCoords(normalizedFromCoords);
      console.log("From Coords: ", normalizedFromCoords);
    }

    if (to) {
      // Get the floor index and room name from the to prop
      const floorIndex = mapConverter[to.split("-")[0]];
      const roomName = to.split("-")[1];

      // Get the SVG element for the current floor
      const svg = svgElements ? svgElements[floorIndex] : null;

      // Get the coordinates of the room from the SVG
      const newToCoords = getRoomCoordsFromName(roomName, svg);
      console.log("New To Coords: ", newToCoords);

      // Normalize the coordinates to map coordinates
      const normalizedToCoords = svgToMapCoords(
        newToCoords || [0, 0],
        svgElement
      );
      console.log("Normalized To Coords: ", normalizedToCoords);

      // Set the to coordinates in the state
      setToCoords(normalizedToCoords);
      console.log("To Coords: ", normalizedToCoords);
    }
  }, [from, to]);

  // Check if the SVG sizes and elements are loaded before rendering the map
  if (
    !svgSizes ||
    Object.keys(svgSizes).length < Object.keys(svgFiles).length ||
    !svgElement
  ) {
    return null;
  }

  // Check if the SVG element contains the path with ID "MidlinePath"
  const path = svgElement?.querySelector("#MidlinePath");
  if (path) {
    // If the path is found, hide it by setting its innerHTML to an empty string
    path.innerHTML = "";
  }

  // Set the SVG bounds based on the current floor
  const svgBounds: L.LatLngBoundsLiteral = [
    [0, 0],
    [
      (svgSizes && svgSizes[floor] && svgSizes[floor][0] / 100) || 0,
      (svgSizes && svgSizes[floor] && svgSizes[floor][1] / 100) || 0,
    ],
  ];

  // Use the SVG bounds to set the map bounds
  // These bounds are the maximum scrollable area of the map
  const baseBounds = [svgBounds[1][0], svgBounds[1][1]];
  // Calculate the center of the SVG bounds
  const center: L.LatLngTuple = [svgBounds[1][0] / 2, svgBounds[1][1] / 2];

  // Set the scroll bounds to include some padding
  const padding = 0.5; // 50% padding
  // This is the area that the map will scroll to
  const scrollBounds: L.LatLngBoundsLiteral = [
    [-padding * baseBounds[0], -padding * baseBounds[1]] as L.LatLngTuple,
    [
      baseBounds[0] + padding * baseBounds[0],
      baseBounds[1] + padding * baseBounds[1],
    ] as L.LatLngTuple,
  ];

  // Set the zoom bounds to include some padding
  // This is the area that the map will zoom to initially
  // The zoom factor is set to 0 to show the entire map
  const zoomFactor = 0;
  const zoomBounds = [
    [-zoomFactor * baseBounds[0], -zoomFactor * baseBounds[1]],
    [
      baseBounds[0] + zoomFactor * baseBounds[0],
      baseBounds[1] + zoomFactor * baseBounds[1],
    ],
  ];

  // Force Reload on Fast Refresh
  // FOR DEVELOPMENT ONLY
  // This is a workaround for the issue where the map does not refresh properly on fast refresh in development mode.
  // It forces the window to reload if the innerWidth is greater than the clientWidth.
  // This is the case when the map is not displayed correctly due to a failed fast refresh.

  // if (window.innerWidth > document.documentElement.clientWidth) {
  //   window.location.reload();
  // }

  // Return the MapContainer component with the SVG overlay and markers
  return (
    // MapContainer component from react-leaflet
    <MapContainer
    // Fill the parent container
      style={{ height: "100%", width: "100%" }}
      // Set the max scrollable bounds
      maxBounds={scrollBounds}
      // Set to 1.0 to allow scrolling outside the bounds that rubberbands back
      maxBoundsViscosity={1.0}
      minZoom={2} // Set max zoom out
      center={center} // Set initial center
      bounds={zoomBounds as L.LatLngBoundsLiteral} // Set initial bounds (works for initial zoom)
    >
      {/* SVGOverlay component from react-leaflet */}
      {/* This overlay displays the SVG element on the map */}
      {/* Interactivity is enabled to allow clicking to register events */}
      <SVGOverlay bounds={svgBounds} opacity={1} interactive={true}>
        {/* Render the SVG element inside the SVGOverlay */}
        {/* The viewBox is set to the current SVG element's viewBox or the default size */}
        {/* The dangerouslySetInnerHTML prop is used to set the inner HTML of the current SVG element */}
        {/* TODO: Check if this is necessary to render the SVG element correctly */}
        {svgElement && (
          <svg
            width="100%"
            height="100%"
            viewBox={
              svgElement.getAttribute("viewBox") ||
              `0 0 ${svgSizes[floor][1]} ${svgSizes[floor][0]}`
            }
            dangerouslySetInnerHTML={{ __html: svgElement.innerHTML }}
          />
        )}
      </SVGOverlay>

      {/* SVGOverlay component for the path */}
      {/* This overlay displays the path on the map */}
      {/* The opacity is set to 0.5 to make it semi-transparent */}
      {/* The interactive prop is set to false to disable interactivity */}
      <SVGOverlay bounds={svgBounds} opacity={0.5} interactive={false}>
        {/* Render the path element inside the SVGOverlay */}
        {/* The viewBox is set to the current SVG element's viewBox or the default size */}
        {/* The dangerouslySetInnerHTML prop is used to set the generated path element */}
        {pathElements && pathElements[floor] && (
          <svg
            width="100%"
            height="100%"
            viewBox={
              svgElement.getAttribute("viewBox") ||
              `0 0 ${svgSizes[floor][1]} ${svgSizes[floor][0]}`
            }
            dangerouslySetInnerHTML={{ __html: pathElements[floor].innerHTML }}
          />
        )}
      </SVGOverlay>

      {/* Markers for the starting and destination locations */}
      {/* These markers are displayed on the map at the coordinates of the from and to locations */}
      {/* The markers are only displayed if the coordinates are valid and the floor matches */}
      {/* The icon for each marker is set based on the from and to locations */}
      {/* The popup for each marker displays the name of the location */}

      {/* Check if fromCoords are set and from floor name match the current floor */}
      {fromCoords && mapConverter[from.split("-")[0]] == floor && (
        // Render the marker for the starting location
        // Using the blue icon from leaflet-color-markers
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

      {/* Check if toCoords are set and to floor name match the current floor */}
      {toCoords && mapConverter[to.split("-")[0]] == floor && (
        // Render the marker for the destination location
        // Using the red icon from leaflet-color-markers
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

      {/* AutoPanToMarker component */}
      {/* This component automatically pans the map to the specified marker position */}
      {/* It updates the floor number and coordinates when the props change */}
      {/* The zoom level is set to 7 for both markers which zooms to that level on pan */}
      <AutoPanToMarker
        floorUpdater={setFloor}
        floorNumber={mapConverter[from.split("-")[0]]}
        position={fromCoords}
        zoom={7}
      />
      <AutoPanToMarker
        floorUpdater={setFloor}
        floorNumber={mapConverter[to.split("-")[0]]}
        position={toCoords}
        zoom={7}
      />

      {/* Control panel for displaying the API response */}
      {/* This panel is displayed at the bottom left corner of the map */}
      {/* It shows the API response or a message to submit to see the response */}
      <div className="leaflet-bottom leaflet-left">
        <div
          className="leaflet-control leaflet-bar p-2 bg-white shadow-md rounded-md"
          style={{ margin: "10px", padding: "8px", display: "block" }}
        >
          <span id="response">
            {apiResponse
              ? "Response had " + Object.keys(apiResponse).length + " points"
              : "Submit to see API response"}
          </span>
        </div>
      </div>

      {/* Control panel for displaying the current floor number */}
      {/* This panel is displayed at the top center of the map */}
      {/* It shows the current floor number */}
      <div className="leaflet-top leaflet-horiz-center">
        <div
          className="leaflet-control leaflet-bar p-2 bg-white shadow-md rounded-md"
          style={{ margin: "10px", padding: "8px", display: "block" }}
        >
          <span id="response">Floor Number: {floor}</span>
        </div>
      </div>

      {/* Control panel for selecting the floor number */}
      {/* This panel is displayed at the right center of the map */}
      {/* It allows the user to select a floor number from 0 to 3 */}
      {/* The selected floor number is highlighted */}
      <div
        className="leaflet-bar leaflet-control leaflet-right leaflet-vert-center"
        style={{ margin: "10px", display: "block", background: "white" }}
      >
        {[0, 1, 2, 3].map((floorNumber) => (
          // Render a link for each floor number
          <a
            key={floorNumber}
            // Set the background color based on the selected floor number
            // If the floor number matches the current floor, set the background color to light gray
            // Otherwise, set it to transparent
            style={{
              backgroundColor: floor == floorNumber ? "#c0c0c0" : "",
            }}
            href="#"
            title={`Go to floor ${floorNumber}`}
            role="button"
            aria-label={`Go to floor ${floorNumber}`}
            aria-disabled={floor === floorNumber}
            // Set the onClick event to update the floor number
            onClick={() => setFloor(floorNumber)}
          >
            {/* Display the floor number */}
            <span aria-hidden="true">{floorNumber.toString()}</span>
          </a>
        ))}
      </div>
    </MapContainer>
  );
};

export default MapClient;
