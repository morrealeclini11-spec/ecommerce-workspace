import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Mic,
  MicOff,
  Clock,
  CheckCircle,
  Check,
  Circle,
  Trash2,
  Calendar,
} from 'lucide-react'
import { makeId } from '@/lib/tasks'
import type { Task, Subtask } from '@/lib/tasks'
import { useCloudData } from '@/lib/useCloudData'
import { SyncStatus } from '@/components/SyncStatus'

export function Tasks() {
  const [tasks, setTasks, syncing, cloudActive] = useCloudData<Task[]>('ec_tasks_v1', [])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingText, setRecordingText] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [subInputs, setSubInputs] = useState<Record<string, string>>({})

  // 任何改动都同时更新界面并写入本机存储
  const refresh = (list: Task[]) => {
    setTasks(list)
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      setRecordingText('完成产品调研报告，包括市场数据收集和竞品分析')
    }
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    const task: Task = {
      id: makeId(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      progress: 0,
    }
    refresh([task, ...tasks])
    setNewTask({ title: '', description: '' })
    setShowNewTaskForm(false)
  }

  const toggleTaskStatus = (task: Task) => {
    const newStatus: Task['status'] =
      task.status === 'completed'
        ? 'pending'
        : task.status === 'pending'
        ? 'in_progress'
        : 'completed'
    const updated = { ...task, status: newStatus, updatedAt: new Date().toISOString() }
    refresh(tasks.map((t) => (t.id === task.id ? updated : t)))
  }

  const deleteTask = (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    refresh(tasks.filter((t) => t.id !== taskId))
  }

  const clearAll = () => {
    if (!confirm('确定清空所有任务吗？此操作不可恢复')) return
    setTasks([])
  }

  const addSubtask = (task: Task) => {
    const title = (subInputs[task.id] || '').trim()
    if (!title) return
    const sub: Subtask = { id: Date.now(), title, completed: false }
    const updated = { ...task, subtasks: [...(task.subtasks || []), sub] }
    refresh(tasks.map((t) => (t.id === task.id ? updated : t)))
    setSubInputs((prev) => ({ ...prev, [task.id]: '' }))
  }

  const toggleSubtask = (task: Task, subId: number) => {
    const subtasks = (task.subtasks || []).map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    )
    const updated = { ...task, subtasks }
    refresh(tasks.map((t) => (t.id === task.id ? updated : t)))
  }

  const setProgress = (task: Task, value: number) => {
    const updated = { ...task, progress: value }
    refresh(tasks.map((t) => (t.id === task.id ? updated : t)))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">高</Badge>
      case 'medium':
        return <Badge variant="secondary">中</Badge>
      default:
        return <Badge variant="outline">低</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">事项安排</h1>
          <div className="flex items-center gap-1 text-sm mt-1">
            <SyncStatus syncing={syncing} cloudActive={cloudActive} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
          <Button variant="outline" onClick={clearAll}>
            清空全部
          </Button>
        </div>
      </div>

      {/* 语音输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            语音快速添加
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleVoiceInput}
              className="h-12 w-12"
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <div className="flex-1">
              {isRecording ? (
                <div className="text-red-500 font-medium">正在录音，请说话...</div>
              ) : (
                <div className="text-gray-500">点击麦克风图标开始语音输入</div>
              )}
              {recordingText && (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm">{recordingText}</p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setNewTask((prev) => ({ ...prev, title: recordingText }))
                      setShowNewTaskForm(true)
                      setRecordingText('')
                    }}
                  >
                    添加为任务
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新建任务表单 */}
      {showNewTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>新建任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="输入任务标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="输入任务描述（可选）"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                  取消
                </Button>
                <Button onClick={addTask}>添加任务</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 任务列表 */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <button onClick={() => toggleTaskStatus(task)} className="mt-1">
                    {getStatusIcon(task.status)}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-lg font-medium ${
                          task.status === 'completed'
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-gray-600 mt-1">{task.description}</p>

                    {/* 进度条 + 手动调整 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center space-x-3">
                        <span className="text-xs text-gray-500">调整进度</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={task.progress}
                          onChange={(e) => setProgress(task, Number(e.target.value))}
                          className="flex-1 accent-blue-600"
                        />
                        <span className="text-xs text-gray-700 w-10 text-right">
                          {task.progress}%
                        </span>
                      </div>
                    </div>

                    {/* 子任务 */}
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">相关子事务：</p>
                      {(task.subtasks || []).map((subtask: Subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => toggleSubtask(task, subtask.id)}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              subtask.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {subtask.completed && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span
                            className={`text-sm ${
                              subtask.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                            }`}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="添加相关子事务..."
                          value={subInputs[task.id] || ''}
                          onChange={(e) =>
                            setSubInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addSubtask(task)
                          }}
                          className="text-sm"
                        />
                        <Button size="sm" variant="outline" onClick={() => addSubtask(task)}>
                          添加
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有任务</h3>
            <p className="text-gray-600 mb-4">点击"新建任务"按钮添加您的第一个任务</p>
            <Button onClick={() => setShowNewTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
