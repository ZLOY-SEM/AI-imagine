import React from 'react';
import { GeneratedImage } from '../types';

interface HistoryStripProps {
  history: GeneratedImage[];
  selectedTimestamp?: number;
  onSelect: (image: GeneratedImage) => void;
}

const HistoryStrip: React.FC<HistoryStripProps> = ({ history, selectedTimestamp, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl px-4 mt-8 mb-32 z-10 fade-in animate-fadeIn">
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
        <span>История сессии</span>
        <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-[10px]">{history.length}</span>
      </div>
      <div className="flex flex-row-reverse justify-end gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {history.map((img) => (
          <button
            key={img.timestamp}
            onClick={() => onSelect(img)}
            className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all snap-start ${
              selectedTimestamp === img.timestamp 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 ring-2 ring-blue-500/20 z-10' 
                : 'border-gray-700/50 opacity-70 hover:opacity-100 hover:border-gray-500 hover:scale-105'
            }`}
            title={img.prompt}
          >
            <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
            {/* Aspect Ratio Badge */}
            <div className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-tl-md backdrop-blur-sm">
              {img.aspectRatio}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryStrip;