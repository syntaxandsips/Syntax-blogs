import { NextResponse } from 'next/server'

import { unsubscribeSubscriber } from '@/lib/newsletter'

export const runtime = 'nodejs'

const buildRedirect = (request: Request, status: string) => {
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/newsletter-unsubscribed', requestUrl.origin)
  redirectUrl.searchParams.set('status', status)
  return NextResponse.redirect(redirectUrl)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const email = requestUrl.searchParams.get('email')

  if (!email) {
    return buildRedirect(request, 'invalid')
  }

  try {
    const result = await unsubscribeSubscriber(email)

    if (result === 'missing') {
      return buildRedirect(request, 'missing')
    }

    return buildRedirect(request, 'success')
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return buildRedirect(request, 'error')
  }
}
