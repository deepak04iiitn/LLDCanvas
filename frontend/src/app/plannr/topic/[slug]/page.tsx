import { TopicFlow } from '@/components/journey/topic/TopicFlow'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function JourneyTopicPage({ params }: Props) {
  const { slug } = await params
  return <TopicFlow slug={slug} />
}
