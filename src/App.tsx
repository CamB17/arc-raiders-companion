import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import Missions from './pages/Missions'
import Crafting from './pages/Crafting'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/crafting" element={<Crafting />} />
      </Routes>
    </Layout>
  )
}

export default App
