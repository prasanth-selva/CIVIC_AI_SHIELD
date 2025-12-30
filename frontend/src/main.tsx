import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import RotatingEarth from '@/components/ui/wireframe-dotted-globe'


const el = document.getElementById('root')
if (el) {
  const root = createRoot(el)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

const globalGlobeEl = document.getElementById('global-globe-root')
if (globalGlobeEl) {
  const globeRoot = createRoot(globalGlobeEl)
  globeRoot.render(
    <React.StrictMode>
      <div className="w-full h-full pointer-events-none">
        <RotatingEarth className="w-full h-full" />
      </div>
    </React.StrictMode>,
  )
}
