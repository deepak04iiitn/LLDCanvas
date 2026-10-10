import { ModulePlayer } from '@/components/plannr/topic/ModulePlayer'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function JourneyTopicPage({ params }: Props) {
  const { slug } = await params
  return <ModulePlayer slug={slug} />
}
