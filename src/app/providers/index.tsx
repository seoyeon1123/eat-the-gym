import { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { HomePage } from '@/pages/home'
import '../styles/index.css'

export function initApp(): Root {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <HomePage />
    </StrictMode>
  )

  return root
}
