
import React from 'react';
import { Project } from '../types';
import { PlusIcon, GithubIcon } from './icons';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onAddProject }) => {
  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-slate-400">Проектов пока нет.</h2>
          <p className="text-slate-500 mt-2">Нажмите кнопку '+' чтобы добавить проект с GitHub.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-slate-800 rounded-lg shadow-lg p-5 cursor-pointer hover:bg-slate-700 transition-all duration-200 transform hover:-translate-y-1 flex flex-col"
              style={{ minHeight: '180px' }}
            >
              <div className="flex-grow">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{project.name}</h3>
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-white flex-shrink-0" aria-label={`View ${project.fullName} on GitHub`}>
                      <GithubIcon className="w-6 h-6" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 font-mono mb-2">{project.fullName}</p>
                <p className="text-sm text-slate-400 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {project.description || 'Описание не предоставлено.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{project.tasks.length} {project.tasks.length === 1 ? 'задача' : 'задач'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onAddProject}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-2xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        aria-label="Add new project"
      >
        <PlusIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default ProjectList;