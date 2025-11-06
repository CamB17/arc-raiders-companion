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
import HideoutTracking from './pages/HideoutTracker'
import ExpeditionTracker from './pages/ExpeditionTracker'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomItemsAdmin from './pages/admin/CustomItemsAdmin'
import CustomItemForm from './pages/admin/CustomItemForm'
import EventsAdmin from './pages/admin/EventsAdmin'
import MapsAdmin from './pages/admin/MapsAdmin'
import MapForm from './pages/admin/MapForm'
import MapMarkersAdmin from './pages/admin/MapMarkersAdmin'
import MapMarkerForm from './pages/admin/MapMarkerForm'
import HideoutWorkbenchesAdmin from './pages/admin/HideoutWorkbenchesAdmin'
import HideoutWorkbenchForm from './pages/admin/HideoutWorkbenchForm'
import HideoutWorkbenchLevelsAdmin from './pages/admin/HideoutWorkbenchLevelsAdmin'
import HideoutWorkbenchLevelForm from './pages/admin/HideoutWorkbenchLevelForm'
import CustomTradersAdmin from './pages/admin/CustomTradersAdmin'
import CustomTraderForm from './pages/admin/CustomTraderForm'
import ExpeditionAdmin from './pages/admin/ExpeditionAdmin'
import ExpeditionPhaseForm from './pages/admin/ExpeditionPhaseForm'

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
        
        {/* Tracking Routes */}
        <Route path="/tracking/hideout" element={<HideoutTracking />} />
        <Route path="/tracking/expedition" element={<ExpeditionTracker />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/items" element={<CustomItemsAdmin />} />
        <Route path="/admin/items/:id" element={<CustomItemForm />} />
        <Route path="/admin/traders" element={<CustomTradersAdmin />} />
        <Route path="/admin/traders/:id" element={<CustomTraderForm />} />
        <Route path="/admin/events" element={<EventsAdmin />} />
        <Route path="/admin/maps" element={<MapsAdmin />} />
        <Route path="/admin/maps/new" element={<MapForm />} />
        <Route path="/admin/maps/:mapId/edit" element={<MapForm />} />
        <Route path="/admin/maps/:mapId/markers" element={<MapMarkersAdmin />} />
        <Route path="/admin/maps/:mapId/markers/:markerId" element={<MapMarkerForm />} />
        <Route path="/admin/hideout-workbenches" element={<HideoutWorkbenchesAdmin />} />
        <Route path="/admin/hideout-workbenches/new" element={<HideoutWorkbenchForm />} />
        <Route path="/admin/hideout-workbenches/:id" element={<HideoutWorkbenchForm />} />
        <Route path="/admin/hideout-workbenches/:workbenchId/levels" element={<HideoutWorkbenchLevelsAdmin />} />
        <Route path="/admin/hideout-workbenches/:workbenchId/levels/new" element={<HideoutWorkbenchLevelForm />} />
        <Route path="/admin/hideout-workbenches/:workbenchId/levels/:id" element={<HideoutWorkbenchLevelForm />} />
        <Route path="/admin/expedition" element={<ExpeditionAdmin />} />
        <Route path="/admin/expedition/phases/new" element={<ExpeditionPhaseForm />} />
        <Route path="/admin/expedition/phases/:id" element={<ExpeditionPhaseForm />} />
      </Routes>
    </Layout>
  )
}

export default App
