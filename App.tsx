import React, { useState, useMemo, useCallback } from 'react';
import { Project, RepoData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ProjectList from './components/ProjectList';
import ProjectBoard from './components/ProjectBoard';
import AddProjectModal from './components/AddProjectModal';

function App(): React.ReactNode {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  const handleCreateProject = useCallback((repoData: RepoData) => {
    const newProject: Project = {
      ...repoData,
      id: `project-${Date.now()}`,
      tasks: [],
    };
    setProjects(prev => [newProject, ...prev]);
    setIsAddProjectModalOpen(false);
  }, [setProjects]);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, [setProjects]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {!selectedProject ? (
          <>
            <header className="mb-8">
              <h1 className="text-xl font-bold text-white">Ваши Проекты</h1>
            </header>
            <ProjectList 
              projects={projects} 
              onSelectProject={setSelectedProjectId} 
              onAddProject={() => setIsAddProjectModalOpen(true)}
            />
          </>
        ) : (
          <ProjectBoard 
            project={selectedProject} 
            onUpdateProject={handleUpdateProject}
            onBack={handleBackToProjects} 
          />
        )}
      </div>

      {isAddProjectModalOpen && (
        <AddProjectModal
          onClose={() => setIsAddProjectModalOpen(false)}
          onProjectCreate={handleCreateProject}
        />
      )}
    </div>
  );
}

export default App;