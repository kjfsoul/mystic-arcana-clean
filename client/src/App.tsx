import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CosmicBackground from './components/layout/CosmicBackground';

// Placeholder for your actual pages
const HomePage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-8 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">
      <h1 className="text-4xl font-bold mb-4 text-white">Mystic Arcana</h1>
      <p className="text-xl text-gray-300 mb-6">Your journey through the cosmic wisdom begins here</p>
      <button className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-full transition-all">
        Begin Your Reading
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <>
      {/* Cosmic Background - this will be applied globally */}
      <CosmicBackground />
      
      {/* Your app content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
};

export default App;
