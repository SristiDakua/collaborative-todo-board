import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CollabBoard - Collaborative Todo Board',
  description: 'A beautiful and engaging collaborative task management board',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
