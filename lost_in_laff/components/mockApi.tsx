export const fetchMockPath = async (): Promise<[number, number][]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          [162, 572], //Start Point
          [220, 572],
          [218, 500], // Turn and start going down hallway
          [215, 480],
          // [220, 472],
          [223, 460], // Turn and start going down another hallway
          [200, 455],
          [190, 457],
          [165, 455]
        ]);
      }, 1000); // Simulates network delay
    });
  };
  