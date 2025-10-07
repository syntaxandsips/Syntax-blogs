import { NextResponse } from 'next/server'

import { createMailtrapTransport, newsletterFromAddress } from '@/lib/mailtrap'
import { saveSubscriber } from '@/lib/newsletter'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const runtime = 'nodejs'

const buildConfirmationEmail = (recipient: string, confirmationUrl: URL) => ({
  from: newsletterFromAddress,
  to: recipient,
  subject: 'Confirm your Syntax & Sips subscription',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <div style="padding: 24px; border-radius: 12px; border: 1px solid #e3e3e3;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">One more step to stay in the loop</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 24px;">
          Thanks for subscribing to <strong>Syntax & Sips</strong>! Please confirm your email address so we can start sending you fresh
          stories, tutorials, and behind-the-scenes updates.
        </p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${confirmationUrl.toString()}" style="background-color: #6c63ff; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Confirm my email
          </a>
        </p>
        <p style="color: #4a4a4a; font-size: 14px; line-height: 20px;">
          This confirmation link will expire in 48 hours. If you didn’t try to join the newsletter, you can safely ignore this message.
        </p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e3e3e3;" />
        <p style="color: #8a8a8a; font-size: 12px; line-height: 18px;">
          Syntax & Sips · Weekly insights on AI, engineering craft, and leadership.<br />
          You can update your preferences or unsubscribe at any time.
        </p>
      </div>
    </div>
  `,
})

export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as {
    email?: string
  }

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Please provide a valid email address.' },
      { status: 422 },
    )
  }

  try {
    const requestUrl = new URL(request.url)
    const source = requestUrl.searchParams.get('source') ?? 'web'

    const { token, wasResent } = await saveSubscriber(email, source, {
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
    })

    const confirmationUrl = new URL('/api/newsletter/confirm', requestUrl.origin)
    confirmationUrl.searchParams.set('token', token)
    confirmationUrl.searchParams.set('email', email)

    const transporter = createMailtrapTransport()

    await transporter.sendMail(buildConfirmationEmail(email, confirmationUrl))

    return NextResponse.json({
      message: wasResent
        ? 'Welcome back! Please check your inbox to confirm your subscription.'
        : 'Almost there! Please check your inbox to confirm your subscription.',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      {
        error:
          'We could not complete your subscription right now. Please try again in a few minutes.',
      },
      { status: 500 },
    )
  }
}
