import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import PostHogProvider from '@/components/PostHogProvider'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400'],
})

export const metadata = {
  title: 'AI Guild — Platform Vibe Coding',
  description: 'Belajar vibe coding dari nol sampai bisa menghasilkan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${syne.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
