import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealHunter — Automated Real Estate Offer Platform',
  description: 'Find motivated sellers in South Florida and send automated cash offers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
