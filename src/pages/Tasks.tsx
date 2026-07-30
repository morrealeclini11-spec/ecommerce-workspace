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
  Circle, 
  Trash2,
  Edit,
  Calendar
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  subtasks: Subtask[]
  progress: number
}

interface Subtask {
  id: number
  title: string
  completed: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: '完成产品调研报告',
    description: '调研欧洲市场冬季取暖器需求，分析竞品数据，撰写详细报告。',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2026-07-29',
    updatedAt: '2026-07-30',
    subtasks: [
      { id: 1, title: '收集市场数据', completed: true },
      { id: 2, title: '分析竞品信息', completed: false },
      { id: 3, title: '撰写报告', completed: false }
    ],
    progress: 33
  },
  {
    id: 2,
    title: '准备下周会议材料',
    description: '整理本周销售数据，准备PPT演示文稿。',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-07-30',
    updatedAt: '2026-07-30',
    subtasks: [],
    progress: 0
  },
  {
    id: 3,
    title: '联系供应商确认库存',
    description: '确认取暖器库存情况，安排补货计划。',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-07-28',
    updatedAt: '2026-07-30',
    subtasks: [
      { id: 1, title: '发送询价邮件', completed: true },
      { id: 2, title: '确认价格', completed: true }
    ],
    progress: 100
  }
]

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingText, setRecordingText] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      // 模拟语音转文字结果
      setRecordingText('完成产品调研报告，包括市场数据收集和竞品分析')
    }
  }

  const addTask = () => {
    if (!newTask.title) return
    
    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      subtasks: [],
      progress: 0
    }
    
    setTasks([...tasks, task])
    setNewTask({ title: '', description: '' })
    setShowNewTaskForm(false)
  }

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in_progress' : 'completed'
        return { ...task, status: newStatus }
      }
      return task
    }))
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">事项安排</h1>
          <p className="text-gray-600">管理您的任务和待办事项</p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建任务
        </Button>
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
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceInput}
              className="h-12 w-12"
            >
              {isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
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
                      setNewTask(prev => ({ ...prev, title: recordingText }))
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务标题
                </label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入任务标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务描述
                </label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入任务描述（可选）"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                  取消
                </Button>
                <Button onClick={addTask}>
                  添加任务
                </Button>
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
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-lg font-medium ${
                        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    
                    {/* 进度条 */}
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
                    </div>

                    {/* 子任务 */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">子任务：</p>
                        {task.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border ${
                              subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {subtask.completed && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              subtask.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                            }`}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 时间信息 */}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        创建于 {task.createdAt}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        更新于 {task.updatedAt}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}