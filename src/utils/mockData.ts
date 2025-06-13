export interface MockItem {
  id: string;
  title: string;
  url?: string;
  content_type: 'link' | 'image' | 'video' | 'pdf' | 'text' | 'tweet';
  description?: string;
  thumbnail?: string;
  metadata?: {
    author?: string;
    domain?: string;
    duration?: string;
    file_size?: string;
    page_count?: number;
    tags?: string[];
  };
  created_at: string;
  project?: string;
}

export const mockItems: MockItem[] = [
  {
    id: '1',
    title: 'Building Better Web Components',
    url: 'https://web.dev/building-better-web-components',
    content_type: 'link',
    description: 'A comprehensive guide to creating reusable, accessible web components with modern best practices.',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
    metadata: {
      author: 'Google Developers',
      domain: 'web.dev',
      tags: ['web-development', 'components', 'javascript']
    },
    created_at: '2024-12-06T10:30:00Z',
    project: 'Frontend Learning'
  },
  {
    id: '2',
    title: 'The Future of AI in Design',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content_type: 'video',
    description: 'An insightful discussion about how AI is transforming the design industry and what it means for creators.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
    metadata: {
      author: 'Design Weekly',
      domain: 'youtube.com',
      duration: '24:15',
      tags: ['ai', 'design', 'future-tech']
    },
    created_at: '2024-12-05T15:45:00Z',
    project: 'AI Research'
  },
  {
    id: '3',
    title: 'Abstract Architecture Photography',
    url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586',
    content_type: 'image',
    description: 'Stunning minimalist architecture with clean lines and geometric patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=600&fit=crop',
    metadata: {
      author: 'Unsplash Photographer',
      domain: 'unsplash.com',
      tags: ['architecture', 'minimalism', 'photography']
    },
    created_at: '2024-12-04T09:15:00Z',
    project: 'Design Inspiration'
  },
  {
    id: '4',
    title: 'The Art of Problem Solving in Software Development',
    content_type: 'pdf',
    description: 'A comprehensive whitepaper on systematic approaches to debugging and architectural decisions.',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=500&fit=crop',
    metadata: {
      author: 'Tech Publications',
      file_size: '2.4 MB',
      page_count: 47,
      tags: ['programming', 'problem-solving', 'architecture']
    },
    created_at: '2024-12-03T14:20:00Z',
    project: 'Technical Reading'
  },
  {
    id: '5',
    title: 'Quick note: Meeting with design team about new feature concepts and user flow improvements',
    content_type: 'text',
    description: 'Notes from our weekly design sync covering the new dashboard layout and user onboarding process.',
    metadata: {
      tags: ['meetings', 'design', 'notes']
    },
    created_at: '2024-12-02T11:00:00Z',
    project: 'Work Notes'
  },
  {
    id: '6',
    title: 'Thread about the future of web development',
    url: 'https://twitter.com/user/status/123456789',
    content_type: 'tweet',
    description: 'Interesting Twitter thread discussing emerging trends in web development, from server components to edge computing.',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    metadata: {
      author: '@webdev_expert',
      domain: 'twitter.com',
      tags: ['web-development', 'trends', 'discussion']
    },
    created_at: '2024-12-01T16:30:00Z',
    project: 'Industry Trends'
  },
  {
    id: '7',
    title: 'Advanced TypeScript Patterns',
    url: 'https://example.com/advanced-typescript',
    content_type: 'link',
    description: 'Deep dive into advanced TypeScript patterns including conditional types, mapped types, and template literal types.',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
    metadata: {
      author: 'TypeScript Weekly',
      domain: 'example.com',
      tags: ['typescript', 'programming', 'advanced']
    },
    created_at: '2024-11-30T13:45:00Z',
    project: 'Frontend Learning'
  },
  {
    id: '8',
    title: 'Nature Documentary: Ocean Depths',
    url: 'https://vimeo.com/123456789',
    content_type: 'video',
    description: 'Breathtaking footage of deep sea creatures and underwater ecosystems.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop',
    metadata: {
      author: 'Nature Films',
      domain: 'vimeo.com',
      duration: '52:30',
      tags: ['nature', 'documentary', 'ocean']
    },
    created_at: '2024-11-29T20:15:00Z',
    project: 'Personal Interest'
  },
  {
    id: '9',
    title: 'Minimalist Workspace Setup',
    url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07',
    content_type: 'image',
    description: 'Clean, organized desk setup with plants and natural lighting.',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    metadata: {
      author: 'Workspace Designer',
      domain: 'unsplash.com',
      tags: ['workspace', 'minimalism', 'productivity']
    },
    created_at: '2024-11-28T08:30:00Z',
    project: 'Design Inspiration'
  },
  {
    id: '10',
    title: 'Database Design Principles',
    content_type: 'pdf',
    description: 'Essential guide to relational database design, normalization, and query optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
    metadata: {
      author: 'Database Systems Inc.',
      file_size: '5.2 MB',
      page_count: 89,
      tags: ['database', 'design', 'sql']
    },
    created_at: '2024-11-27T12:00:00Z',
    project: 'Technical Reading'
  }
];

export const mockProjects = [
  { id: 'frontend-learning', name: 'Frontend Learning', color: '#3B82F6', count: 2 },
  { id: 'ai-research', name: 'AI Research', color: '#8B5CF6', count: 1 },
  { id: 'design-inspiration', name: 'Design Inspiration', color: '#10B981', count: 2 },
  { id: 'technical-reading', name: 'Technical Reading', color: '#F59E0B', count: 2 },
  { id: 'work-notes', name: 'Work Notes', color: '#EF4444', count: 1 },
  { id: 'industry-trends', name: 'Industry Trends', color: '#6366F1', count: 1 },
  { id: 'personal-interest', name: 'Personal Interest', color: '#84CC16', count: 1 }
];