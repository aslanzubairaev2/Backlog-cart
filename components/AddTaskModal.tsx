import React, { useState, useEffect } from 'react';
import { XIcon, MicrophoneIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface AddTaskModalProps {
  onClose: () => void;
  onCreate: (taskText: string) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onCreate }) => {
  const [spokenText, setSpokenText] = useState('');
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
        setSpokenText(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokenText.trim()) {
      return;
    }
    onCreate(spokenText);
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-2">Новая Задача</h2>
            <p className="text-slate-400 mb-6">Опишите задачу, баг или идею, и ИИ создаст для вас карточку.</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 relative">
                <label htmlFor="spokenText" className="block text-sm font-medium text-slate-300 mb-2">Описание задачи</label>
                <textarea
                    id="spokenText"
                    value={spokenText}
                    onChange={(e) => setSpokenText(e.target.value)}
                    placeholder="Например: 'Реализовать аутентификацию через Google' или 'Исправить баг в мобильной верстке на главной странице'"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={5}
                    disabled={isListening}
                />
                {hasRecognitionSupport && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    aria-label={isListening ? "Остановить запись" : "Начать запись"}
                  >
                      <MicrophoneIcon className="w-5 h-5" />
                  </button>
                )}
            </div>

            <button
                type="submit"
                disabled={isListening || !spokenText.trim()}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
                Создать задачу
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;