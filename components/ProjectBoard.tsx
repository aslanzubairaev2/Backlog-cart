import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, Task } from '../types';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import TaskSkeletonCard from './TaskSkeletonCard';
import { PlusIcon, ArrowLeftIcon, GithubIcon } from './icons';
import { parseTaskFromText } from '../services/geminiService';


interface ProjectBoardProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack: () => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ project, onUpdateProject, onBack }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null);
  
  // Local state for tasks to provide instant D&D feedback
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(project.tasks);
  }, [project.tasks]);


  const visibleTasks = useMemo(() => {
    if (showCompleted) {
      return tasks;
    }
    return tasks.filter(task => task.status !== 'Done');
  }, [tasks, showCompleted]);

  const completedCount = useMemo(() => project.tasks.filter(t => t.status === 'Done').length, [project.tasks]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    const updatedTasks = project.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    onUpdateProject({ ...project, tasks: updatedTasks });
  }, [project, onUpdateProject]);

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
        const updatedTasks = project.tasks.filter(task => task.id !== taskId);
        onUpdateProject({ ...project, tasks: updatedTasks });
    }
  };


  const handleCreateTask = useCallback(({ title, description }: { title: string; description: string; }) => {
    const tempId = `task-pending-${Date.now()}`;
    const skeletonTask: Task = {
      id: tempId,
      title: title,
      description: 'Идет анализ задачи...',
      labels: [],
      priority: 'Medium',
      status: 'Backlog',
      createdAt: new Date().toISOString(),
      isProcessing: true,
    };

    const tasksWithSkeleton = [...project.tasks, skeletonTask];
    onUpdateProject({ ...project, tasks: tasksWithSkeleton });
    setIsAddTaskModalOpen(false);

    parseTaskFromText(title, description, project.fullName)
      .then(suggestedData => {
        const finalTask: Task = {
          ...suggestedData,
          id: `task-${Date.now()}`,
          title,
          description,
          status: 'Backlog',
          createdAt: new Date().toISOString(),
        };
        const finalTasks = tasksWithSkeleton.map(t => t.id === tempId ? finalTask : t);
        onUpdateProject({ ...project, tasks: finalTasks });
      })
      .catch(error => {
        console.error("Failed to create task:", error);
        alert("Не удалось создать задачу. Пожалуйста, попробуйте еще раз.");
        const tasksWithoutSkeleton = tasksWithSkeleton.filter(t => t.id !== tempId);
        onUpdateProject({ ...project, tasks: tasksWithoutSkeleton });
      });
  }, [project, onUpdateProject]);
  
  const handleViewTask = (task: Task) => {
      setViewingTask(task);
      setModalMode('view');
  };

  const handleEditTask = (task: Task) => {
      setViewingTask(task);
      setModalMode('edit');
  };
  
  const handleCloseTaskModal = () => {
      setViewingTask(null);
      setModalMode(null);
  };
  
  const handleUpdateTaskFromModal = (updatedTask: Task) => {
      handleUpdateTask(updatedTask);
      setViewingTask(updatedTask);
      setModalMode('view');
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTask(task);
  };

  const handleDragEnter = (e: React.DragEvent, targetTask: Task) => {
    if (!draggingTask || draggingTask.id === targetTask.id) return;

    const draggedIndex = tasks.findIndex(t => t.id === draggingTask.id);
    const targetIndex = tasks.findIndex(t => t.id === targetTask.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    
    setTasks(newTasks);
  };

  const handleDragEnd = () => {
    onUpdateProject({ ...project, tasks });
    setDraggingTask(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };


  return (
    <div>
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors flex-shrink-0" aria-label="Back to projects">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{project.name}</h1>
                 <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white" aria-label={`View ${project.fullName} on GitHub`}>
                    <GithubIcon className="w-6 h-6" />
                </a>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-1">{project.fullName}</p>
          </div>
        </div>
        {completedCount > 0 && (
            <label className="flex items-center cursor-pointer">
                <span className="mr-3 text-slate-300">Показать завершенные</span>
                <div className="relative">
                <input type="checkbox" checked={showCompleted} onChange={() => setShowCompleted(!showCompleted)} className="sr-only" />
                <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showCompleted ? 'transform translate-x-6 bg-indigo-400' : ''}`}></div>
                </div>
            </label>
        )}
      </header>

      <div className="space-y-4">
        {visibleTasks.length > 0 ? (
          visibleTasks.map(task =>
            task.isProcessing ? (
              <TaskSkeletonCard key={task.id} />
            ) : (
              <TaskCard 
                key={task.id} 
                card={task}
                isDragging={draggingTask?.id === task.id}
                onViewDetails={() => handleViewTask(task)}
                onEdit={() => handleEditTask(task)}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnter={(e) => handleDragEnter(e, task)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              />
            )
          )
        ) : (
          <div className="text-center py-20 bg-slate-800 rounded-lg">
            <h2 className="text-2xl font-semibold text-slate-400">Бэклог пуст!</h2>
            <p className="text-slate-500 mt-2">Нажмите кнопку '+' чтобы добавить первую задачу.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsAddTaskModalOpen(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-2xl transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        aria-label="Add new task"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {isAddTaskModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddTaskModalOpen(false)}
          onCreate={handleCreateTask}
        />
      )}
      {viewingTask && modalMode && (
        <TaskDetailsModal
            task={viewingTask}
            mode={modalMode}
            onClose={handleCloseTaskModal}
            onUpdateTask={handleUpdateTaskFromModal}
            onSwitchToEdit={() => setModalMode('edit')}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
