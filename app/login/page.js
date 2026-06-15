import { redirect } from 'next/navigation'

export default async function LoginRedirect({ searchParams }) {
  const params = await searchParams
  const error = params?.error
  redirect(error ? `/?error=${encodeURIComponent(error)}#masuk` : '/#masuk')
}
