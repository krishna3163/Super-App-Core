import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import Layout from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Super App',
  description: 'The ultimate everything app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ConvexClientProvider>
          <Providers>
            <Layout>
              {children}
            </Layout>
          </Providers>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
