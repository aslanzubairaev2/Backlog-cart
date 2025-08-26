import React from 'react';

const TaskSkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
        <div className="h-3.5 bg-slate-700 rounded w-full"></div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="h-4 bg-slate-700 rounded w-14"></div> {/* Priority */}
          <div className="h-4 bg-slate-700 rounded w-10"></div> {/* Date */}
        </div>
        <div className="flex gap-2 justify-end">
            <div className="h-5 bg-slate-700 rounded-full w-16"></div>
            <div className="h-5 bg-slate-700 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default TaskSkeletonCard;