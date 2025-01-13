import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TA-TE-TI',
  description: 'Creado con Next.js, Typescript y Tailwind CSS',
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
