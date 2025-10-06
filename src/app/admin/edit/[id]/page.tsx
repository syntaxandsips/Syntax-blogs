import { redirect } from 'next/navigation'

interface RouteParams {
  params: { id: string }
}

export default function EditPostPage({ params }: RouteParams) {
  void params
  redirect('/admin')
}
