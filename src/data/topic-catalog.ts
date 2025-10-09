export interface TopicLeafData {
  label: string;
  slug: string;
  quip?: string;
}

export interface TopicClusterData {
  label: string;
  slug: string;
  topics: TopicLeafData[];
  accentColor: string;
  quip?: string;
}

export interface TopicSectionData {
  title: string;
  slug: string;
  description: string;
  accentColor: string;
  textColor: string;
  clusters: TopicClusterData[];
  showAllLabel?: string;
  quip?: string;
}

export interface TopicNavigationLink {
  label: string;
  anchor?: string;
  topicSlug?: string;
}

export interface StandaloneTopic {
  label: string;
  slug: string;
  quip?: string;
}

const defaultQuip = (label: string) =>
  `No ${label} stories yet — clearly everyone is still drafting in their head. Write some or swing back later.`;

const leaf = (label: string, overrides: Partial<TopicLeafData> = {}): TopicLeafData => ({
  label,
  slug: overrides.slug ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  quip: overrides.quip ?? defaultQuip(label),
});

const section = (
  title: string,
  description: string,
  accentColor: string,
  textColor: string,
  clusters: TopicClusterData[],
  overrides: Partial<TopicSectionData> = {},
): TopicSectionData => ({
  title,
  slug: overrides.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description,
  accentColor,
  textColor,
  clusters,
  showAllLabel: overrides.showAllLabel ?? `Show all in "${title}"`,
  quip: overrides.quip ?? defaultQuip(title),
});

const withSlug = (label: string, slug: string, quip?: string) => leaf(label, { slug, quip });

export const topicSections: TopicSectionData[] = [
  section(
    'Life',
    'Whole-self stories that balance ambition with being human.',
    '#FFD166',
    '#18181B',
    [
      {
        label: 'Family',
        slug: 'family-life',
        accentColor: '#F97316',
        quip: defaultQuip('Family'),
        topics: [
          leaf('Adoption'),
          leaf('Children'),
          leaf('Elder Care'),
          leaf('Fatherhood'),
          leaf('Motherhood'),
        ],
      },
      {
        label: 'More',
        slug: 'life-health',
        accentColor: '#1D4ED8',
        quip: defaultQuip('Life & health'),
        topics: [
          leaf('Health'),
          leaf('Aging'),
          withSlug('Coronavirus', 'coronavirus'),
          withSlug('Covid-19', 'covid-19'),
          leaf('Death And Dying'),
          leaf('Disease'),
        ],
      },
      {
        label: 'Relationships',
        slug: 'life-relationships',
        accentColor: '#DB2777',
        quip: defaultQuip('Relationships'),
        topics: [
          leaf('Dating'),
          leaf('Divorce'),
          leaf('Friendship'),
          leaf('Love'),
          leaf('Marriage'),
        ],
      },
    ],
    { slug: 'life' },
  ),
  section(
    'Self Improvement',
    'Growth-minded playbooks to get a little sharper every day.',
    '#06D6A0',
    '#052e1d',
    [
      {
        label: 'Mental Health',
        slug: 'self-mental-health',
        accentColor: '#6C63FF',
        topics: [
          leaf('Anxiety'),
          leaf('Counseling'),
          leaf('Grief'),
          leaf('Life Lessons'),
          withSlug('Self-awareness', 'self-awareness'),
        ],
      },
      {
        label: 'Productivity',
        slug: 'self-productivity',
        accentColor: '#F59E0B',
        topics: [
          leaf('Career Advice'),
          leaf('Coaching'),
          leaf('Goal Setting'),
          leaf('Morning Routines'),
          withSlug('Pomodoro Technique', 'pomodoro-technique'),
        ],
      },
      {
        label: 'Mindfulness',
        slug: 'self-mindfulness',
        accentColor: '#0EA5E9',
        topics: [
          withSlug('Guided Meditation', 'guided-meditation'),
          leaf('Journaling'),
          leaf('Meditation'),
          withSlug('Transcendental Meditation', 'transcendental-meditation'),
          leaf('Yoga'),
        ],
      },
    ],
    { slug: 'self-improvement' },
  ),
  section(
    'Work',
    'Operating manuals for ambitious teams, leaders, and independents.',
    '#F87171',
    '#1F2937',
    [
      {
        label: 'Business',
        slug: 'work-business',
        accentColor: '#111827',
        topics: [
          leaf('Entrepreneurship'),
          leaf('Freelancing'),
          withSlug('Small Business', 'small-business'),
          leaf('Startups'),
          withSlug('Venture Capital', 'venture-capital'),
        ],
      },
      {
        label: 'Marketing',
        slug: 'work-marketing',
        accentColor: '#2563EB',
        topics: [
          leaf('Advertising'),
          leaf('Branding'),
          withSlug('Content Marketing', 'content-marketing'),
          withSlug('Content Strategy', 'content-strategy'),
          withSlug('Digital Marketing', 'digital-marketing'),
        ],
      },
      {
        label: 'Leadership',
        slug: 'work-leadership',
        accentColor: '#7C3AED',
        topics: [
          withSlug('Employee Engagement', 'employee-engagement'),
          withSlug('Leadership Coaching', 'leadership-coaching'),
          withSlug('Leadership Development', 'leadership-development'),
          leaf('Management'),
          leaf('Meetings'),
        ],
      },
    ],
    { slug: 'work' },
  ),
  section(
    'Technology',
    'Frontier tech, frameworks, and the systems powering tomorrow.',
    '#94A3B8',
    '#020617',
    [
      {
        label: 'Artificial Intelligence',
        slug: 'tech-ai',
        accentColor: '#4338CA',
        topics: [
          withSlug('ChatGPT', 'chatgpt'),
          withSlug('Conversational AI', 'conversational-ai'),
          withSlug('Deep Learning', 'deep-learning'),
          withSlug('Large Language Models', 'large-language-models'),
          withSlug('Machine Learning', 'machine-learning'),
        ],
      },
      {
        label: 'Blockchain',
        slug: 'tech-blockchain',
        accentColor: '#059669',
        topics: [
          leaf('Bitcoin'),
          leaf('Cryptocurrency'),
          withSlug('Decentralized Finance', 'defi'),
          withSlug('Ethereum', 'ethereum'),
          withSlug('Nft', 'nft'),
        ],
      },
      {
        label: 'Data Science',
        slug: 'tech-data',
        accentColor: '#F97316',
        topics: [
          leaf('Analytics'),
          withSlug('Data Engineering', 'data-engineering'),
          withSlug('Data Visualization', 'data-visualization'),
          withSlug('Database Design', 'database-design'),
          withSlug('Sql', 'sql'),
        ],
      },
    ],
    { slug: 'technology' },
  ),
  section(
    'Software Development',
    'Ship-ready craft for builders shipping beautiful, resilient products.',
    '#6C63FF',
    '#0F172A',
    [
      {
        label: 'Programming',
        slug: 'dev-programming',
        accentColor: '#F43F5E',
        topics: [
          withSlug('Android Development', 'android-development'),
          leaf('Coding'),
          leaf('Flutter'),
          withSlug('Frontend Engineering', 'frontend-engineering'),
          withSlug('iOS Development', 'ios-development'),
        ],
      },
      {
        label: 'Programming Languages',
        slug: 'dev-languages',
        accentColor: '#22C55E',
        topics: [
          leaf('Angular'),
          withSlug('CSS', 'css'),
          withSlug('HTML', 'html'),
          leaf('Java'),
          withSlug('JavaScript', 'javascript'),
        ],
      },
      {
        label: 'Dev Ops',
        slug: 'dev-ops',
        accentColor: '#0EA5E9',
        topics: [
          withSlug('AWS', 'aws'),
          withSlug('Databricks', 'databricks'),
          withSlug('Docker', 'docker'),
          withSlug('Kubernetes', 'kubernetes'),
          withSlug('Terraform', 'terraform'),
        ],
      },
    ],
    { slug: 'software-development' },
  ),
  section(
    'Media',
    'Storytellers, artists, and digital creators pushing imagination forward.',
    '#F9A8D4',
    '#3B0764',
    [
      {
        label: 'Writing',
        slug: 'media-writing',
        accentColor: '#EA580C',
        topics: [
          withSlug('30 Day Challenge', '30-day-challenge'),
          withSlug('Book Reviews', 'book-reviews'),
          leaf('Books'),
          withSlug('Creative Nonfiction', 'creative-nonfiction'),
          leaf('Diary'),
        ],
      },
      {
        label: 'Art',
        slug: 'media-art',
        accentColor: '#2563EB',
        topics: [
          leaf('Comics'),
          withSlug('Contemporary Art', 'contemporary-art'),
          leaf('Drawing'),
          withSlug('Fine Art', 'fine-art'),
          withSlug('Generative Art', 'generative-art'),
        ],
      },
      {
        label: 'Gaming',
        slug: 'media-gaming',
        accentColor: '#16A34A',
        topics: [
          withSlug('Game Design', 'game-design'),
          withSlug('Game Development', 'game-development'),
          withSlug('Indie Game', 'indie-game'),
          withSlug('Metaverse', 'metaverse'),
          leaf('Nintendo'),
        ],
      },
    ],
    { slug: 'media' },
  ),
  section(
    'Society',
    'Civic pulse checks and cultural critiques grounded in lived experience.',
    '#FDE047',
    '#1C1917',
    [
      {
        label: 'Economics',
        slug: 'society-economics',
        accentColor: '#B91C1C',
        topics: [
          withSlug('Basic Income', 'basic-income'),
          leaf('Debt'),
          leaf('Economy'),
          leaf('Inflation'),
          withSlug('Stock Market', 'stock-market'),
        ],
      },
      {
        label: 'Education',
        slug: 'society-education',
        accentColor: '#7C3AED',
        topics: [
          withSlug('Charter Schools', 'charter-schools'),
          withSlug('Education Reform', 'education-reform'),
          withSlug('Higher Education', 'higher-education'),
          withSlug('PhD', 'phd'),
          withSlug('Public Schools', 'public-schools'),
        ],
      },
      {
        label: 'Equality',
        slug: 'society-equality',
        accentColor: '#0F766E',
        topics: [
          leaf('Disability'),
          leaf('Discrimination'),
          withSlug('Diversity In Tech', 'diversity-in-tech'),
          leaf('Feminism'),
          leaf('Inclusion'),
        ],
      },
    ],
    { slug: 'society' },
  ),
  section(
    'Culture',
    'Big ideas, rituals, and meaning-making across the globe.',
    '#BFDBFE',
    '#111827',
    [
      {
        label: 'Philosophy',
        slug: 'culture-philosophy',
        accentColor: '#9333EA',
        topics: [
          leaf('Atheism'),
          withSlug('Epistemology', 'epistemology'),
          leaf('Ethics'),
          withSlug('Existentialism', 'existentialism'),
          withSlug('Metaphysics', 'metaphysics'),
        ],
      },
      {
        label: 'Religion',
        slug: 'culture-religion',
        accentColor: '#2563EB',
        topics: [
          withSlug('Buddhism', 'buddhism'),
          withSlug('Christianity', 'christianity'),
          withSlug('Hinduism', 'hinduism'),
          withSlug('Islam', 'islam'),
          withSlug('Judaism', 'judaism'),
        ],
      },
      {
        label: 'Spirituality',
        slug: 'culture-spirituality',
        accentColor: '#0EA5E9',
        topics: [
          leaf('Astrology'),
          withSlug('Energy Healing', 'energy-healing'),
          withSlug('Horoscopes', 'horoscopes'),
          withSlug('Mysticism', 'mysticism'),
          leaf('Reiki'),
        ],
      },
    ],
    { slug: 'culture' },
  ),
  section(
    'World',
    'Dispatches from cities, wild places, and the people in motion.',
    '#4ADE80',
    '#064E3B',
    [
      {
        label: 'Cities',
        slug: 'world-cities',
        accentColor: '#EF4444',
        topics: [
          withSlug('Abu Dhabi', 'abu-dhabi'),
          withSlug('Amsterdam', 'amsterdam'),
          withSlug('Athens', 'athens'),
          withSlug('Bangkok', 'bangkok'),
          withSlug('Barcelona', 'barcelona'),
        ],
      },
      {
        label: 'Nature',
        slug: 'world-nature',
        accentColor: '#2563EB',
        topics: [
          leaf('Birding'),
          leaf('Camping'),
          withSlug('Climate Change', 'climate-change'),
          leaf('Conservation'),
          leaf('Hiking'),
        ],
      },
      {
        label: 'Travel',
        slug: 'world-travel',
        accentColor: '#EAB308',
        topics: [
          leaf('Tourism'),
          withSlug('Travel Tips', 'travel-tips'),
          withSlug('Travel Writing', 'travel-writing'),
          leaf('Vacation'),
          leaf('Vanlife'),
        ],
      },
    ],
    { slug: 'world' },
  ),
];

export const standaloneTopics: StandaloneTopic[] = [
  {
    label: 'Politics',
    slug: 'politics',
    quip: 'No politics think pieces yet — the debate prep team clearly hit the snooze button. Draft something or check back soon.',
  },
  {
    label: 'Writing',
    slug: 'writing',
    quip: 'Writing about writing? The meta moment is coming. Bring your best draft or swing back when the muse cooperates.',
  },
  {
    label: 'Data Science',
    slug: 'data-science',
    quip: 'No data science debriefs yet — the analysts are still calibrating their coffee. Crunch numbers later?',
  },
  {
    label: 'Quantum Computing',
    slug: 'quantum-computing',
    quip: 'Quantum insights pending — the qubits are still untangling themselves. Check back once reality collapses properly.',
  },
  {
    label: 'Coding Tutorials',
    slug: 'coding-tutorials',
    quip: 'No coding tutorials yet — apparently the keyboard is still stretching. Tap back later for keystroke wisdom.',
  },
  {
    label: 'Tech Articles',
    slug: 'tech-articles',
    quip: 'No tech articles yet — the editors are probably lost in a gadget unboxing tunnel. Rescue them later.',
  },
  {
    label: 'Reviews',
    slug: 'reviews',
    quip: 'No reviews yet — our critics are still sharpening their snark. Check back when the tea is piping hot.',
  },
  {
    label: 'Video Content',
    slug: 'video-content',
    quip: 'No video content yet — the camera is insisting on another costume change. Return after the makeover.',
  },
  {
    label: 'Gaming',
    slug: 'gaming',
    quip: 'No gaming recaps yet — the controllers are stuck in a dramatic loading screen. Reload again later.',
  },
];

export const navigationLinks: TopicNavigationLink[] = [
  { label: 'Explore topics', anchor: '#top' },
  { label: 'Software Development', anchor: '#software-development' },
  { label: 'Self Improvement', anchor: '#self-improvement' },
  { label: 'Culture', anchor: '#culture' },
  { label: 'World', anchor: '#world' },
  { label: 'Media', anchor: '#media' },
  { label: 'Technology', anchor: '#technology' },
  { label: 'Society', anchor: '#society' },
  { label: 'Work', anchor: '#work' },
  { label: 'Life', anchor: '#life' },
  { label: 'Politics', topicSlug: 'politics' },
  { label: 'Writing', topicSlug: 'writing' },
];

export const recommendedTopics = [
  { label: 'Self Improvement', slug: 'self-improvement' },
  { label: 'Politics', slug: 'politics' },
  { label: 'Writing', slug: 'writing' },
];

export const homeSpotlightTopics = [
  { label: 'Machine Learning', slug: 'machine-learning' },
  { label: 'Data Science', slug: 'data-science' },
  { label: 'Quantum Computing', slug: 'quantum-computing' },
  { label: 'Coding Tutorials', slug: 'coding-tutorials' },
  { label: 'Tech Articles', slug: 'tech-articles' },
  { label: 'Reviews', slug: 'reviews' },
  { label: 'Video Content', slug: 'video-content' },
  { label: 'Gaming', slug: 'gaming' },
];

export interface TopicIndexEntry {
  label: string;
  slug: string;
  type: 'section' | 'cluster' | 'topic' | 'standalone';
  descendantSlugs: string[];
  quip: string;
  parentSlug: string | null;
}

const buildIndexFromSection = (sectionData: TopicSectionData): TopicIndexEntry[] => {
  const entries: TopicIndexEntry[] = [];
  const descendantSlugs = new Set<string>();

  for (const clusterData of sectionData.clusters) {
    const clusterDescendants = new Set<string>();

    for (const topic of clusterData.topics) {
      entries.push({
        label: topic.label,
        slug: topic.slug,
        type: 'topic',
        descendantSlugs: [topic.slug],
        quip: topic.quip ?? defaultQuip(topic.label),
        parentSlug: clusterData.slug,
      });
      clusterDescendants.add(topic.slug);
      descendantSlugs.add(topic.slug);
    }

    entries.push({
      label: clusterData.label,
      slug: clusterData.slug,
      type: 'cluster',
      descendantSlugs: Array.from(clusterDescendants),
      quip: clusterData.quip ?? defaultQuip(clusterData.label),
      parentSlug: sectionData.slug,
    });
  }

  entries.push({
    label: sectionData.title,
    slug: sectionData.slug,
    type: 'section',
    descendantSlugs: Array.from(descendantSlugs),
    quip: sectionData.quip ?? defaultQuip(sectionData.title),
    parentSlug: null,
  });

  return entries;
};

export const topicIndex: Map<string, TopicIndexEntry> = (() => {
  const entries = new Map<string, TopicIndexEntry>();

  for (const sectionEntry of topicSections) {
    for (const entry of buildIndexFromSection(sectionEntry)) {
      entries.set(entry.slug, entry);
    }
  }

  for (const solo of standaloneTopics) {
    entries.set(solo.slug, {
      label: solo.label,
      slug: solo.slug,
      type: 'standalone',
      descendantSlugs: [solo.slug],
      quip: solo.quip ?? defaultQuip(solo.label),
      parentSlug: null,
    });
  }

  return entries;
})();

export const allTopicLeaves: TopicLeafData[] = (() => {
  const leaves: TopicLeafData[] = [];

  for (const sectionEntry of topicSections) {
    for (const clusterData of sectionEntry.clusters) {
      leaves.push(...clusterData.topics);
    }
  }

  leaves.push(...standaloneTopics);

  return leaves;
})();

export const getFallbackMessage = (slug: string) => {
  const entry = topicIndex.get(slug);

  if (!entry) {
    return defaultQuip(slug.replace(/-/g, ' '));
  }

  return entry.quip;
};

export const getDescendantTopicSlugs = (slug: string): string[] => {
  const entry = topicIndex.get(slug);

  if (!entry) {
    return [];
  }

  return entry.descendantSlugs.length > 0 ? entry.descendantSlugs : [entry.slug];
};
