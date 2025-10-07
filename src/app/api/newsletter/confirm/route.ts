import { NextResponse } from 'next/server'

import { confirmSubscriber } from '@/lib/newsletter'

export const runtime = 'nodejs'

const buildRedirect = (request: Request, status: string) => {
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/newsletter-confirmed', requestUrl.origin)
  redirectUrl.searchParams.set('status', status)
  return NextResponse.redirect(redirectUrl)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const email = requestUrl.searchParams.get('email')

  if (!token || !email) {
    return buildRedirect(request, 'invalid')
  }

  try {
    const result = await confirmSubscriber(email, token)

    if (result === 'confirmed') {
      return buildRedirect(request, 'success')
    }

    if (result === 'expired') {
      return buildRedirect(request, 'expired')
    }

    return buildRedirect(request, 'invalid')
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    return buildRedirect(request, 'error')
  }
}
