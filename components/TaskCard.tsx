import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { 
    ArrowUpIcon, ArrowRightIcon, ArrowDownIcon, CheckIcon, StarIcon, 
    StarSolidIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, ClipboardIcon, GripVerticalIcon
} from './icons';

interface TaskCardProps {
  card: Task;
  onViewDetails: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: () => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

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

const priorityConfig = {
    Urgent: { icon: ArrowUpIcon, color: 'text-red-500', label: 'Urgent' },
    High: { icon: ArrowUpIcon, color: 'text-orange-500', label: 'High' },
    Medium: { icon: ArrowRightIcon, color: 'text-yellow-500', label: 'Medium' },
    Low: { icon: ArrowDownIcon, color: 'text-sky-500', label: 'Low' },
};

const statusConfig: Record<Task['status'], { color: string, label: string }> = {
    Backlog: { color: 'bg-slate-600 text-slate-200', label: 'Backlog' },
    'In Progress': { color: 'bg-amber-500 text-amber-100', label: 'In Progress' },
    Done: { color: 'bg-indigo-600 text-indigo-100', label: 'Done' },
};


const getLabelColorClass = (label: string): string => {
  const lowerCaseLabel = label.toLowerCase();
  const key = labelColorKeys[lowerCaseLabel] || 'default';
  return labelColors[key] || labelColors.default;
};

const TaskCard: React.FC<TaskCardProps> = ({ 
    card, onViewDetails, onUpdateTask, onDeleteTask, onEdit,
    isDragging, onDragStart, onDragEnter, onDragEnd, onDragOver
}) => {
  const { icon: PriorityIcon, color: priorityColor, label: priorityLabel } = priorityConfig[card.priority] || priorityConfig.Medium;
  const { color: statusColor, label: statusLabel } = statusConfig[card.status] || statusConfig.Backlog;
  const formattedDate = new Date(card.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTask({ ...card, isFavorite: !card.isFavorite });
    setIsMenuOpen(false);
  };

  const handleStatusChange = (e: React.MouseEvent, status: Task['status']) => {
    e.stopPropagation();
    onUpdateTask({ ...card, status });
    setIsMenuOpen(false);
  }
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(card.id);
    setIsMenuOpen(false);
  };
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `Title:${card.title}\nDescription:${card.description}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
            setIsMenuOpen(false);
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`bg-slate-800 rounded-lg shadow-lg p-4 cursor-pointer border border-transparent hover:border-slate-600 transition-all duration-200 ${card.status === 'Done' ? 'opacity-60' : ''} ${isDragging ? 'opacity-30 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''}`}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
      draggable="true"
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
        <div className="flex items-start gap-3">
            <span className="text-slate-500 cursor-grab pt-1" aria-label="Перетащить для изменения порядка">
                <GripVerticalIcon className="w-5 h-5"/>
            </span>
            <div className="flex-grow min-w-0">
                <h3 className={`font-bold text-white mb-1 ${card.status === 'Done' ? 'line-through' : ''}`}>{card.title}</h3>
                <p className={`text-slate-400 text-sm overflow-hidden ${card.status === 'Done' ? 'line-through' : ''}`} style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                {card.description}
                </p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-sm">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>{statusLabel}</span>

                    <div className="flex items-center gap-1.5" title={`Priority: ${priorityLabel}`}>
                        <PriorityIcon className={`w-4 h-4 ${priorityColor}`} />
                        <span className={`font-medium ${priorityColor}`}>{priorityLabel}</span>
                    </div>
                    {card.isFavorite && <StarSolidIcon className="w-4 h-4 text-amber-400" aria-label="Favorite task"/>}
                    <div className="flex items-center gap-2">
                    <span className="text-slate-500">&bull;</span>
                    <time dateTime={card.createdAt} className="text-slate-400">{formattedDate}</time>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                    {card.labels?.slice(0, 2).map((label, index) => (
                    <span key={index} className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getLabelColorClass(label)}`}>
                        {label}
                    </span>
                    ))}
                    </div>
                </div>
            </div>

            <div className="relative flex-shrink-0 -mr-2" ref={menuRef}>
                <button 
                    onClick={toggleMenu} 
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                    aria-label="Task actions"
                >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-700 rounded-md shadow-xl z-10 py-1 ring-1 ring-black ring-opacity-5">
                        <button onClick={handleToggleFavorite} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors">
                            {card.isFavorite ? <StarSolidIcon className="w-5 h-5 text-amber-400" /> : <StarIcon className="w-5 h-5" />}
                            <span>{card.isFavorite ? 'Убрать из избранного' : 'В избранное'}</span>
                        </button>
                        <button onClick={handleEdit} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors">
                            <PencilIcon className="w-5 h-5" />
                            <span>Редактировать</span>
                        </button>
                        <div className="border-t border-slate-600 my-1"></div>
                        <div className="px-4 pt-2 pb-1 text-xs text-slate-400">Изменить статус</div>
                        {(['Backlog', 'In Progress', 'Done'] as Task['status'][]).map(status => (
                                <button key={status} onClick={(e) => handleStatusChange(e, status)} disabled={card.status === status} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {card.status === status && <CheckIcon className="w-4 h-4 text-indigo-400" />}
                                <span className="flex-grow">{statusConfig[status].label}</span>
                                </button>
                        ))}
                        <div className="border-t border-slate-600 my-1"></div>
                        <button onClick={handleCopy} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors">
                            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                            <span>{isCopied ? 'Скопировано!' : 'Скопировать'}</span>
                        </button>
                        <div className="border-t border-slate-600 my-1"></div>
                        <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-600 hover:text-rose-300 flex items-center gap-3 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                            <span>Удалить</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TaskCard;