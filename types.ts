export interface Task {
  id: string;
  title: string;
  description: string;
  labels: string[];
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  isDone: boolean;
  createdAt: string;
  isProcessing?: boolean;
  isFavorite?: boolean;
}

export interface Project {
  id: string;
  name: string;
  fullName: string;
  repoUrl: string;
  description: string;
  tasks: Task[];
}

export type RepoData = Pick<Project, 'name' | 'fullName' | 'repoUrl' | 'description'>;