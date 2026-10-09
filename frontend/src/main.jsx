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
import './styles/home-change-desktop-card-fix.css'
import './styles/home-themes-mobile-fix.css'
import './styles/home-colors-mobile-fix.css'
import './styles/home-tour-mobile-spacing-fix.css'
import './styles/home-map-mobile-fix.css'
import './styles/home-top52-we-mobile-spacing-fix.css'
import './styles/mobile-smart-header.css'
import './styles/artwork-mobile-info-fix.css'
import './styles/theme-gallery-mobile-height-fix.css'
import './styles/tour-mobile-title-fix.css'
import './styles/tour-mobile-hero-visual-fix.css'
import './styles/tour-mobile-itinerary-fix.css'
import './styles/tour-mobile-info-font-fix.css'
import './styles/tour-mobile-stops-fix.css'
import './styles/tour-register-modal.css'
import './styles/stories-mobile-spacing-fix.css'
import './styles/submit-page-modern.css'
import './styles/submit-hola-location-picker.css'
import './styles/home-hero-mobile-spacing-tight.css'
import './styles/campaign-admin-runtime.css'
import './styles/campaign-mobile-readability-fix.css'
import './styles/campaign-journey-modern.css'
import './styles/campaign-desktop-modern.css'
import './styles/campaign-desktop-timeline-right.css'
import './styles/home-shared-titles.css'
import './styles/footer-modern.css'
import './styles/footer-size-up.css'
import './styles/mobile-menu-upgrade.css'
import './styles/page-shared-titles.css'
import './styles/partners-page-modern.css'
import './styles/lookup-page-modern.css'
import './styles/hola-day-modern.css'
import './styles/rules-awards-mobile-facts-fix.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MobileHeroExperience from './components/MobileHeroExperience.jsx'
import CampaignRuntimeCustomizer from './components/CampaignRuntimeCustomizer.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <MobileHeroExperience />
        <CampaignRuntimeCustomizer />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
