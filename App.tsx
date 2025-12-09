import React, { useState } from 'react';
import InputArea from './components/InputArea';
import ImageDisplay from './components/ImageDisplay';
import HistoryStrip from './components/HistoryStrip';
import { generateImageFromPrompt } from './services/geminiService';
import { AppStatus, GeneratedImage, AspectRatio } from './types';
import { SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeRatio, setActiveRatio] = useState<AspectRatio>('16:9');

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio) => {
    setStatus(AppStatus.GENERATING);
    setError(null);
    setActiveRatio(aspectRatio);

    try {
      const base64Image = await generateImageFromPrompt(prompt, aspectRatio);
      
      const newImage: GeneratedImage = {
        url: base64Image,
        prompt: prompt,
        aspectRatio: aspectRatio,
        timestamp: Date.now(),
      };
      
      setCurrentImage(newImage);
      setHistory(prev => [...prev, newImage]);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла ошибка при генерации");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleSelectHistoryItem = (image: GeneratedImage) => {
    setCurrentImage(image);
    setError(null);
    setStatus(AppStatus.SUCCESS);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="flex-none p-4 md:p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ImagineAI
          </h1>
        </div>
        <div className="text-xs md:text-sm text-gray-500 font-medium px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
          Powered by Gemini
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col items-center">
        <ImageDisplay 
          currentImage={currentImage} 
          status={status} 
          error={error} 
          targetRatio={status === AppStatus.GENERATING ? activeRatio : undefined}
        />
        
        {/* Session History */}
        <HistoryStrip 
          history={history} 
          selectedTimestamp={currentImage?.timestamp}
          onSelect={handleSelectHistoryItem}
        />
      </main>

      {/* Input Area */}
      <InputArea onGenerate={handleGenerate} status={status} />
    </div>
  );
};

export default App;