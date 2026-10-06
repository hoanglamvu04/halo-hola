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
