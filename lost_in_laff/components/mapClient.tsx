import React from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  ImageOverlay,
  SVGOverlay,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import NextImage from "next/image";

interface MapClientProps {
  from: string;
  to: string;
  svgFile: any;
  imageFile: any;
}

const MapClient = ({ from, to, svgFile, imageFile }: MapClientProps) => {
    const [svgSize, setSvgSize] = React.useState<[number, number] | null>(null);

    const getImageSize = (url: string): Promise<[number, number]> => {
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
                            resolve([width, height]);
                        } else {
                            reject(new Error("SVG does not have a viewBox attribute"));
                        }
                    } else {
                        reject(new Error("No <svg> element found in the file"));
                    }
                })
                .catch((err) => reject(err));
        });
    };

    React.useEffect(() => {
        getImageSize(svgFile)
            .then(([width, height]) => {
                setSvgSize([height, width]);
            })
            .catch((err) => {
                console.error("Error loading SVG image:", err);
            });
    }, [svgFile]);

    if (!svgSize) {
        return;
    }

    const pngSize = [718, 930];

    console.log("SVG Size: ", svgSize);
    console.log("PNG Size: ", pngSize);
    console.log("Sanity Check", pngSize[0] / pngSize[1]);

    // Fix scale difference between svg and png
    const svgUnit = [333, 300];
    const pngUnit = [75, 67];
    const pngRescale = [svgUnit[0] / pngUnit[0], svgUnit[1] / pngUnit[1]];

    const pngSizeRescaled = [pngSize[0] * pngRescale[0], pngSize[1] * pngRescale[1]];

    console.log("Rescale Factor: ", pngRescale);
    console.log("Rescaled PNG Size: ", pngSizeRescaled);
    console.log("Sanity Check", pngSizeRescaled[0] / pngSizeRescaled[1]);

    // Fix offset difference between svg and png
    const offsetScale = [-49, 74];
    const offsetMultiplier = 4;
    const pngOffset = [offsetScale[0] * offsetMultiplier, offsetScale[1] * offsetMultiplier];

    console.log("Offset Scale: ", offsetScale);
    console.log("Offset Multiplier: ", offsetMultiplier);
    console.log("PNG Offset: ", pngOffset);
    console.log("Sanity Check", pngOffset[0] / pngOffset[1]);

    const svgBounds = [
        [0, 0],
        [svgSize[0] / 100, svgSize[1] / 100],
    ];

    const pngBounds = [
        [pngOffset[0] / 100, pngOffset[1] / 100],
        [(pngOffset[0] + pngSizeRescaled[0]) / 100, (pngOffset[1] + pngSizeRescaled[1]) / 100],
    ];

    console.log("SVG Bounds: ", svgBounds);
    console.log("PNG Bounds: ", pngBounds);
    console.log("Sanity Check", (pngBounds[1][0] - pngBounds[0][0]) / (pngBounds[1][1] - pngBounds[0][1]));

    const atomicUnit = [svgBounds[1][0], svgBounds[1][1]];
    const center = [svgBounds[1][0] / 2, svgBounds[1][1] / 2];

    const padding = 0.5; // 10% padding
    const maxBounds = [
        [-padding * atomicUnit[0], -padding * atomicUnit[1]],
        [atomicUnit[0] + padding * atomicUnit[0], atomicUnit[1] + padding * atomicUnit[1]],
    ];

    return (
        <MapContainer
            style={{ height: "100%", width: "100%" }}
            maxBounds={maxBounds}
            maxBoundsViscosity={1.0}
            minZoom={2} // Set max zoom out
            center={center}
            zoom={3}
        >
            <SVGOverlay
                bounds={svgBounds}
                opacity={1}
            >
                <image href={svgFile} x="0" y="0" width="100%" height="100%" />
            </SVGOverlay>
            {/* <ImageOverlay bounds={pngBounds} url={imageFile} opacity={1} /> */}
        </MapContainer>
    );
};

export default MapClient;
