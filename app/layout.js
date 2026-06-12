import { Inter } from 'next/font/google'
import './globals.css'
import PostHogProvider from '@/components/PostHogProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Guild — Platform Vibe Coding',
  description: 'Belajar vibe coding dari nol sampai bisa menghasilkan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
