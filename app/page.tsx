'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Map from '@/components/Map';
import Directions from '@/components/Directions';
import basement from '@/basement.json';

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const roomOptions = Object.entries(basement).map(([room, aliases]) => ({
    value: room,
    label: `${room} ${aliases ? `(${aliases.split(',')})` : ''}`
  }));

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="max-w-md mx-auto">
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
