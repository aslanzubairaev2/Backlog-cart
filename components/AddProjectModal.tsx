
import React, { useState } from 'react';
import { fetchRepoInfo } from '../services/githubService';
import { XIcon } from './icons';
import { RepoData } from '../types';

interface AddProjectModalProps {
  onClose: () => void;
  onProjectCreate: (repoData: RepoData) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onProjectCreate }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Пожалуйста, введите URL репозитория.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const repoData = await fetchRepoInfo(repoUrl);
      onProjectCreate(repoData);
    } catch (err: any) {
      setError(err.message || 'Произошла неизвестная ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close modal">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-2">Добавить проект</h2>
            <p className="text-slate-400 mb-6">Вставьте ссылку на GitHub репозиторий.</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-slate-300 mb-2">URL репозитория</label>
                <input
                    id="repoUrl"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/facebook/react"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                    aria-required="true"
                />
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center" role="alert">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Добавление...
                    </>
                ) : (
                    'Добавить проект'
                )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
