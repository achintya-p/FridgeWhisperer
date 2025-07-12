import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FridgeWhisperer - Your Kitchen Companion',
  description: 'Turn your ingredients into delicious meals with AI-powered recipe suggestions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 to-purple-50`}>
        {children}
      </body>
    </html>
  )
} 