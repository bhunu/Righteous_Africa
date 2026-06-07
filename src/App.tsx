import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import './App.css'
import BlogSection from './components/BlogSection'
import OpportunitiesSection from './components/OpportunitiesSection'
import AdminPanel from './components/AdminPanel'
import type { SiteContent } from './data/types'

// ─── DATA ────────────────────────────────────────────────────────────────────

interface NavChild { label: string; href: string; desc?: string }
interface NavGroup  { label: string; href?: string; wide?: boolean; children?: NavChild[] }

const NAV_LINKS: NavGroup[] = [
  {
    label: 'Company',
    children: [
      { label: 'About RAE',         href: '#about',   desc: 'Our story, vision & mission'      },
      { label: 'Leadership Team',   href: '#team',    desc: 'Meet our expert advisors'          },
      { label: 'Sectors We Serve',  href: '#sectors', desc: 'Industries we work across'         },
    ],
  },
  {
    label: 'Services',
    wide: true,
    children: [
      { label: 'Business Incubation',       href: '#services', desc: 'Idea to investor-ready'         },
      { label: 'Accounting & Bookkeeping',  href: '#services', desc: 'Financial clarity & compliance' },
      { label: 'Company Registration',      href: '#services', desc: 'Fast-track legal setup'         },
      { label: 'Business Planning',         href: '#services', desc: 'Investor-grade plans'           },
      { label: 'Financial Modeling',        href: '#services', desc: 'Data-driven projections'        },
      { label: 'Investor Readiness',        href: '#services', desc: 'Pitch decks & due diligence'   },
      { label: 'Venture Capital',           href: '#services', desc: 'Connect with funders'           },
      { label: 'Export Development',        href: '#services', desc: 'Access global markets'          },
      { label: 'SME Advisory',              href: '#services', desc: 'Strategic business guidance'    },
    ],
  },
  {
    label: 'Diaspora',
    children: [
      { label: 'Invest Back Home',  href: '#diaspora-overview',  desc: 'For Africans living abroad'  },
      { label: 'Diaspora Services', href: '#diaspora-services',  desc: 'Managed remotely, anywhere'  },
      { label: 'Why Choose RAE',    href: '#diaspora-why',       desc: 'Trusted by diaspora clients' },
    ],
  },
  {
    label: 'Invest',
    children: [
      { label: 'Packages & Pricing', href: '#packages',      desc: 'Transparent, structured pricing' },
      { label: 'Live Opportunities', href: '#opportunities', desc: 'Vetted investment deals'          },
    ],
  },
  {
    label: 'Insights',
    children: [
      { label: 'Blog & Articles',      href: '#blog',          desc: 'Expert perspectives & ideas' },
      { label: 'Market Opportunities', href: '#opportunities', desc: 'Where your capital can grow' },
    ],
  },
  { label: 'Contact', href: '#contact' },
]

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    head: "Building Africa's",
    accent: 'Next Generation',
    tail: 'of Enterprises',
    sub: 'SME Finance, Growth and Advisory Firm dedicated to transforming African entrepreneurship',
  },
  {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    head: 'Empowering Ideas.',
    accent: 'Funding Growth.',
    tail: 'Building Legacies.',
    sub: 'Connecting visionary entrepreneurs with capital, strategy, and the networks they need to succeed',
  },
  {
    img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1920&q=80',
    head: 'Strategic Advisory',
    accent: 'for Bold',
    tail: 'African Ventures',
    sub: 'From ideation to investor-ready — we guide every stage of your entrepreneurial journey',
  },
]

const STATS = [
  { value: '500+',       label: 'Entrepreneurs Supported' },
  { value: '8',          label: 'Core Service Areas'       },
  { value: '$2M+',       label: 'Capital Facilitated'      },
  { value: '360°',       label: 'Business Support'         },
]

const SERVICES = [
  { id: 'incubation',   title: 'Business Incubation',          desc: 'End-to-end support to transform raw ideas into viable, investor-ready businesses through mentorship and proven strategic frameworks.' },
  { id: 'accounting',   title: 'Accounting & Bookkeeping',      desc: 'Professional financial record-keeping, ZIMRA compliance, and reporting that gives you complete clarity over your business finances.' },
  { id: 'registration', title: 'Company Registration',          desc: 'Fast-track business registration across Zimbabwe and African jurisdictions, building the legal credibility your venture needs.' },
  { id: 'planning',     title: 'Business Planning',             desc: 'Comprehensive, investor-grade business plans that define your vision, strategy, and competitive advantage with precision.' },
  { id: 'modeling',     title: 'Financial Modeling',            desc: 'Data-driven financial projections that answer critical growth questions and demonstrate your business economics to investors.' },
  { id: 'investor',     title: 'Investor Readiness',            desc: 'Pitch decks, due diligence packages, and valuation frameworks that ensure your strongest impression on potential funders.' },
  { id: 'vc',           title: 'Venture Capital Facilitation',  desc: 'We bridge the gap between ambitious African businesses and the right investors, facilitating connections that unlock growth.' },
  { id: 'export',       title: 'Export Market Development',     desc: 'Strategic market entry for regional and international expansion, helping African businesses compete on the global stage.' },
  { id: 'sme',          title: 'SME Advisory',                  desc: 'Dedicated advisory sessions addressing your specific business challenges and setting a clear path for sustainable growth.' },
]

const SERVICE_ICONS: Record<string, ReactNode> = {
  incubation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  accounting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
      <line x1="9" y1="15" x2="12" y2="15"/>
    </svg>
  ),
  registration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  planning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  modeling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
  investor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  vc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8"  y1="12" x2="16" y2="12"/>
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  sme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
}

const PACKAGES = [
  {
    name: 'Just Start Pack',
    price: '$220',
    period: 'Once Off',
    featured: false,
    features: [
      'Company profile + reviews',
      'Logo design + revisions',
      'Email registration',
      'Business chip card',
      '2 startup receipt books',
    ],
  },
  {
    name: 'Startup Package',
    price: '$250',
    period: '/ Month',
    featured: false,
    features: [
      'Basic accounting',
      'ZIMRA compliance reminders & support',
      'Payroll support',
      'Monthly management accounts',
    ],
  },
  {
    name: 'SME Growth Package',
    price: '$400',
    period: '/ Month',
    featured: true,
    features: [
      'Accounting',
      'Tax advisory',
      'Cash flow forecasting',
      'Budgeting',
      'Business advisory meetings',
      'Monthly reports',
    ],
  },
  {
    name: 'Corporate Finance',
    price: '$1,000',
    period: '/ Month',
    featured: false,
    features: [
      'Accounting',
      'Financial modeling',
      'Investor readiness',
      'Fundraising support',
      'Board reporting',
      'Expansion strategy',
      'Monthly reports',
    ],
  },
]

const SECTORS = [
  'Agribusiness', 'Medical Enterprises', 'Export Ventures', 'Technology',
  'Renewable Energy', 'Fuel & Petroleum', 'Women-Led Businesses', 'Youth Entrepreneurs',
  'Manufacturing', 'Real Estate', 'Retail & FMCG', 'Financial Services',
]

const TEAM = [
  {
    name: 'Tendai Moyo',
    role: 'Founder & Chief Executive Officer',
    bio: 'Seasoned enterprise development specialist with 15+ years guiding African ventures from concept to capital.',
    img: 'https://images.unsplash.com/photo-1495603889488-42d1d66e5523?auto=format&fit=crop&w=400&h=480&q=80',
  },
  {
    name: 'Rudo Chikwanda',
    role: 'Chief Financial Officer',
    bio: 'CPA with extensive experience in financial modeling, investor readiness, and cross-border transactions.',
    img: 'https://images.unsplash.com/photo-1573497620013-7f7660da1a48?auto=format&fit=crop&w=400&h=480&q=80',
  },
  {
    name: 'Farai Mutasa',
    role: 'Head of Business Advisory',
    bio: 'Strategic advisor with a proven track record of scaling startups across Southern and East Africa.',
    img: 'https://images.unsplash.com/photo-1589114207353-1fc98a11070b?auto=format&fit=crop&w=400&h=480&q=80',
  },
  {
    name: 'Ngozi Adeyemi',
    role: 'Director, Investor Relations',
    bio: 'Former investment banker with deep networks across Pan-African capital markets and diaspora investors.',
    img: 'https://images.unsplash.com/photo-1636144896336-b056be4a8dfe?auto=format&fit=crop&w=400&h=480&q=80',
  },
  {
    name: 'Sibusiso Dlamini',
    role: 'Head of Market Development',
    bio: 'Export specialist helping African SMEs access transformative regional and international opportunities.',
    img: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=400&h=480&q=80',
  },
  {
    name: 'Amara Osei',
    role: 'Senior Business Analyst',
    bio: 'Data-driven analyst specialising in financial due diligence and business performance optimisation.',
    img: 'https://images.unsplash.com/photo-1573497619951-6c9477fb83b4?auto=format&fit=crop&w=400&h=480&q=80',
  },
]

// ─── DIASPORA DATA ────────────────────────────────────────────────────────────

const DIASPORA_SERVICES = [
  { id: 'dreg',    title: 'Company Registration & Business Setup',   desc: 'Full business registration across Zimbabwe and African jurisdictions — handled remotely, wherever you are in the world.' },
  { id: 'dacc',    title: 'Accounting & Bookkeeping Services',        desc: 'Professional financial record-keeping, ZIMRA compliance, and transparent monthly reporting you can review from any timezone.' },
  { id: 'dtax',    title: 'Tax & Compliance Advisory',                desc: 'Stay fully compliant with local regulations. We handle ZIMRA submissions, returns, and statutory requirements on your behalf.' },
  { id: 'dinv',    title: 'Investment Structuring & Venture Support', desc: 'We structure your diaspora capital into safe, compliant investment vehicles aligned with your goals and risk profile.' },
  { id: 'dagri',   title: 'Agribusiness & Export Consulting',         desc: 'End-to-end support for agricultural ventures — from land identification and input sourcing to export market access.' },
  { id: 'dplan',   title: 'Business Plans & Feasibility Studies',     desc: 'Rigorous, investor-grade business plans and feasibility reports to validate opportunities before you commit capital.' },
  { id: 'dmarket', title: 'Market Research & Opportunity Sourcing',   desc: 'On-the-ground intelligence and curated opportunity reports so you invest with verified facts — not assumptions.' },
  { id: 'ddue',    title: 'Property & Project Due Diligence',         desc: 'Independent verification and risk assessment of real estate, projects, and partners before you make any commitment.' },
  { id: 'dsme',    title: 'SME Growth & Financial Advisory',          desc: 'Strategic financial guidance to grow your Zimbabwe-based business with professional accountability and board-level reporting.' },
]

const DIASPORA_ICONS: Record<string, ReactNode> = {
  dreg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  dacc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9"  x2="8" y2="9"/>
    </svg>
  ),
  dtax: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  dinv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5"  r="2"/>
      <circle cx="5"  cy="19" r="2"/>
      <circle cx="19" cy="19" r="2"/>
      <line x1="12" y1="7" x2="5"  y2="17"/>
      <line x1="12" y1="7" x2="19" y2="17"/>
      <line x1="5"  y1="19" x2="19" y2="19"/>
    </svg>
  ),
  dagri: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 22"/>
      <path d="M9.1 6.4C12 5.8 17.7 8 22 2c-3 4.3-8.6 6.8-12.9 4.4z"/>
    </svg>
  ),
  dplan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="9" y1="7"  x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
      <line x1="9" y1="15" x2="12" y2="15"/>
    </svg>
  ),
  dmarket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <polyline points="8 11 10 13 14 9"/>
    </svg>
  ),
  ddue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  dsme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
}

const DIASPORA_WHY = [
  { title: 'Trusted Professionals',     desc: 'Zimbabwe-based business professionals with verifiable track records and real, on-the-ground accountability.' },
  { title: 'Transparent Reporting',     desc: 'Regular, detailed reports so you always know exactly how your capital and investments are performing.' },
  { title: 'Local Market Intelligence', desc: 'Deep, on-the-ground knowledge of Zimbabwe and African markets that no remote analyst can replicate.' },
  { title: 'Remote-First Support',      desc: 'All services fully accessible from the UK, USA, Canada, UAE, South Africa, and beyond — built for the diaspora.' },
  { title: 'Strong African Networks',   desc: 'Established connections across agriculture, finance, trade, and SME sectors spanning the continent.' },
]

const DIASPORA_OPPS = [
  { title: 'Fresh Produce Export Projects',      desc: "Access Zimbabwe's fertile agricultural sector and fast-growing regional export markets with expert structuring." },
  { title: 'Poultry & Agribusiness Investments', desc: 'Scalable agribusiness opportunities with strong local demand, consistent returns, and export potential.' },
  { title: 'Energy & Petroleum Opportunities',   desc: "Participate in Zimbabwe's expanding renewable energy and fuel distribution sector with vetted partners." },
  { title: 'SME Expansion & Partnerships',       desc: 'Co-invest in established, growth-ready SMEs seeking diaspora capital to reach their next level.' },
  { title: 'Venture Capital & Startup Support',  desc: "Back Africa's next generation of innovative startups through our expert deal-sourcing and due diligence." },
  { title: 'Trade Facilitation Across Africa',   desc: 'Leverage pan-African trade corridors and regional market opportunities with our established networks.' },
]

const DIASPORA_OPP_ICONS: ReactNode[] = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M9.1 6.4C12 5.8 17.7 8 22 2c-3 4.3-8.6 6.8-12.9 4.4z"/></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
]

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function LogoMark({ size = 38 }: { size?: number }) {
  const h = Math.round(size * 0.78)
  return (
    <svg width={size} height={h} viewBox="0 0 46 36" fill="none" aria-hidden="true">
      <path d="M2 33L14 4L26 33"  stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 33L32 4L44 33" stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 33L23 9L35 33" stroke="#0A0A0A" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round" opacity="0.82"/>
    </svg>
  )
}

function Check() {
  return (
    <svg className="chk" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <div className="rae-tag">{children}</div>
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4l4 4 4-4" />
    </svg>
  )
}

function Navbar() {
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [activeDD,       setActiveDD]       = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDD(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const closeMobile = () => { setMobileOpen(false); setMobileExpanded(null) }

  return (
    <header ref={headerRef} className={`navbar${scrolled ? ' navbar--on' : ''}`}>
      <div className="navbar-inner">

        {/* Logo */}
        <a href="#" className="nav-logo" onClick={closeMobile}>
          <LogoMark size={38} />
          <div className="nav-logo-copy">
            <span className="nav-logo-name">Righteous African</span>
            <span className="nav-logo-sub">Equities</span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {NAV_LINKS.map(link =>
            link.children ? (
              <div
                key={link.label}
                className="nav-dd-wrap"
                onMouseEnter={() => setActiveDD(link.label)}
                onMouseLeave={() => setActiveDD(null)}
              >
                <button
                  className={`nav-item nav-item--dd${activeDD === link.label ? ' nav-item--open' : ''}`}
                  onClick={() => setActiveDD(p => p === link.label ? null : link.label)}
                  aria-expanded={activeDD === link.label}
                >
                  {link.label}
                  <Chevron />
                </button>

                <div className={`nav-dd${link.wide ? ' nav-dd--wide' : ''}${activeDD === link.label ? ' nav-dd--show' : ''}`}>
                  <div className={`nav-dd-inner${link.wide ? ' nav-dd-inner--grid' : ''}`}>
                    {link.children.map(child => (
                      <a key={child.label} href={child.href} className="nav-dd-item"
                        onClick={() => setActiveDD(null)}>
                        <span className="nav-dd-lbl">{child.label}</span>
                        {child.desc && <span className="nav-dd-desc">{child.desc}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a key={link.label} href={link.href} className="nav-item"
                onClick={() => setActiveDD(null)}>
                {link.label}
              </a>
            )
          )}
        </nav>

        <a href="#contact" className="nav-cta" onClick={closeMobile}>Get Started</a>

        <button
          className={`nav-burger${mobileOpen ? ' nav-burger--x' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="nav-mobile">
          {NAV_LINKS.map(link =>
            link.children ? (
              <div key={link.label} className="nav-m-group">
                <button
                  className={`nav-m-item nav-m-item--dd${mobileExpanded === link.label ? ' nav-m-item--open' : ''}`}
                  onClick={() => setMobileExpanded(p => p === link.label ? null : link.label)}
                >
                  {link.label}
                  <Chevron />
                </button>
                {mobileExpanded === link.label && (
                  <div className="nav-m-sub">
                    {link.children.map(child => (
                      <a key={child.label} href={child.href} className="nav-m-sub-item"
                        onClick={closeMobile}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={link.label} href={link.href} className="nav-m-item" onClick={closeMobile}>
                {link.label}
              </a>
            )
          )}
          <a href="#contact" className="nav-m-cta" onClick={closeMobile}>Get Started</a>
        </nav>
      )}
    </header>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [idx, setIdx]     = useState(0)
  const [out, setOut]     = useState(false)

  const goTo = useCallback((i: number) => {
    setOut(true)
    setTimeout(() => { setIdx(i); setOut(false) }, 380)
  }, [])

  const next = useCallback(() => goTo((idx + 1) % SLIDES.length), [idx, goTo])
  const prev = () => goTo((idx - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [next])

  const s = SLIDES[idx]

  return (
    <section className="hero">
      <div className={`hero-bg${out ? ' hero-bg--fade' : ''}`} style={{ backgroundImage: `url(${s.img})` }} />
      <div className="hero-veil" />

      <div className="hero-body">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-eyebrow">SME Finance · Growth · Advisory</div>
            <h1 className="hero-h1">
              {s.head}<br />
              <span className="hero-accent">{s.accent}</span><br />
              {s.tail}
            </h1>
            <p className="hero-sub">{s.sub}</p>
            <div className="hero-btns">
              <a href="#services" className="btn-hero-solid">Explore Services</a>
              <a href="#packages" className="btn-hero-ghost">View Packages</a>
            </div>
          </div>
        </div>
      </div>

      <button className="hero-arr hero-arr--l" onClick={prev} aria-label="Previous slide">&#8249;</button>
      <button className="hero-arr hero-arr--r" onClick={next} aria-label="Next slide">&#8250;</button>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === idx ? ' hero-dot--on' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const EMPTY_CONTENT: SiteContent = { blogPosts: [], opportunities: [] }

export default function App() {
  const [siteContent, setSiteContent] = useState<SiteContent>(EMPTY_CONTENT)
  const [adminMode, setAdminMode] = useState(false)

  useEffect(() => {
    const local = localStorage.getItem('rae:content')
    if (local) {
      try { setSiteContent(JSON.parse(local)); return } catch {}
    }
    fetch(`${import.meta.env.BASE_URL}data/content.json`)
      .then(r => r.json())
      .then(setSiteContent)
      .catch(() => {})
  }, [])

  if (adminMode) {
    return (
      <AdminPanel
        content={siteContent}
        onContentChange={setSiteContent}
        onExit={() => setAdminMode(false)}
      />
    )
  }

  return (
    <div className="site">
      <Navbar />
      <Hero />

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        {STATS.map((s, i) => (
          <div key={i} className="stats-cell">
            <div className="stats-val">{s.value}</div>
            <div className="stats-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="sec">
        <div className="container">
          <div className="about-layout">
            <div className="about-visual">
              <img
                src="https://images.unsplash.com/photo-1573497701240-345a300b8d36?auto=format&fit=crop&w=800&q=80"
                alt="RAE business advisory"
                className="about-img"
              />
              <div className="about-badge">
                <span className="about-badge-n">10+</span>
                <span className="about-badge-t">Years of Excellence</span>
              </div>
            </div>

            <div className="about-copy">
              <Tag>Who We Are</Tag>
              <h2 className="rae-h2">An Enterprise Development &amp; Venture Support Platform</h2>
              <p className="rae-p">
                Righteous African Equities (RAE) is a business advisory and startup incubation firm dedicated to empowering entrepreneurs, startups, SMEs, and high-growth ventures across Africa.
              </p>
              <p className="rae-p">
                We bridge the gap between ideas and successful enterprises — providing strategic guidance, financial expertise, operational support, and investor connections that businesses need to survive, grow, and scale sustainably.
              </p>
              <div className="pillars">
                <div className="pillar">
                  <div className="pillar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <div>
                    <h4>Our Vision</h4>
                    <p>To become one of Africa's leading enterprise development organizations, building businesses that create lasting generational legacies.</p>
                  </div>
                </div>
                <div className="pillar">
                  <div className="pillar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h4>Our Mission</h4>
                    <p>To transform innovative African ideas into scalable, sustainable enterprises that create lasting economic impact across the continent.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="sec sec--gray">
        <div className="container">
          <div className="sec-hd">
            <Tag>What We Offer</Tag>
            <h2 className="rae-h2">Comprehensive Business Services</h2>
            <p className="sec-lead">From inception to global expansion — we support every stage of your entrepreneurial journey.</p>
          </div>
          <div className="srv-grid">
            {SERVICES.map(s => (
              <div key={s.id} className="srv-card">
                <div className="srv-icon">{SERVICE_ICONS[s.id]}</div>
                <h3 className="srv-title">{s.title}</h3>
                <p className="srv-desc">{s.desc}</p>
                <span className="srv-more">
                  Learn more
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M3 8h10M8 3l5 5-5 5"/></svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANY SETUP OFFER ── */}
      <div className="offer">
        <div className="container">
          <div className="offer-inner">
            <div className="offer-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="offer-copy">
              <h3>Company Setup in Zimbabwe</h3>
              <p>Get fully registered &amp; compliant — ZIG &amp; USD payments accepted</p>
              <div className="offer-chips">
                <span>✓ Company registration</span>
                <span>✓ Free website</span>
                <span>✓ Free tax clearance certificate</span>
              </div>
            </div>
            <div className="offer-price-col">
              <div className="offer-price">
                <span className="offer-amt">$250</span>
                <span className="offer-per">Once Off</span>
              </div>
              <a href="#contact" className="offer-btn">Get Started</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIASPORA ── */}
      <section id="diaspora" className="dsp-section">

        <div id="diaspora-overview" className="dsp-banner">
          <div className="container">
            <div className="dsp-banner-inner">
              <div className="dsp-banner-copy">
                <div className="dsp-eyebrow">Diaspora Investment &amp; Business Solutions</div>
                <h2 className="dsp-h2">
                  Invest Back Home<br />
                  <span className="dsp-accent">With Confidence</span>
                </h2>
                <p className="dsp-sub">
                  We help Africans in the diaspora build, invest, and grow businesses back home — safely, professionally, and with full accountability. Whether you're in the UK, USA, Canada, Australia, UAE, or Europe, we're your trusted partner on the ground.
                </p>
                <div className="dsp-countries">
                  {['UK', 'USA', 'Canada', 'Australia', 'UAE', 'South Africa', 'Europe'].map(c => (
                    <span key={c} className="dsp-chip">{c}</span>
                  ))}
                </div>
                <a href="#contact" className="dsp-banner-btn">Book a Consultation</a>
              </div>
              <div className="dsp-visual">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                  alt="African professionals collaborating"
                  className="dsp-visual-img"
                />
                <div className="dsp-metrics">
                  {[
                    { value: '7+',   label: 'Countries Served' },
                    { value: '100%', label: 'Remote Capable'   },
                    { value: '9',    label: 'Core Services'    },
                    { value: '10+',  label: 'Years Experience' },
                  ].map((m, i) => (
                    <div key={i} className="dsp-metric">
                      <span className="dsp-metric-val">{m.value}</span>
                      <span className="dsp-metric-lbl">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="diaspora-services" className="sec sec--gray">
          <div className="container">
            <div className="sec-hd">
              <Tag>What We Do</Tag>
              <h2 className="rae-h2">End-to-End Diaspora Services</h2>
              <p className="sec-lead">From business registration to investment structuring — everything managed professionally, wherever you are in the world.</p>
            </div>
            <div className="srv-grid">
              {DIASPORA_SERVICES.map(s => (
                <div key={s.id} className="srv-card">
                  <div className="srv-icon">{DIASPORA_ICONS[s.id]}</div>
                  <h3 className="srv-title">{s.title}</h3>
                  <p className="srv-desc">{s.desc}</p>
                  <span className="srv-more">
                    Enquire now
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M3 8h10M8 3l5 5-5 5"/></svg>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="diaspora-why" className="dsp-why">
          <div className="container">
            <div className="sec-hd">
              <Tag>Why Diaspora Clients Choose Us</Tag>
              <h2 className="rae-h2">Built for Africans Abroad</h2>
              <p className="sec-lead">Five reasons the diaspora trusts Righteous African Equities to manage their investments back home.</p>
            </div>
            <div className="dsp-why-grid">
              {DIASPORA_WHY.map((w, i) => (
                <div key={i} className="dsp-why-card">
                  <div className="dsp-why-num">0{i + 1}</div>
                  <h4 className="dsp-why-title">{w.title}</h4>
                  <p className="dsp-why-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sec sec--gray">
          <div className="container">
            <div className="sec-hd">
              <Tag>Opportunities We Facilitate</Tag>
              <h2 className="rae-h2">Where Your Capital Can Grow</h2>
              <p className="sec-lead">Curated investment opportunities across Zimbabwe and the broader African market — sourced, vetted, and structured by our team.</p>
            </div>
            <div className="dsp-opp-grid">
              {DIASPORA_OPPS.map((o, i) => (
                <div key={i} className="dsp-opp-card">
                  <div className="dsp-opp-icon">{DIASPORA_OPP_ICONS[i]}</div>
                  <h4 className="dsp-opp-title">{o.title}</h4>
                  <p className="dsp-opp-desc">{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dsp-quote">
          <div className="container">
            <blockquote className="dsp-quote-text">"Connecting Diaspora Capital to African Growth Opportunities."</blockquote>
            <p className="dsp-quote-sub">Your vision. Our expertise. Africa's future.</p>
            <a href="#contact" className="btn-cta-w">Start Your Investment Journey</a>
          </div>
        </div>

      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="sec">
        <div className="container">
          <div className="sec-hd">
            <Tag>Pricing</Tag>
            <h2 className="rae-h2">Packages Tailored to Your Stage</h2>
            <p className="sec-lead">Transparent, structured pricing designed for every level of business growth.</p>
          </div>
          <div className="pkg-grid">
            {/* ── BESPOKE / CUSTOM PACKAGE ── */}
            <div className="pkg-card pkg-card--custom">
              <div className="pkg-custom-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h3 className="pkg-name">Bespoke Package</h3>
              <p className="pkg-custom-tagline">Your terms. Your scope. Your price.</p>
              <p className="pkg-custom-desc">
                Not sure which package fits your situation? Tell us exactly what your business needs — the services, timeline, and budget that work for you — and our advisory team will build a tailored solution from scratch.
              </p>
              <ul className="pkg-feats pkg-feats--custom">
                {[
                  'Any combination of our services',
                  'Quotation delivered to your email within 24 hrs',
                ].map(f => (<li key={f}><Check /><span>{f}</span></li>))}
              </ul>
              <a href="#contact-custom" className="pkg-btn pkg-btn--custom">
                Request a Quote
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M3 8h10M8 3l5 5-5 5"/>
                </svg>
              </a>
              <p className="pkg-custom-note">
                Our marketing team will reply to your email with a detailed quotation within 24 hours.
              </p>
            </div>

            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`pkg-card${pkg.featured ? ' pkg-card--star' : ''}`}>
                {pkg.featured && <div className="pkg-badge">Most Popular</div>}
                <div className="pkg-head">
                  <h3 className="pkg-name">{pkg.name}</h3>
                  <div className="pkg-price">
                    <span className="pkg-amt">{pkg.price}</span>
                    <span className="pkg-per">{pkg.period}</span>
                  </div>
                </div>
                <ul className="pkg-feats">
                  {pkg.features.map(f => (
                    <li key={f}><Check /><span>{f}</span></li>
                  ))}
                </ul>
                <a href="#contact" className={`pkg-btn${pkg.featured ? ' pkg-btn--fill' : ''}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section id="sectors" className="sec sec--gray">
        <div className="container">
          <div className="sec-hd">
            <Tag>Who We Serve</Tag>
            <h2 className="rae-h2">Sectors We Support</h2>
            <p className="sec-lead">We partner with businesses across diverse, high-impact industries driving Africa's economic transformation.</p>
          </div>
          <div className="sec-grid">
            {SECTORS.map(s => (
              <div key={s} className="sec-tile">
                <div className="sec-tile-dot" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPPORTUNITIES ── */}
      <OpportunitiesSection opportunities={siteContent.opportunities} />

      {/* ── BLOG ── */}
      <BlogSection posts={siteContent.blogPosts} />

      {/* ── TEAM ── */}
      <section id="team" className="sec">
        <div className="container">
          <div className="sec-hd">
            <Tag>Our People</Tag>
            <h2 className="rae-h2">Leadership Team</h2>
            <p className="sec-lead">Experienced professionals dedicated to transforming African entrepreneurship into global impact.</p>
          </div>
          <div className="team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-photo-wrap">
                  <img src={m.img} alt={m.name} className="team-photo" />
                  <div className="team-photo-overlay" />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{m.name}</h3>
                  <div className="team-role">{m.role}</div>
                  <p className="team-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="team-note">* Placeholder profiles — please replace with actual RAE leadership photos and biographies.</p>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div className="cta-band">
        <div className="container">
          <div className="cta-band-inner">
            <div>
              <h2>Ready to Build Tomorrow, Together?</h2>
              <p>Let's turn your vision into Africa's next great enterprise.</p>
            </div>
            <div className="cta-band-btns">
              <a href="#contact" className="btn-cta-w">Get In Touch</a>
              <a href="tel:+263776283368" className="btn-cta-g">+263 776 283 368</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTACT ── */}
      <section id="contact" className="sec">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info">
              <Tag>Contact Us</Tag>
              <h2 className="rae-h2">Let's Build Together</h2>
              <p className="rae-p">
                Whether you're a startup looking to launch, an SME seeking growth capital, or an investor exploring African opportunities — we're ready to partner with you.
              </p>
              <div className="contact-rows">
                <div className="contact-row">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.88 19.79 19.79 0 01.06 1.28 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </div>
                  <div>
                    <div className="c-label">Phone</div>
                    <a href="tel:+263776283368" className="c-val">+263 776 283 368</a>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <div className="c-label">Email</div>
                    <a href="mailto:raewealth@gmail.com" className="c-val">raewealth@gmail.com</a>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div className="c-label">Operations</div>
                    <div className="c-val">Zimbabwe &amp; Pan-African</div>
                  </div>
                </div>
              </div>
            </div>

            <div id="contact-custom" className="contact-form-panel">
              <h3>Send Us a Message</h3>
              <form onSubmit={e => e.preventDefault()}>
                <div className="form-row">
                  <div className="fg">
                    <label>First Name</label>
                    <input type="text" placeholder="John" />
                  </div>
                  <div className="fg">
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" />
                  </div>
                </div>
                <div className="fg">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
                <div className="fg">
                  <label>Service of Interest</label>
                  <select>
                    <option value="">Select a service…</option>
                    <option value="custom-package">✦ Custom Package / Request a Quotation</option>
                    {SERVICES.map(s => <option key={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Message</label>
                  <textarea rows={4} placeholder="Tell us about your business, the services you need, your budget range, and preferred timeline…" />
                </div>
                <div className="form-quote-note">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  For custom package requests, our marketing team will reply to your email with a personalised quotation within <strong>24 hours</strong>.
                </div>
                <button type="submit" className="form-submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-layout">
            <div className="footer-brand">
              <a href="#" className="nav-logo">
                <LogoMark size={34} />
                <div className="nav-logo-copy">
                  <span className="nav-logo-name" style={{ color: '#fff' }}>Righteous African</span>
                  <span className="nav-logo-sub">Equities</span>
                </div>
              </a>
              <p className="footer-tag">
                Empowering Africa's next generation of entrepreneurs and enterprises. Building legacies that last.
              </p>
              <div className="footer-contacts">
                <a href="tel:+263776283368">+263 776 283 368</a>
                <a href="mailto:raewealth@gmail.com">raewealth@gmail.com</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#diaspora">Diaspora Solutions</a>
              <a href="#team">Our Team</a>
              <a href="#sectors">Sectors</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <a href="#services">Business Incubation</a>
              <a href="#services">Accounting &amp; Bookkeeping</a>
              <a href="#services">Company Registration</a>
              <a href="#services">Financial Modeling</a>
              <a href="#services">Investor Readiness</a>
            </div>

            <div className="footer-col">
              <h4>Packages</h4>
              <a href="#packages">Just Start Pack</a>
              <a href="#packages">Startup Package</a>
              <a href="#packages">SME Growth Package</a>
              <a href="#packages">Corporate Finance</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Righteous African Equities. All rights reserved.</p>
            <p className="footer-motto">"....building Africa's Next Generation of Enterprises"</p>
            <button className="footer-admin-link" onClick={() => setAdminMode(true)} aria-label="Admin">Admin</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
