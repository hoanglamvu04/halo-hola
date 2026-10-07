import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import './styles/brand-runtime.css'
import './styles/mobile-polish.css'
import './styles/performance.css'
import './styles/home-hero-mobile-fix.css'
import './styles/color-card-image-fix.css'
import './styles/tour-desktop-font-fix.css'
import './styles/campaign-mobile-fix.css'
import './styles/home-change-mobile-fix.css'
import './styles/home-themes-mobile-fix.css'
import './styles/home-colors-mobile-fix.css'
import './styles/home-tour-mobile-spacing-fix.css'
import './styles/home-map-mobile-fix.css'
import './styles/home-top52-we-mobile-spacing-fix.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MobileHeroExperience from './components/MobileHeroExperience.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <MobileHeroExperience />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
