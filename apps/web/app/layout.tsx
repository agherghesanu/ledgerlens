import type { Metadata } from 'next'
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import '@/styles/globals.css'
import { Providers } from '@/app/providers'
import { SideNav } from '@/components/layout/SideNav'
import { TopBar } from '@/components/layout/TopBar'

const display = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'LedgerLens',
  description: 'Finance judgment simulator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${GeistSans.variable}`}
    >
      <body>
        <Providers>
          <div
            className="flex overflow-hidden"
            style={{ height: '100vh', background: 'var(--bg)' }}
          >
            <SideNav />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-auto" style={{ padding: 32 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
