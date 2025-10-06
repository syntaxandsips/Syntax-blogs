import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

type PageProps = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function EditPostPage({ params }: PageProps) {
  // This is a redirect-only page, so we don't use the params
  redirect('/admin')
}

export const metadata: Metadata = {
  title: 'Edit Post',
  description: 'Edit an existing blog post',
}
