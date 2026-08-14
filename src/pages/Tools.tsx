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
  Wrench,
  Code,
  Link,
  Key,
  Globe,
  Zap
} from 'lucide-react'

interface Tool {
  id: number
  name: string
  description: string
  url: string
  type: 'link' | 'api' | 'tool'
  category: string
  apiKey?: string
  lastUsed: string
  tags: string[]
  isFavorite: boolean
}

const initialTools: Tool[] = [
  {
    id: 1,
    name: 'Google Trends',
    description: '查看关键词搜索趋势和热度变化',
    url: 'https://trends.google.com',
    type: 'link',
    category: '数据分析',
    lastUsed: '2026-07-30',
    tags: ['趋势分析', '关键词研究'],
    isFavorite: true
  },
  {
    id: 2,
    name: 'TikTok Shop 卖家中心',
    description: 'TikTok Shop 跨境入驻与店铺后台，管理商品/订单/直播带货',
    url: 'https://seller-us.tiktok.com',
    type: 'link',
    category: '平台入驻',
    lastUsed: '2026-08-14',
    tags: ['TikTok', '跨境入驻', '店铺管理'],
    isFavorite: true
  },
  {
    id: 3,
    name: 'Canva设计工具',
    description: '在线图形设计平台，用于制作产品图片和广告素材',
    url: 'https://canva.com',
    type: 'tool',
    category: '设计工具',
    lastUsed: '2026-07-28',
    tags: ['设计', '图片编辑'],
    isFavorite: false
  },
  {
    id: 4,
    name: '1688供应商管理',
    description: '管理和联系1688平台供应商',
    url: 'https://1688.com',
    type: 'link',
    category: '供应链',
    lastUsed: '2026-07-30',
    tags: ['采购', '供应链'],
    isFavorite: true
  },
  {
    id: 5,
    name: '翻译API',
    description: '多语言翻译服务，支持商品描述翻译',
    url: 'https://api.translate.com',
    type: 'api',
    category: '工具',
    apiKey: 'translate_api_key_xxxxx',
    lastUsed: '2026-07-30',
    tags: ['翻译', '多语言'],
    isFavorite: false
  }
]

export function Tools() {
  const [tools, setTools, syncing, cloudActive] = useCloudData<Tool[]>('ec_tools_v1', initialTools)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    url: '',
    type: 'link' as 'link' | 'api' | 'tool',
    category: '',
    apiKey: '',
    tags: ''
  })

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addTool = () => {
    if (!newTool.name || !newTool.url) return
    
    const tool: Tool = {
      id: Date.now(),
      name: newTool.name,
      description: newTool.description,
      url: newTool.url,
      type: newTool.type,
      category: newTool.category || '未分类',
      apiKey: newTool.apiKey || undefined,
      lastUsed: new Date().toISOString().split('T')[0],
      tags: newTool.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFavorite: false
    }
    
    setTools(prev => [...prev, tool])
    setNewTool({ name: '', description: '', url: '', type: 'link', category: '', apiKey: '', tags: '' })
    setShowAddForm(false)
  }

  const deleteTool = (toolId: number) => {
    setTools(prev => prev.filter(tool => tool.id !== toolId))
  }

  const toggleFavorite = (toolId: number) => {
    setTools(prev => prev.map(tool => {
      if (tool.id === toolId) {
        return { ...tool, isFavorite: !tool.isFavorite }
      }
      return tool
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="h-5 w-5 text-blue-500" />
      case 'api':
        return <Code className="h-5 w-5 text-green-500" />
      case 'tool':
        return <Wrench className="h-5 w-5 text-purple-500" />
      default:
        return <Globe className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'link':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">链接</Badge>
      case 'api':
        return <Badge variant="outline" className="text-green-600 border-green-600">API</Badge>
      case 'tool':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">工具</Badge>
      default:
        return <Badge variant="outline">其他</Badge>
    }
  }

  const favoriteTools = filteredTools.filter(tool => tool.isFavorite)
  const otherTools = filteredTools.filter(tool => !tool.isFavorite)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工具网站</h1>
          <p className="text-gray-600">管理您的工具链接和API接口</p>
          <SyncStatus syncing={syncing} cloudActive={cloudActive} />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加工具
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索工具..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 添加工具表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>添加工具</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工具名称 *
                  </label>
                  <Input
                    value={newTool.name}
                    onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入工具名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工具链接/API地址 *
                  </label>
                  <Input
                    value={newTool.url}
                    onChange={(e) => setNewTool(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="输入工具链接或API地址"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工具描述
                </label>
                <Input
                  value={newTool.description}
                  onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述工具功能"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工具类型
                  </label>
                  <select
                    value={newTool.type}
                    onChange={(e) => setNewTool(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="link">链接</option>
                    <option value="api">API</option>
                    <option value="tool">工具</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <Input
                    value={newTool.category}
                    onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="例如: 数据分析"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API密钥（如适用）
                  </label>
                  <Input
                    value={newTool.apiKey}
                    onChange={(e) => setNewTool(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="输入API密钥"
                    type="password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签（用逗号分隔）
                </label>
                <Input
                  value={newTool.tags}
                  onChange={(e) => setNewTool(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例如: 数据分析, 关键词研究"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button onClick={addTool}>
                  添加工具
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 收藏工具 */}
      {favoriteTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              常用工具
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTools.map(tool => (
                <div 
                  key={tool.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleFavorite(tool.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(tool.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{tool.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tool.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getTypeBadge(tool.type)}
                          <Badge variant="secondary" className="text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTool(tool.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {tool.apiKey && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Key className="h-3 w-3 mr-1" />
                      API已配置
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 其他工具 */}
      <Card>
        <CardHeader>
          <CardTitle>所有工具</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {otherTools.map(tool => (
              <div 
                key={tool.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTypeIcon(tool.type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeBadge(tool.type)}
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                      {tool.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    最后使用: {tool.lastUsed}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleFavorite(tool.id)}
                  >
                    <Zap className={`h-4 w-4 ${tool.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteTool(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到工具</h3>
          <p className="text-gray-600">
            {searchTerm ? '尝试不同的搜索词' : '点击"添加工具"按钮来添加您的第一个工具'}
          </p>
        </div>
      )}
    </div>
  )
}