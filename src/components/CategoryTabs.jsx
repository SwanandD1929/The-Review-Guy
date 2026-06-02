import React from 'react';

export default function CategoryTabs({ categories, activeTab, onTabChange }) {
  return (
    <div className="w-full overflow-x-auto carousel-hide-scrollbar py-2 flex items-center space-x-3 px-4 sm:px-6 lg:px-8">
      {categories.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border cursor-pointer ${
              isActive
                ? 'bg-amber-600 border-amber-500 text-black font-bold shadow-lg shadow-amber-950/20'
                : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
