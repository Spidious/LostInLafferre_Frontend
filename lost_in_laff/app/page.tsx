'use client';

import { useState } from 'react';
import SearchBar from '@/components/searchBar';
import Map from '@/components/map';
import Directions from '@/components/directions';
import { getCoordinateData } from '@/services/getCoordinates';
import testOne from '@/floors/test_one.json';
import testTwo from '@/floors/test_two.json';
import Image from 'next/image';
import logo from '@/public/Lost In Lafferre Logo.png';

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [apiResponse, setApiResponse] = useState(null);

  const floors = {
    testOne,
    testTwo,
  };

  const roomOptions = Object.entries(floors).flatMap(([floorName, floorData]) =>
    Object.entries(floorData).map(([room, aliases]) => ({
    value: `${floorName}-${room}`,
    label: `${room} ${aliases ? `(${aliases.split(',')})` : ''}`
  }))
);

  const handleSubmit = async () => {
    try {
      console.log('From:', from, 'To:', to);
      const toRoomName = to.split("-")[1];
      const fromRoomName = from.split("-")[1];
      console.log('From:', fromRoomName, 'To:', toRoomName);
        const response = await getCoordinateData({ from: fromRoomName, to: toRoomName });
        setApiResponse(response);
        console.log('Response from API:', response);
      } catch (error) {
        console.error('Error:', error);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white top-0 z-50 p-4 flex justify-center">
        <Image src={logo} alt="Lost in Lafferre" className='w-24 h-25'/>
      </header>
      <main className="w-full max-w-lg mt-4 p-6 flex flex-col items-center space-y-6">

      {/* Search Bars */}
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
          placeholder="Select destination point"
        />

        {/* Submit Button */}
        <button className="w-1/3 max-w-xs px-6 mt-4 bg-emerald-600 text-white py-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-green-400 text-lg font-semibold transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-green-500 active:scale-100 active:brightness-90" onClick={handleSubmit}>Submit</button>


        {/* Map Component */}
        <div className='w-full rounded-lg overflow-hidden shadow-lg bg-white'>
          <Map from={from} to={to} apiResponse={apiResponse} />
        </div>  

        {/* Directions */}
        <div className='w-full rounded-lg overflow-hidden shadow-lg'>
          <Directions
            apiResponse={apiResponse}
          />
        </div>
      </main>
    </div>
  );
}