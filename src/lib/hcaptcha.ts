interface VerifyCaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  credit?: boolean
  score?: number
}

export async function verifyHCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET_KEY

  if (!secret) {
    throw new Error('HCAPTCHA_SECRET_KEY is not configured.')
  }

  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      response: token,
      secret,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Unable to verify hCaptcha: ${response.statusText}`)
  }

  const payload = (await response.json()) as VerifyCaptchaResponse

  if (!payload.success) {
    throw new Error(
      payload['error-codes']?.length
        ? `Captcha validation failed: ${payload['error-codes'].join(', ')}`
        : 'Captcha validation failed.'
    )
  }

  return payload
}
