import LandingClient from '@/components/LandingClient'

export default function Home() {
  const payUrl = process.env.MAYAR_PAYMENT_URL || '#'
  return <LandingClient payUrl={payUrl} />
}
