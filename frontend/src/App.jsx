import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomePage from './pages/HomePage.jsx'
import SubmitPage from './pages/SubmitPage.jsx'
import MapPage from './pages/MapPage.jsx'
import Top52Page from './pages/Top52Page.jsx'
import ArtworkPage from './pages/ArtworkPage.jsx'
import TourPage from './pages/TourPage.jsx'
import HolaDayPage from './pages/HolaDayPage.jsx'
import StoriesPage from './pages/StoriesPage.jsx'
import StoryDetailPage from './pages/StoryDetailPage.jsx'
import WeHolaPage from './pages/WeHolaPage.jsx'
import PartnersPage from './pages/PartnersPage.jsx'
import HelloPage from './pages/HelloPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ThemePage from './pages/ThemePage.jsx'
import LookupPage from './pages/LookupPage.jsx'
import JuryPage from './pages/JuryPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function SiteShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/jury')
  const showBottomNav = !isAdmin && pathname !== '/gui-goc-nhin'

  return (
    <div className={'site-shell '+(showBottomNav?'has-mobile-bottom-nav':'')}>
      <ScrollToTop />
      {!isAdmin && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gui-goc-nhin" element={<SubmitPage />} />
        <Route path="/hola-map" element={<MapPage />} />
        <Route path="/top52" element={<Top52Page />} />
        <Route path="/tac-pham/:slug" element={<ArtworkPage />} />
        <Route path="/hola-tour" element={<TourPage />} />
        <Route path="/hola-day" element={<HolaDayPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:slug" element={<StoryDetailPage />} />
        <Route path="/we-hola" element={<WeHolaPage />} />
        <Route path="/dong-hanh" element={<PartnersPage />} />
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/chu-de/:slug" element={<ThemePage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />
        <Route path="/jury" element={<JuryPage />} />
        <Route path="/jury/:submissionId" element={<JuryPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      {!isAdmin && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return <SiteShell />
}
