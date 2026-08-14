export interface Subtask {
  id: number
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  subtasks: Subtask[]
  progress: number
}

const KEY = 'ec_tasks_v1'

// 纯本地存储：不依赖任何网络，国内/手机/离线都能用
export function getLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

export function setLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  } catch {
    // 忽略存储异常
  }
}

export function makeId(): string {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
