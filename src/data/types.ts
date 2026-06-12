export interface BlogPost {
  id: string
  title: string
  category: string
  author: string
  date: string
  excerpt: string
  content: string
  image: string
  published: boolean
}

export interface Opportunity {
  id: string
  title: string
  sector: string
  type: 'Investment' | 'Partnership' | 'Grant' | 'Joint Venture'
  description: string
  minInvestment: string
  expectedReturns: string
  deadline: string
  status: 'Open' | 'Closed' | 'Coming Soon'
  highlights: string[]
}

export interface Package {
  id: string
  name: string
  price: string
  period: string
  featured: boolean
  features: string[]
}

export interface SiteContent {
  blogPosts: BlogPost[]
  opportunities: Opportunity[]
  packages: Package[]
}
