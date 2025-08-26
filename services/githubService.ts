import { Project } from '../types';

const GITHUB_API_BASE = 'https://api.github.com/repos/';

interface GithubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
}

interface RepoDetails extends GithubRepo {
    default_branch: string;
}

interface GitTree {
    sha: string;
    url: string;
    tree: {
        path: string;
        mode: string;
        type: 'blob' | 'tree' | 'commit';
        sha: string;
        size?: number;
        url: string;
    }[];
    truncated: boolean;
}

interface FileContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: 'file';
    content: string; // base64 encoded
    encoding: 'base64';
}

export async function fetchRepoInfo(repoUrl: string): Promise<Pick<Project, 'name' | 'fullName' | 'repoUrl' | 'description'>> {
    const urlPattern = /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/;
    const match = repoUrl.match(urlPattern);

    if (!match) {
        throw new Error('Неверный формат URL репозитория GitHub. Используйте формат: https://github.com/owner/repo');
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.endsWith('.git') ? repo.slice(0, -4) : repo;
    const apiUrl = `${GITHUB_API_BASE}${owner}/${cleanRepo}`;

    try {
        const response = await fetch(apiUrl);

        if (response.status === 404) {
            throw new Error(`Репозиторий '${owner}/${cleanRepo}' не найден. Пожалуйста, проверьте URL.`);
        }

        if (!response.ok) {
            throw new Error(`Не удалось получить данные о репозитории. Статус: ${response.status}`);
        }

        const data: GithubRepo = await response.json();

        return {
            name: data.name,
            fullName: data.full_name,
            repoUrl: data.html_url,
            description: data.description || 'Описание не предоставлено.',
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Произошла непредвиденная ошибка при запросе к GitHub.');
    }
}


export async function fetchRepoReadme(fullName: string): Promise<string | null> {
    const apiUrl = `${GITHUB_API_BASE}${fullName}/readme`;
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (response.status === 404) {
            console.warn(`README.md not found for repo: ${fullName}`);
            return null; // README не найден, это не критическая ошибка
        }

        if (!response.ok) {
            throw new Error(`Не удалось получить README. Статус: ${response.status}`);
        }

        const data = await response.json();
        // Содержимое файла README закодировано в base64
        return data.content ? atob(data.content) : null;

    } catch (error) {
        console.error(`Error fetching README for ${fullName}:`, error);
        // Не блокируем пользователя, если README не удалось загрузить
        return null; 
    }
}

async function getDefaultBranch(fullName: string): Promise<string> {
    const apiUrl = `${GITHUB_API_BASE}${fullName}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Fallback for simplicity if API fails
            return 'main';
        }
        const data: RepoDetails = await response.json();
        return data.default_branch;
    } catch {
        // Fallback on network error etc.
        return 'main';
    }
}

export async function fetchRepoTree(fullName:string): Promise<string[]> {
    const branch = await getDefaultBranch(fullName);
    const apiUrl = `${GITHUB_API_BASE}${fullName}/git/trees/${branch}?recursive=1`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Не удалось получить структуру файлов. Статус: ${response.status}`);
        }
        const data: GitTree = await response.json();

        if (data.truncated) {
            console.warn(`File tree for ${fullName} is truncated. Context may be incomplete.`);
        }
        
        const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.py', '.go', '.rs', 'md'];

        // Filter for files (blobs) and exclude certain directories and files
        return data.tree
            .filter(item => 
                item.type === 'blob' && 
                !item.path.includes('node_modules/') &&
                !item.path.includes('dist/') &&
                !item.path.includes('build/') &&
                !item.path.includes('.lock') &&
                 !item.path.includes('package-lock.json') &&
                !item.path.includes('yarn.lock') &&
                relevantExtensions.some(ext => item.path.endsWith(ext))
            )
            .map(item => item.path);

    } catch (error) {
        console.error(`Error fetching repo tree for ${fullName}:`, error);
        // Return empty array instead of throwing, so the process can continue
        return [];
    }
}

export async function fetchFileContent(fullName: string, path: string): Promise<string | null> {
    const apiUrl = `${GITHUB_API_BASE}${fullName}/contents/${path}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(`Failed to fetch file content for ${path}. Status: ${response.status}`);
            return null;
        }
        const data: FileContent = await response.json();
        return data.content ? atob(data.content) : null;

    } catch (error) {
        console.error(`Error fetching file content for ${fullName}/${path}:`, error);
        return null;
    }
}
