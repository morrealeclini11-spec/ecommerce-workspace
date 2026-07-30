import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Tasks } from '@/pages/Tasks'
import { Feishu } from '@/pages/Feishu'
import { News } from '@/pages/News'
import { Products } from '@/pages/Products'
import { Tools } from '@/pages/Tools'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks />
      case 'feishu':
        return <Feishu />
      case 'news':
        return <News />
      case 'products':
        return <Products />
      case 'tools':
        return <Tools />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </Layout>
  )
}

export default App