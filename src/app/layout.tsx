import type { Metadata } from 'next'
import localFont from 'next/font/local'

import './globals.css'

const noirPro = localFont({
  src: [
    { path: '../fonts/NoirPro-Light.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/NoirPro-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/NoirPro-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-noir-pro',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://abiola.theruff.agency'),
  title: {
    default: 'Abiola Oyedele — Designer. Strategist. Builder.',
    template: '%s — Abiola Oyedele',
  },
  description:
    'Portfolio of Abiola Oyedele — a designer, strategist, and builder working across graphics, motion, and playground projects.',
  openGraph: {
    type: 'website',
    title: 'Abiola Oyedele — Designer. Strategist. Builder.',
    description:
      'Portfolio of Abiola Oyedele — a designer, strategist, and builder working across graphics, motion, and playground projects.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abiola Oyedele — Designer. Strategist. Builder.',
    description:
      'Portfolio of Abiola Oyedele — a designer, strategist, and builder working across graphics, motion, and playground projects.',
    images: ['/og-image.png'],
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Bare shell — html/body, fonts, and app-wide metadata only. Deliberately
 * does NOT render Navbar/Footer: those live in `(public)/layout.tsx` so
 * `/admin/*` routes (which render their own AdminNav via `(admin)/layout.tsx`)
 * never show the public marketing nav alongside it.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={noirPro.variable}>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  )
}
