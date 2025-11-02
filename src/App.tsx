import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import Missions from './pages/Missions'
import MissionDetail from './pages/MissionDetail'
import Quests from './pages/Quests'
import QuestDetail from './pages/QuestDetail'
import Crafting from './pages/Crafting'
import Enemies from './pages/Enemies'
import EnemyDetail from './pages/EnemyDetail'
import Maps from './pages/Maps'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:id" element={<MissionDetail />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/quests/:id" element={<QuestDetail />} />
        <Route path="/crafting" element={<Crafting />} />
        <Route path="/enemies" element={<Enemies />} />
        <Route path="/enemies/:id" element={<EnemyDetail />} />
        <Route path="/maps" element={<Maps />} />
      </Routes>
    </Layout>
  )
}

export default App
