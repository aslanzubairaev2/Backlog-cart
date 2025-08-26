import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Task } from '../types';
import { XIcon, ClipboardIcon, CheckIcon } from './icons';

interface TaskDetailsModalProps {
  task: Task;
  mode: 'view' | 'edit';
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onSwitchToEdit: () => void;
}

const ALL_LABELS = ['UI/Интерфейс', 'Бэкенд', 'Баг', 'Фича', 'Рефакторинг', 'Рутина', 'Документация'];
const PRIORITIES: Task['priority'][] = ['Urgent', 'High', 'Medium', 'Low'];

const labelColors: { [key: string]: string } = {
  default: 'bg-slate-600 text-slate-200',
  ui: 'bg-cyan-600 text-cyan-100',
  backend: 'bg-emerald-600 text-emerald-100',
  bug: 'bg-rose-600 text-rose-100',
  feature: 'bg-purple-600 text-purple-100',
  refactoring: 'bg-amber-600 text-amber-100',
  chore: 'bg-gray-500 text-gray-100',
  docs: 'bg-sky-600 text-sky-100'
};

const labelColorKeys: { [key: string]: string } = {
  'ui/интерфейс': 'ui',
  'бэкенд': 'backend',
  'баг': 'bug',
  'фича': 'feature',
  'рефакторинг': 'refactoring',
  'рутина': 'chore',
  'документация': 'docs',
};

const getLabelColorClass = (label: string): string => {
  const lowerCaseLabel = label.toLowerCase();
  const key = labelColorKeys[lowerCaseLabel] || 'default';
  return labelColors[key] || labelColors.default;
};


const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, mode, onClose, onUpdateTask, onSwitchToEdit }) => {
  const [editableTask, setEditableTask] = useState<Task>(task);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setEditableTask(task);
  }, [task]);

  const handleFieldChange = (field: keyof Task, value: any) => {
    setEditableTask(prev => ({ ...prev, [field]: value }));
  };

  const handleLabelToggle = (label: string) => {
    const newLabels = editableTask.labels.includes(label)
      ? editableTask.labels.filter(l => l !== label)
      : [...editableTask.labels, label];
    handleFieldChange('labels', newLabels);
  };

  const handleSave = () => {
    onUpdateTask(editableTask);
  };

  const handleCopy = () => {
    const textToCopy = `Title:${task.title}\nDescription:${task.description}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const fullDate = new Date(task.createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (mode === 'view') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <header className="p-6 border-b border-slate-700 flex justify-between items-start gap-4">
              <div className="flex-grow">
                  <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">Приоритет:</span>
                        <span className="text-sm text-white font-semibold">{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                          {task.labels.map(label => (
                               <span key={label} className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getLabelColorClass(label)}`}>
                                   {label}
                               </span>
                          ))}
                      </div>
                      <div className="text-sm text-slate-400">Создано: {fullDate}</div>
                  </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 -m-2">
                <button onClick={handleCopy} title="Скопировать задачу" className="text-slate-400 hover:text-white p-2" aria-label="Скопировать задачу">
                    {isCopied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <ClipboardIcon className="w-6 h-6" />}
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0 p-2">
                    <XIcon className="w-6 h-6" />
                </button>
              </div>
          </header>

          <main className="p-6 overflow-y-auto">
              <div className="prose-custom">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4 space-y-2 text-slate-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4 space-y-2 text-slate-300" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    // FIX: The 'inline' prop is deprecated in recent versions of react-markdown.
                    // Switched to checking for a 'language-*' className to determine if a code snippet is a block or inline.
                    code: ({node, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                           <pre className="bg-slate-800 rounded-md p-4 my-4 text-sm overflow-x-auto"><code {...props}>{children}</code></pre>
                        ) : (
                           <code className="bg-slate-700 text-indigo-300 rounded-sm px-1 py-0.5 text-sm font-mono" {...props}>{children}</code>
                        );
                    },
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4" {...props} />,
                  }}
                >
                  {task.description}
                </ReactMarkdown>
              </div>
          </main>

          <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
              <button onClick={onClose} className="px-5 py-2 rounded-md bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors">
                  Закрыть
              </button>
              <button onClick={onSwitchToEdit} className="px-5 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                  Редактировать
              </button>
          </footer>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-slate-700 flex justify-between items-start gap-4">
            <div className="flex-grow">
                <input
                    type="text"
                    value={editableTask.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="text-2xl font-bold text-white bg-transparent focus:bg-slate-800 rounded-md w-full p-2 -m-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    placeholder="Название задачи"
                />
                <div className="flex items-center gap-x-4 mt-2">
                    <time dateTime={task.createdAt} className="text-sm text-slate-400">Создано: {fullDate}</time>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0 p-2 -m-2">
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <main className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Описание</label>
                <textarea
                    id="description"
                    value={editableTask.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={12}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    placeholder="Подробное описание задачи с использованием Markdown..."
                />
            </div>
            <div className="md:col-span-1 space-y-6">
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">Приоритет</label>
                    <select
                        id="priority"
                        value={editableTask.priority}
                        onChange={(e) => handleFieldChange('priority', e.target.value as Task['priority'])}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Метки</label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_LABELS.map(label => {
                            const isSelected = editableTask.labels.includes(label);
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleLabelToggle(label)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 border ${
                                        isSelected 
                                        ? `${getLabelColorClass(label)} border-transparent`
                                        : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </main>

        <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2 rounded-md bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors">
                Отмена
            </button>
            <button onClick={handleSave} className="px-5 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                Сохранить
            </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskDetailsModal;