export const fetchMockPath = async (): Promise<[number, number][]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          [162, 572], // Start point 
          [188, 572],
        //   [38.9468, -92.3293], // Midpoint
        //   [38.9470, -92.3296],
        //   [38.9473, -92.3299]  // End point 
        ]);
      }, 1000); // Simulates network delay
    });
  };
  