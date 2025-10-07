import Link from 'next/link'

const statusCopy: Record<string, { title: string; description: string }> = {
  success: {
    title: 'Subscription confirmed! 🎉',
    description:
      'Thanks for confirming your email. You are officially part of the Syntax & Sips list and will start receiving updates soon.',
  },
  expired: {
    title: 'Confirmation link expired',
    description:
      'Your confirmation link has expired. Please submit your email again and we will send you a fresh confirmation.',
  },
  invalid: {
    title: 'We could not validate that link',
    description:
      'It looks like the confirmation link is missing or has already been used. Enter your email again to request a new one.',
  },
  error: {
    title: 'Something went wrong',
    description:
      'We were unable to confirm your email due to an unexpected error. Please try again in a few minutes.',
  },
}

const getCopy = (status?: string) => statusCopy[status ?? 'success'] ?? statusCopy.success

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewsletterConfirmedPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const statusParam = resolvedParams?.status
  const status = Array.isArray(statusParam) ? statusParam[0] : statusParam
  const copy = getCopy(status)

  return (
    <main className="min-h-[60vh] bg-neutral-950 text-white py-24">
      <div className="container mx-auto px-6 sm:px-10 max-w-3xl text-center">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl px-8 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.4em] text-[#6C63FF] mb-4">Newsletter</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">{copy.title}</h1>
          <p className="text-lg text-white/70 mb-8">{copy.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold bg-[#6C63FF] text-white shadow-[0_8px_0px_0px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-0.5"
            >
              Back to home
            </Link>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/10 transition"
            >
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
