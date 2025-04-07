'use client';

import { useState } from 'react';
import SearchBar from '@/components/searchBar';
import Map from '@/components/map';
import Directions from '@/components/directions';
import { getCoordinateData } from '@/services/getCoordinates';
import basement from '@/floors/basement.json';
import firstLevel from '@/floors/firstLevel.json';
import secondLevel from '@/floors/secondLevel.json';
import thirdLevel from '@/floors/thirdLevel.json';
import entrances from '@/floors/entrances.json';

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [apiResponse, setApiResponse] = useState(null);

  const floors = {
    entrances,
    basement,
    firstLevel,
    secondLevel,
    thirdLevel
  };

  const roomOptions = Object.entries(floors).flatMap(([floorName, floorData]) =>
    Object.entries(floorData).map(([room, aliases]) => ({
    value: `${floorName}-${room}`,
    label: `${room} ${aliases ? `(${aliases.split(',')})` : ''}`
  }))
);

  const handleSubmit = async () => {
    try {
      const response = await getCoordinateData({ from, to });
      setApiResponse(response);
      console.log('Response from API:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="row-start-2 sm:items-start">
        <div className="space-y-2">
          <div className="space-y-2">
            <SearchBar
              value={from}
              onChange={setFrom}
              options={roomOptions}
              placeholder="Select starting point"
            />
            <SearchBar
              value={to}
              onChange={setTo}
              options={roomOptions}
              placeholder="Select destination"
            />

            <div className="flex justify-center">
              <button className="bg-emerald-50 rounded-lg p-1 border-2 border-emerald-200" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
          
          <Map from={from} to={to} apiResponse={apiResponse} />
          
          <Directions
            directions={[
              'Exit W0005 and turn right',
              'Walk straight for 20 meters',
              'Your destination W0014 will be on your left'
            ]}
          />
        </div>
      </main>
    </div>
  );
}
