import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

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

// ---------- 本地存储（永远可用，不依赖网络） ----------
export function getLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

export function setLocalTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

// ---------- 云端同步（尽力而为，失败不影响本地） ----------
export async function pushToFirebase(task: Task): Promise<void> {
  await addDoc(collection(db, 'tasks'), task)
}

export async function removeFromFirebase(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', id))
}

export async function updateFirebase(id: string, data: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, 'tasks', id), data as Record<string, unknown>)
}

export async function fetchFromFirebase(): Promise<Task[]> {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const out: Task[] = []
  snap.forEach((d) => out.push({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }))
  return out
}

// 合并本地与云端：云端为准，本地独有的也保留
export function mergeTasks(local: Task[], cloud: Task[]): Task[] {
  const map = new Map<string, Task>()
  local.forEach((t) => map.set(t.id, t))
  cloud.forEach((t) => map.set(t.id, t))
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function makeId(): string {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
