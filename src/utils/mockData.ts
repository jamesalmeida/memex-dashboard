export type ContentType = 
  // Social Media
  | 'x' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok' | 'reddit' | 'facebook'
  // Development
  | 'github' | 'gitlab' | 'codepen' | 'stackoverflow' | 'devto' | 'npm' | 'documentation'
  // Content & Media
  | 'article' | 'pdf' | 'image' | 'video' | 'audio' | 'presentation'
  // Commerce
  | 'product' | 'amazon' | 'etsy' | 'app'
  // Knowledge
  | 'wikipedia' | 'paper' | 'book' | 'course'
  // Personal
  | 'note' | 'bookmark' | 'recipe' | 'location';

export interface MockItem {
  id: string;
  title: string;
  url?: string;
  content_type: ContentType;
  description?: string;
  thumbnail?: string;
  metadata?: {
    // Common
    author?: string;
    domain?: string;
    tags?: string[];
    
    // Media
    duration?: string;
    file_size?: string;
    page_count?: number;
    
    // Social
    username?: string;
    likes?: number;
    replies?: number;
    retweets?: number;
    views?: number;
    
    // Commerce
    price?: string;
    rating?: number;
    reviews?: number;
    in_stock?: boolean;
    
    // Development
    stars?: number;
    forks?: number;
    language?: string;
    
    // Academic
    citations?: number;
    published_date?: string;
    journal?: string;
  };
  created_at: string;
  space?: string;
}

export const mockItems: MockItem[] = [
  // Social Media - X (formerly Twitter)
  {
    id: '1',
    title: 'Paul Graham on startup advice',
    url: 'https://x.com/paulg/status/1234567890',
    content_type: 'x',
    description: 'The most common mistake startups make is not talking to their users enough. You should be talking to users constantly.',
    thumbnail: 'https://pbs.twimg.com/profile_images/1824002576/pg-railsconf_400x400.jpg',
    metadata: {
      username: '@paulg',
      domain: 'x.com',
      likes: 5420,
      retweets: 1203,
      replies: 89,
      tags: ['startups', 'advice', 'entrepreneurship']
    },
    created_at: '2024-12-06T10:30:00Z',
    space: 'Industry Trends'
  },
  
  // Social Media - YouTube
  {
    id: '2',
    title: 'The Future of AI - Sam Altman TED Talk',
    url: 'https://www.youtube.com/watch?v=example123',
    content_type: 'youtube',
    description: 'OpenAI CEO Sam Altman discusses the transformative potential of artificial intelligence and its implications for society.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
    metadata: {
      author: 'TED',
      domain: 'youtube.com',
      duration: '18:32',
      views: 2500000,
      likes: 98000,
      tags: ['ai', 'technology', 'future']
    },
    created_at: '2024-12-05T15:45:00Z',
    space: 'AI Research'
  },
  
  // Development - GitHub
  {
    id: '3',
    title: 'facebook/react',
    url: 'https://github.com/facebook/react',
    content_type: 'github',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    thumbnail: 'https://opengraph.githubassets.com/react-logo.png',
    metadata: {
      author: 'Facebook',
      domain: 'github.com',
      stars: 215000,
      forks: 45000,
      language: 'JavaScript',
      tags: ['react', 'javascript', 'frontend', 'library']
    },
    created_at: '2024-12-04T09:15:00Z',
    space: 'Frontend Learning'
  },
  
  // Commerce - Amazon Product
  {
    id: '4',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    url: 'https://www.amazon.com/dp/B09XS7JWHH',
    content_type: 'amazon',
    description: 'Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life with quick charging.',
    thumbnail: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg',
    metadata: {
      domain: 'amazon.com',
      price: '$329.99',
      rating: 4.4,
      reviews: 2847,
      in_stock: true,
      tags: ['electronics', 'headphones', 'audio']
    },
    created_at: '2024-12-03T14:20:00Z',
    space: 'Personal Interest'
  },
  
  // Knowledge - Wikipedia
  {
    id: '5',
    title: 'Quantum Computing - Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Quantum_computing',
    content_type: 'wikipedia',
    description: 'Quantum computing is a type of computation that harnesses the phenomena of quantum mechanics to process information.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bloch_sphere.svg/400px-Bloch_sphere.svg.png',
    metadata: {
      domain: 'wikipedia.org',
      tags: ['quantum', 'computing', 'physics', 'technology']
    },
    created_at: '2024-12-02T11:00:00Z',
    space: 'Technical Reading'
  },
  
  // Content - Article
  {
    id: '6',
    title: 'How to Build a Second Brain',
    url: 'https://fortelabs.co/blog/basboverview/',
    content_type: 'article',
    description: 'A comprehensive guide to creating a "second brain" – a trusted system for managing information and ideas.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    metadata: {
      author: 'Tiago Forte',
      domain: 'fortelabs.co',
      tags: ['productivity', 'knowledge-management', 'systems']
    },
    created_at: '2024-12-01T16:30:00Z',
    space: 'Work Notes'
  },
  
  // Social Media - Reddit
  {
    id: '7',
    title: 'I built a tool that automatically organizes your browser tabs using AI',
    url: 'https://www.reddit.com/r/programming/comments/example',
    content_type: 'reddit',
    description: 'A developer shares their open-source project for intelligent tab management using machine learning.',
    thumbnail: 'https://styles.redditmedia.com/t5_2qh0y/styles/communityIcon_lgpu.png',
    metadata: {
      username: 'u/developer123',
      domain: 'reddit.com',
      likes: 3420,
      replies: 156,
      tags: ['programming', 'ai', 'tools']
    },
    created_at: '2024-11-30T13:45:00Z',
    space: 'Frontend Learning'
  },
  
  // Development - StackOverflow
  {
    id: '8',
    title: 'How to center a div?',
    url: 'https://stackoverflow.com/questions/114543',
    content_type: 'stackoverflow',
    description: 'The definitive guide to centering elements in CSS, with multiple approaches and browser compatibility notes.',
    thumbnail: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
    metadata: {
      author: 'css-expert',
      domain: 'stackoverflow.com',
      likes: 5678,
      views: 2100000,
      tags: ['css', 'html', 'layout']
    },
    created_at: '2024-11-29T20:15:00Z',
    space: 'Frontend Learning'
  },
  
  // Commerce - Product
  {
    id: '9',
    title: 'Framework Laptop 13',
    url: 'https://frame.work/products/laptop-diy-13-gen-intel',
    content_type: 'product',
    description: 'The Framework Laptop is a thin, lightweight, high-performance notebook that can be upgraded, customized, and repaired.',
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    metadata: {
      domain: 'frame.work',
      price: '$1,049',
      rating: 4.8,
      reviews: 523,
      tags: ['laptop', 'modular', 'sustainable']
    },
    created_at: '2024-11-28T08:30:00Z',
    space: 'Personal Interest'
  },
  
  // Content - PDF
  {
    id: '10',
    title: 'Attention Is All You Need - Research Paper',
    content_type: 'pdf',
    description: 'The transformer architecture paper that revolutionized natural language processing and machine learning.',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=500&fit=crop',
    metadata: {
      author: 'Vaswani et al.',
      file_size: '2.1 MB',
      page_count: 15,
      citations: 76000,
      tags: ['ai', 'transformers', 'research']
    },
    created_at: '2024-11-27T12:00:00Z',
    space: 'AI Research'
  },
  
  // Personal - Note
  {
    id: '11',
    title: 'Meeting Notes: Q1 2025 Product Roadmap',
    content_type: 'note',
    description: 'Key decisions: 1) Focus on mobile app improvements 2) Launch API v2 3) Implement real-time collaboration features',
    metadata: {
      tags: ['meeting', 'product', 'roadmap', 'planning']
    },
    created_at: '2024-11-26T14:30:00Z',
    space: 'Work Notes'
  },
  
  // Social Media - Instagram
  {
    id: '12',
    title: 'Beautiful minimal workspace setup',
    url: 'https://www.instagram.com/p/example123/',
    content_type: 'instagram',
    description: 'Clean desk setup with natural lighting, plants, and minimal tech accessories.',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    metadata: {
      username: '@minimal.setups',
      domain: 'instagram.com',
      likes: 12500,
      tags: ['workspace', 'minimal', 'design']
    },
    created_at: '2024-11-25T10:00:00Z',
    space: 'Design Inspiration'
  },
  
  // Development - NPM Package
  {
    id: '13',
    title: 'lodash - npm',
    url: 'https://www.npmjs.com/package/lodash',
    content_type: 'npm',
    description: 'A modern JavaScript utility library delivering modularity, performance, & extras.',
    thumbnail: 'https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.svg',
    metadata: {
      author: 'John-David Dalton',
      domain: 'npmjs.com',
      tags: ['javascript', 'utility', 'library']
    },
    created_at: '2024-11-24T09:00:00Z',
    space: 'Frontend Learning'
  },
  
  // Knowledge - Academic Paper
  {
    id: '14',
    title: 'Neural Networks and Deep Learning',
    url: 'https://arxiv.org/abs/1234.5678',
    content_type: 'paper',
    description: 'A comprehensive survey of deep learning techniques and their applications in computer vision.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    metadata: {
      author: 'LeCun, Bengio, Hinton',
      journal: 'Nature',
      published_date: '2015-05-27',
      citations: 32000,
      tags: ['deep-learning', 'ai', 'computer-vision']
    },
    created_at: '2024-11-23T15:30:00Z',
    space: 'AI Research'
  },
  
  // Commerce - Etsy
  {
    id: '15',
    title: 'Handmade Leather Journal',
    url: 'https://www.etsy.com/listing/123456789',
    content_type: 'etsy',
    description: 'Personalized leather journal with hand-stitched binding and recycled paper.',
    thumbnail: 'https://images.unsplash.com/photo-1544816565-92b13f5c2b15?w=400&h=300&fit=crop',
    metadata: {
      domain: 'etsy.com',
      price: '$45.00',
      rating: 5.0,
      reviews: 234,
      tags: ['journal', 'leather', 'handmade']
    },
    created_at: '2024-11-22T11:00:00Z',
    space: 'Personal Interest'
  },
  
  // Content - Audio/Podcast
  {
    id: '16',
    title: 'The Tim Ferriss Show - Derek Sivers',
    url: 'https://tim.blog/2024/01/01/derek-sivers/',
    content_type: 'audio',
    description: 'Derek Sivers on developing confidence, finding happiness, and the value of idleness.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=200&fit=crop',
    metadata: {
      author: 'Tim Ferriss',
      domain: 'tim.blog',
      duration: '2:14:33',
      tags: ['podcast', 'interview', 'entrepreneurship']
    },
    created_at: '2024-11-21T08:00:00Z',
    space: 'Personal Interest'
  },
  
  // Knowledge - Course
  {
    id: '17',
    title: 'CS50: Introduction to Computer Science',
    url: 'https://cs50.harvard.edu',
    content_type: 'course',
    description: 'Harvard\'s introduction to computer science and programming for majors and non-majors alike.',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
    metadata: {
      author: 'David J. Malan',
      domain: 'harvard.edu',
      duration: '12 weeks',
      tags: ['education', 'programming', 'computer-science']
    },
    created_at: '2024-11-20T14:00:00Z',
    space: 'Frontend Learning'
  },
  
  // Personal - Recipe
  {
    id: '18',
    title: 'Homemade Sourdough Bread Recipe',
    url: 'https://www.kingarthurbaking.com/recipes/sourdough',
    content_type: 'recipe',
    description: 'A beginner-friendly sourdough bread recipe with step-by-step instructions and tips.',
    thumbnail: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop',
    metadata: {
      author: 'King Arthur Baking',
      domain: 'kingarthurbaking.com',
      duration: '24 hours',
      tags: ['baking', 'sourdough', 'recipe']
    },
    created_at: '2024-11-19T16:00:00Z',
    space: 'Personal Interest'
  },
  
  // Development - Documentation
  {
    id: '19',
    title: 'React Documentation - Hooks',
    url: 'https://react.dev/reference/react',
    content_type: 'documentation',
    description: 'Official React documentation covering the Hooks API and best practices.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    metadata: {
      domain: 'react.dev',
      tags: ['react', 'hooks', 'documentation', 'reference']
    },
    created_at: '2024-11-18T10:30:00Z',
    space: 'Frontend Learning'
  },
  
  // Social Media - LinkedIn
  {
    id: '20',
    title: 'Satya Nadella on the future of work',
    url: 'https://www.linkedin.com/posts/satyanadella',
    content_type: 'linkedin',
    description: 'Microsoft CEO shares insights on AI integration in the workplace and the importance of continuous learning.',
    thumbnail: 'https://media.licdn.com/dms/image/satya-profile.jpg',
    metadata: {
      username: 'Satya Nadella',
      domain: 'linkedin.com',
      likes: 45000,
      replies: 892,
      tags: ['leadership', 'ai', 'future-of-work']
    },
    created_at: '2024-11-17T12:00:00Z',
    space: 'Industry Trends'
  }
];

export interface MockSpace {
  id: string;
  name: string;
  color: string;
  count: number;
  description?: string;
}

export const mockSpaces: MockSpace[] = [
  { id: 'frontend-learning', name: 'Frontend Learning', color: '#3B82F6', count: 2, description: 'Web development tutorials and guides' },
  { id: 'ai-research', name: 'AI Research', color: '#8B5CF6', count: 1, description: 'Artificial intelligence articles and videos' },
  { id: 'design-inspiration', name: 'Design Inspiration', color: '#10B981', count: 2, description: 'Creative design ideas and examples' },
  { id: 'technical-reading', name: 'Technical Reading', color: '#F59E0B', count: 2, description: 'Technical documentation and papers' },
  { id: 'work-notes', name: 'Work Notes', color: '#EF4444', count: 1, description: 'Meeting notes and work-related content' },
  { id: 'industry-trends', name: 'Industry Trends', color: '#6366F1', count: 1, description: 'Latest industry news and trends' },
  { id: 'personal-interest', name: 'Personal Interest', color: '#84CC16', count: 1, description: 'Personal hobbies and interests' }
];