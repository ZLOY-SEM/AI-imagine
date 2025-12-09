import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, SendIcon } from './Icons';
import { IWindow, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, AppStatus, AspectRatio } from '../types';

interface InputAreaProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
  status: AppStatus;
}

const InputArea: React.FC<InputAreaProps> = ({ onGenerate, status }) => {
  const [inputText, setInputText] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const aspectRatios: AspectRatio[] = ['16:9', '4:3', '1:1', '3:4', '9:16'];

  useEffect(() => {
    // Initialize Speech Recognition
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === AppStatus.GENERATING) return;
    onGenerate(inputText, selectedRatio);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent z-50">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        
        {/* Aspect Ratio Selector */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setSelectedRatio(ratio)}
              disabled={status === AppStatus.GENERATING}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${
                selectedRatio === ratio
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleSubmit} 
          className="relative flex items-center bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-full shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isListening 
                ? 'bg-red-500/20 text-red-500 animate-pulse' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Голосовой ввод"
          >
            <MicIcon className="w-6 h-6" active={isListening} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Опишите изображение..."
            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-0 text-base md:text-lg min-w-0"
            disabled={status === AppStatus.GENERATING}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || status === AppStatus.GENERATING}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputText.trim() && status !== AppStatus.GENERATING
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-blue-500/50'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {status === AppStatus.GENERATING ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SendIcon className="w-6 h-6 ml-0.5" />
            )}
          </button>
        </form>
        
        <div className="text-center text-[10px] md:text-xs text-gray-500 hidden md:block">
          Используйте русский язык для описания. Выберите формат выше.
        </div>
      </div>
    </div>
  );
};

export default InputArea;