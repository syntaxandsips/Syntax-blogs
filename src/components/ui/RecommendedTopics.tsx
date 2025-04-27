import Link from 'next/link';

// Recommended topics data
const topics = [
  { name: 'Technology', slug: '/topics/technology' },
  { name: 'Writing', slug: '/topics/writing' },
  { name: 'Self Improvement', slug: '/topics/self-improvement' },
  { name: 'Machine Learning', slug: '/topics/machine-learning' },
  { name: 'Relationships', slug: '/topics/relationships' },
  { name: 'Politics', slug: '/topics/politics' },
  { name: 'Cryptocurrency', slug: '/topics/cryptocurrency' },
];

export function RecommendedTopics() {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Recommended topics</h2>
      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={topic.slug}
            className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium transition-colors border border-gray-200"
          >
            {topic.name}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href="/topics"
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          See more topics
        </Link>
      </div>
    </div>
  );
}
