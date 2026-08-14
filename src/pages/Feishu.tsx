import { useState } from 'react'
import { useCloudData } from '@/lib/useCloudData'
import { SyncStatus } from '@/components/SyncStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Search,
  FileText,
  Folder,
  Clock
} from 'lucide-react'

interface FeishuDoc {
  id: number
  title: string
  url: string
  description: string
  type: 'sheet' | 'doc' | 'folder'
  lastAccessed: string
  tags: string[]
}

const initialDocs: FeishuDoc[] = [
  {
    id: 1,
    title: '欧洲市场冬季取暖器销售数据',
    url: 'https://example.feishu.cn/sheets/abc123',
    description: '包含英国、德国、法国等市场的销售数据统计',
    type: 'sheet',
    lastAccessed: '2026-07-30',
    tags: ['销售数据', '欧洲市场']
  },
  {
    id: 2,
    title: '产品调研报告模板',
    url: 'https://example.feishu.cn/docs/def456',
    description: '产品调研的标准报告模板',
    type: 'doc',
    lastAccessed: '2026-07-29',
    tags: ['调研', '模板']
  },
  {
    id: 3,
    title: '竞品分析文件夹',
    url: 'https://example.feishu.cn/folders/ghi789',
    description: '存放所有竞品分析文档的文件夹',
    type: 'folder',
    lastAccessed: '2026-07-28',
    tags: ['竞品分析']
  }
]

export function Feishu() {
  const [docs, setDocs, syncing, cloudActive] = useCloudData<FeishuDoc[]>('ec_feishu_v1', initialDocs)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: '',
    url: '',
    description: '',
    type: 'sheet' as 'sheet' | 'doc' | 'folder',
    tags: ''
  })

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addDoc = () => {
    if (!newDoc.title || !newDoc.url) return
    
    const doc: FeishuDoc = {
      id: Date.now(),
      title: newDoc.title,
      url: newDoc.url,
      description: newDoc.description,
      type: newDoc.type,
      lastAccessed: new Date().toISOString().split('T')[0],
      tags: newDoc.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    
    setDocs(prev => [...prev, doc])
    setNewDoc({ title: '', url: '', description: '', type: 'sheet', tags: '' })
    setShowAddForm(false)
  }

  const deleteDoc = (docId: number) => {
    setDocs(prev => prev.filter(doc => doc.id !== docId))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sheet':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'folder':
        return <Folder className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'sheet':
        return <Badge variant="outline" className="text-green-600 border-green-600">表格</Badge>
      case 'doc':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">文档</Badge>
      case 'folder':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">文件夹</Badge>
      default:
        return <Badge variant="outline">其他</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">飞书表格</h1>
          <p className="text-gray-600">管理您的飞书文档链接</p>
          <SyncStatus syncing={syncing} cloudActive={cloudActive} />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加文档
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索文档..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 添加文档表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>添加飞书文档</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文档标题 *
                  </label>
                  <Input
                    value={newDoc.title}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入文档标题"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文档链接 *
                  </label>
                  <Input
                    value={newDoc.url}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="粘贴飞书文档链接"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文档描述
                </label>
                <Input
                  value={newDoc.description}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述文档内容"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文档类型
                  </label>
                  <select
                    value={newDoc.type}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="sheet">表格</option>
                    <option value="doc">文档</option>
                    <option value="folder">文件夹</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标签（用逗号分隔）
                  </label>
                  <Input
                    value={newDoc.tags}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="例如: 销售数据, 欧洲市场"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button onClick={addDoc}>
                  添加文档
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 文档列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(doc.type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getTypeBadge(doc.type)}
                      {doc.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteDoc(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                最后访问: {doc.lastAccessed}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到文档</h3>
          <p className="text-gray-600">
            {searchTerm ? '尝试不同的搜索词' : '点击"添加文档"按钮来添加您的第一个飞书文档'}
          </p>
        </div>
      )}
    </div>
  )
}