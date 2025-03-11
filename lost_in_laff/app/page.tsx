'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Map from '@/components/Map';
import Directions from '@/components/Directions';
import basement from '@/floors/basement.json';
import firstLevel from '@/floors/firstLevel.json';
import secondLevel from '@/floors/secondLevel.json';
import thirdLevel from '@/floors/thirdLevel.json';


export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const floors = {
    basement,
    firstLevel,
    secondLevel,
    thirdLevel
  };

  const roomOptions = Object.entries(floors).flatMap(([floorName, floorData]) =>
    Object.entries(floorData).map(([room, aliases]) => ({
    value: room,
    label: `${room} ${aliases ? `(${aliases.split(',')})` : ''}`
  }))
);

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
          </div>
          
          <Map from={from} to={to} />
          
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
