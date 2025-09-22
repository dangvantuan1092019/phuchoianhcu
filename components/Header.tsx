
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 md:px-8 text-center bg-gray-900 border-b border-gray-700 shadow-lg">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
        PHỤC HỒI ẢNH CŨ
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Mang lại sự sống động cho những kỷ niệm xưa với sức mạnh của AI
      </p>
    </header>
  );
};
