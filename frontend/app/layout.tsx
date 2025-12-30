import './globals.css'
import React from 'react'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the rotating earth as a client component
const RotatingEarth = dynamic(() => import('@/components/ui/wireframe-dotted-globe'), { ssr: false })

export const metadata = {
  title: 'Civic AI Shield',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        {/* Global fixed background globe */}
        <div className="global-globe fixed inset-0 -z-20 opacity-30">
          <RotatingEarth className="w-full h-full" />
        </div>

        {/* App content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
