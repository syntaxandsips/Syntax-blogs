import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  await params
  redirect('/admin')
}

export const metadata: Metadata = {
  title: 'Edit Post',
  description: 'Edit an existing blog post',
}
