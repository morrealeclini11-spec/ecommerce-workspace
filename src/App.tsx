import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { AuthGate } from '@/components/AuthGate'
import { Dashboard } from '@/pages/Dashboard'
import { Tasks } from '@/pages/Tasks'
import { Feishu } from '@/pages/Feishu'
import { News } from '@/pages/News'
import { Products } from '@/pages/Products'
import { PetProducts } from '@/pages/PetProducts'
import { Tools } from '@/pages/Tools'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'tasks':
        return <Tasks />
      case 'feishu':
        return <Feishu />
      case 'news':
        return <News />
      case 'products':
        return <Products />
      case 'pet':
        return <PetProducts />
      case 'tools':
        return <Tools />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <AuthGate>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderPage()}
      </Layout>
    </AuthGate>
  )
}

export default App