import nodemailer from 'nodemailer'

const mailtrapHost = process.env.MAILTRAP_HOST ?? 'smtp.mailtrap.io'
const mailtrapPort = Number(process.env.MAILTRAP_PORT ?? '2525')
const mailtrapUser = process.env.MAILTRAP_USER
const mailtrapPass = process.env.MAILTRAP_PASS
const fromEmail = process.env.MAILTRAP_FROM_EMAIL ?? 'noreply@syntax-blogs.test'
const fromName = process.env.MAILTRAP_FROM_NAME ?? 'Syntax & Sips'

const assertMailtrapCredentials = () => {
  if (!mailtrapUser || !mailtrapPass) {
    throw new Error('Mailtrap credentials are not configured. Please set MAILTRAP_USER and MAILTRAP_PASS.')
  }
}

export const createMailtrapTransport = () => {
  assertMailtrapCredentials()

  return nodemailer.createTransport({
    host: mailtrapHost,
    port: mailtrapPort,
    auth: {
      user: mailtrapUser!,
      pass: mailtrapPass!,
    },
  })
}

export const newsletterFromAddress = `${fromName} <${fromEmail}>`
