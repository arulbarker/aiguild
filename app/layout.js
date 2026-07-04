import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import PostHogProvider from '@/components/PostHogProvider'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
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
  title: 'AI Guild — Manfaatkan AI Sampai Menghasilkan',
  description: 'Belajar memanfaatkan AI sampai menghasilkan — dari nol, tanpa background IT. Kelas praktis untuk non-IT, ditopang bukti nyata.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
