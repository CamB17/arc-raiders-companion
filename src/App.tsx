import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import Quests from './pages/Quests'
import QuestDetail from './pages/QuestDetail'
import Crafting from './pages/Crafting'
import Enemies from './pages/Enemies'
import EnemyDetail from './pages/EnemyDetail'
import Traders from './pages/Traders'
import TraderDetail from './pages/TraderDetail'
import Maps from './pages/Maps'
import MapDetail from './pages/MapDetail'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomItemsAdmin from './pages/admin/CustomItemsAdmin'
import CustomItemForm from './pages/admin/CustomItemForm'
import ItemsAdmin from './pages/admin/ItemsAdmin'
import ItemEditForm from './pages/admin/ItemEditForm'
import EventsAdmin from './pages/admin/EventsAdmin'
import MapsAdmin from './pages/admin/MapsAdmin'
import MapForm from './pages/admin/MapForm'
import MapMarkersAdmin from './pages/admin/MapMarkersAdmin'
import MapMarkerForm from './pages/admin/MapMarkerForm'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/quests/:id" element={<QuestDetail />} />
        <Route path="/crafting" element={<Crafting />} />
        <Route path="/enemies" element={<Enemies />} />
        <Route path="/enemies/:id" element={<EnemyDetail />} />
        <Route path="/traders" element={<Traders />} />
        <Route path="/traders/:id" element={<TraderDetail />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/maps/:mapId" element={<MapDetail />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/items" element={<CustomItemsAdmin />} />
        <Route path="/admin/items/:id" element={<CustomItemForm />} />
        <Route path="/admin/data/items" element={<ItemsAdmin />} />
        <Route path="/admin/data/items/:id" element={<ItemEditForm />} />
        <Route path="/admin/events" element={<EventsAdmin />} />
        <Route path="/admin/maps" element={<MapsAdmin />} />
        <Route path="/admin/maps/new" element={<MapForm />} />
        <Route path="/admin/maps/:mapId/edit" element={<MapForm />} />
        <Route path="/admin/maps/:mapId/markers" element={<MapMarkersAdmin />} />
        <Route path="/admin/maps/:mapId/markers/:markerId" element={<MapMarkerForm />} />
      </Routes>
    </Layout>
  )
}

export default App
