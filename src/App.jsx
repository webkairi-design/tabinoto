import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DiaryPage from './pages/DiaryPage'
import NewEntryPage from './pages/NewEntryPage'
import EntryDetailPage from './pages/EntryDetailPage'
import MapPage from './pages/MapPage'
import AiResearchPage from './pages/AiResearchPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/diary" replace />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/diary/new" element={<NewEntryPage />} />
        <Route path="/diary/:id" element={<EntryDetailPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/ai-research" element={<AiResearchPage />} />
      </Routes>
    </Layout>
  )
}