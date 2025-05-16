import axios from 'axios';

interface SourceDestinationData {
  from: string;
  to: string;
}

const BASE_URL = 'https://lostinlafferre-backend.onrender.com'; 

export const getCoordinateData = async (data: SourceDestinationData) => {
  const endpoint = `/rooms/${data.from}/${data.to}`;
  const apiUrl = `${BASE_URL}${endpoint}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coordinate data:', error);
    throw error;
  }
};