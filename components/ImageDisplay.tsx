import React, { useState } from 'react';
import { DownloadIcon, ImageIcon, SparklesIcon, MaximizeIcon, XIcon, ShareIcon } from './Icons';
import { AppStatus, GeneratedImage, AspectRatio } from '../types';

interface ImageDisplayProps {
  currentImage: GeneratedImage | null;
  status: AppStatus;
  error: string | null;
  targetRatio?: AspectRatio;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ currentImage, status, error, targetRatio }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        // Convert Base64 to Blob to share as a file
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        const file = new File([blob], 'image.png', { type: 'image/png' });

        await navigator.share({
          title: 'ImagineAI Image',
          text: `Создано в ImagineAI: ${currentImage.prompt}`,
          files: [file],
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy URL to clipboard (or just alert)
      alert("Ваш браузер не поддерживает функцию 'Поделиться'.");
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentImage) return;
    setIsFullscreen(!isFullscreen);
  };

  // Helper to convert ratio string to CSS value
  const getAspectRatioStyle = (ratioStr: string) => {
    const [w, h] = ratioStr.split(':').map(Number);
    return { aspectRatio: `${w}/${h}` };
  };

  const displayRatio = currentImage?.aspectRatio || targetRatio || '16:9';

  if (status === AppStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-red-400 animate-pulse">
        <div className="bg-red-900/20 p-4 rounded-full mb-4">
          <SparklesIcon className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold mb-2">Ошибка генерации</h3>
        <p className="max-w-md">{error || "Что-то пошло не так. Попробуйте изменить запрос."}</p>
      </div>
    );
  }

  if (!currentImage && status !== AppStatus.GENERATING) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-gray-500 min-h-[50vh]">
        <div className="bg-gray-800 p-6 rounded-full mb-6 shadow-xl border border-gray-700">
          <ImageIcon className="w-16 h-16 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Начните творить</h2>
        <p className="max-w-md text-gray-400">
          Введите описание внизу или используйте голосовой ввод, чтобы создать уникальное HD изображение.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full p-4 md:p-8 shrink-0">
        {/* Dynamic Aspect Ratio Container */}
        <div 
          className="relative w-full max-h-[65vh] bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group transition-all duration-500 ease-in-out cursor-pointer"
          style={{
             ...getAspectRatioStyle(displayRatio),
             maxWidth: displayRatio === '9:16' || displayRatio === '3:4' ? '450px' : '1024px' // Constrain width for tall images
          }}
          onDoubleClick={toggleFullscreen}
          title="Дважды кликните для просмотра на весь экран"
        >
          
          {/* Loading Overlay */}
          {status === AppStatus.GENERATING && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm cursor-default">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <p className="mt-6 text-blue-300 font-medium animate-pulse tracking-wide">Создаем магию ({displayRatio})...</p>
            </div>
          )}

          {/* Image */}
          {currentImage && (
            <>
              <img 
                src={currentImage.url} 
                alt={currentImage.prompt} 
                className="w-full h-full object-contain fade-in"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                 <p className="text-white text-sm line-clamp-2 mb-4 drop-shadow-md select-none">{currentImage.prompt}</p>
                 <div className="flex gap-2 md:gap-3">
                   <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 bg-white text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
                   >
                     <DownloadIcon className="w-5 h-5" />
                     <span className="hidden md:inline">Скачать</span>
                   </button>
                   
                   {/* Share Button (Shows on supported devices) */}
                   {navigator.share && (
                     <button
                      onClick={handleShare}
                      className="flex-none bg-white text-gray-900 font-bold p-3 rounded-xl hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
                      title="Поделиться"
                     >
                       <ShareIcon className="w-5 h-5" />
                     </button>
                   )}

                   <button
                    onClick={toggleFullscreen}
                    className="flex-none bg-gray-700/80 backdrop-blur-md text-white p-3 rounded-xl hover:bg-gray-600 transition-colors shadow-lg"
                    title="На весь экран"
                   >
                     <MaximizeIcon className="w-5 h-5" />
                   </button>
                 </div>
              </div>
              
              {/* Mobile friendly persistent buttons */}
              <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="bg-gray-800/80 backdrop-blur-md text-white p-3 rounded-full shadow-lg hover:bg-gray-700 active:scale-90 transition-all"
                  aria-label="На весь экран"
                >
                  <MaximizeIcon className="w-6 h-6" />
                </button>
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 active:scale-90 transition-all"
                    aria-label="Поделиться"
                  >
                    <ShareIcon className="w-6 h-6" />
                  </button>
                )}
                {!navigator.share && (
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 active:scale-90 transition-all"
                    aria-label="Скачать"
                  >
                    <DownloadIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentImage && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-fadeIn" onClick={toggleFullscreen}>
          <img 
            src={currentImage.url} 
            alt={currentImage.prompt} 
            className="w-full h-full object-contain" 
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
          />
          
          <div className="absolute top-4 right-4 flex space-x-4">
             {navigator.share && (
               <button
                onClick={handleShare}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all"
                title="Поделиться"
               >
                <ShareIcon className="w-6 h-6" />
               </button>
             )}
             <button
              onClick={handleDownload}
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all"
              title="Скачать"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all"
              title="Закрыть"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 text-center px-4 pointer-events-none">
            <p className="text-white/80 text-sm bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-sm max-w-2xl">
              {currentImage.prompt}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;