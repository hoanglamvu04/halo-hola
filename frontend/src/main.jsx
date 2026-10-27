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
import './styles/campaign-mobile-fix.css'
import './styles/home-sections-bundle.css'
import './styles/mobile-smart-header.css'
import './styles/artwork-mobile-info-fix.css'
import './styles/theme-gallery-mobile-height-fix.css'
import './styles/stories-bundle.css'
import './styles/submission-flow-bundle.css'
import './styles/home-hero-mobile-spacing-tight.css'
import './styles/campaign-runtime-bundle.css'
import './styles/home-shared-titles.css'
import './styles/mobile-menu-upgrade.css'
import './styles/page-shared-titles.css'
import './styles/partners-page-modern.css'
import './styles/partners-mobile-compact.css'
import './styles/lookup-page-modern.css'
import './styles/hola-day-modern.css'
import './styles/we-hola-mobile-refresh.css'
import './styles/mobile-bottom-nav-clearance.css'
import './styles/submission-final-bundle.css'
import './styles/theme-card-mobile-flow-final.css'
import './styles/admin-mobile-sidebar.css'
import './styles/admin-community-codes.css'
import './styles/home-hero-desktop-compact.css'
import './styles/home-stories-showcase.css'
import './styles/tour-bundle.css'
import './styles/hola-day-bundle.css'
import './styles/display-title-splandor.css'
import './styles/home-hero-gap-final.css'
import './styles/campaign-editorial-final.css'
import './styles/public-sections-compact-final.css'
import './styles/footer-editorial-final.css'
import './styles/mobile-form-focus-fix.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MobileHeroExperience from './components/MobileHeroExperience.jsx'
import ColorStoryDesktopExperience from './components/ColorStoryDesktopExperience.jsx'
import ColorArtworkBadgeRuntime from './components/ColorArtworkBadgeRuntime.jsx'
import SubmissionFacebookGate from './components/SubmissionFacebookGate.jsx'
import SubmissionQuickMode from './components/SubmissionQuickMode.jsx'
import SubmissionOperationsRuntime from './components/SubmissionOperationsRuntime.jsx'
import IosSubmissionExperience from './components/IosSubmissionExperience.jsx'
import SubmissionWizardExperience from './components/SubmissionWizardExperience.jsx'
import SubmissionMediaTypeGuard from './components/SubmissionMediaTypeGuard.jsx'
import SubmissionCaptureDateGuard from './components/SubmissionCaptureDateGuard.jsx'
import SubmissionPhoneRequired from './components/SubmissionPhoneRequired.jsx'
import SubmissionUploadCopyPolish from './components/SubmissionUploadCopyPolish.jsx'
import SubmissionReviewRuntime from './components/SubmissionReviewRuntime.jsx'
import SubmissionEmailValidation from './components/SubmissionEmailValidation.jsx'
import AdminSubmissionResetRuntime from './components/AdminSubmissionResetRuntime.jsx'
import AdminSubmissionNotificationRuntime from './components/AdminSubmissionNotificationRuntime.jsx'
import AdminMobileSidebarRuntime from './components/AdminMobileSidebarRuntime.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <MobileHeroExperience />
        <ColorStoryDesktopExperience />
        <ColorArtworkBadgeRuntime />
        <SubmissionQuickMode />
        <SubmissionFacebookGate />
        <SubmissionOperationsRuntime />
        <IosSubmissionExperience />
        <SubmissionWizardExperience />
        <SubmissionMediaTypeGuard />
        <SubmissionCaptureDateGuard />
        <SubmissionPhoneRequired />
        <SubmissionUploadCopyPolish />
        <SubmissionReviewRuntime />
        <SubmissionEmailValidation />
        <AdminSubmissionResetRuntime />
        <AdminSubmissionNotificationRuntime />
        <AdminMobileSidebarRuntime />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)