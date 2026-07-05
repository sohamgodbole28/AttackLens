import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HighlightProvider } from './contexts/HighlightContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HighlightProvider>
      <App />
    </HighlightProvider>
  </StrictMode>,
)
