import { useState, useEffect, useCallback } from 'react'
import './App.css'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80',
    caption: 'Executive Business Consultation',
    sub: 'Senior advisors delivering strategic guidance in a corporate setting',
  },
  {
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Boardroom Financial Review',
    sub: 'High-level financial analysis and reporting for enterprise growth',
  },
  {
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    caption: 'Corporate Advisory Session',
    sub: 'Professional teams structuring investment and growth strategies',
  },
  {
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80',
    caption: 'Financial Calculations & Modeling',
    sub: 'Precision-driven financial modeling for investor-ready businesses',
  },
  {
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200&q=80',
    caption: 'Investor Readiness',
    sub: 'Preparing African ventures to meet and win world-class investors',
  },
]

const services = [
  { icon: '🚀', title: 'Startup Incubation', desc: 'End-to-end support to launch and scale your startup from ideation to market.' },
  { icon: '📋', title: 'Business Registration', desc: 'Fast-track company registration and compliance setup across African jurisdictions.' },
  { icon: '📊', title: 'Accounting & Bookkeeping', desc: 'Professional financial record-keeping and reporting for growing businesses.' },
  { icon: '📈', title: 'Financial Modeling', desc: 'Data-driven financial projections and models tailored to your business.' },
  { icon: '💼', title: 'Investor Readiness', desc: 'Prepare pitch decks, due diligence packages, and valuation frameworks.' },
  { icon: '🌍', title: 'Market Access & Export', desc: 'Open doors to regional and international markets for your products.' },
  { icon: '💰', title: 'Venture Capital Advisory', desc: 'Connect with the right investors and structure funding rounds successfully.' },
  { icon: '🎓', title: 'SME Training Programs', desc: 'Capacity-building workshops and mentorship for small and medium enterprises.' },
  { icon: '📝', title: 'Business Planning', desc: 'Comprehensive business plans that attract funding and guide growth strategy.' },
]

const sectors = [
  { icon: '🌾', label: 'Agribusiness' },
  { icon: '🏥', label: 'Medical Enterprises' },
  { icon: '🌐', label: 'Export Ventures' },
  { icon: '💻', label: 'Technology' },
  { icon: '⚡', label: 'Renewable Energy' },
  { icon: '⛽', label: 'Fuel & Petroleum' },
  { icon: '👩‍💼', label: 'Women-Led Businesses' },
  { icon: '👨‍🎓', label: 'Youth Entrepreneurs' },
]

const partners = [
  { icon: '🏦', label: 'Investors' },
  { icon: '🌐', label: 'Development Agencies' },
  { icon: '🏛️', label: 'Banks' },
  { icon: '🎓', label: 'Universities' },
  { icon: '🤝', label: 'NGOs' },
  { icon: '🏢', label: 'Corporates' },
  { icon: '🏛️', label: 'Government' },
]

function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 700)
  }, [animating])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="slider">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slide ${i === current ? 'slide-active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="slide-overlay" />
          <div className="slide-caption">
            <span className="slide-tag">Financial Sector</span>
            <p className="slide-title">{slide.caption}</p>
            <p className="slide-sub">{slide.sub}</p>
          </div>
        </div>
      ))}

      <button className="slider-arrow arrow-prev" onClick={prev} aria-label="Previous slide">
        ‹
      </button>
      <button className="slider-arrow arrow-next" onClick={next} aria-label="Next slide">
        ›
      </button>

      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'dot-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="site">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-icon">◈</span>
            <div className="brand-text">
              <span className="brand-name">Righteous African</span>
              <span className="brand-sub">Equities</span>
            </div>
          </div>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#sectors">Sectors</a></li>
            <li><a href="#partners" className="nav-cta">Partner With Us</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-badge">Africa's Enterprise Development Partner</div>
            <h1 className="hero-title">
              Building Africa's<br />
              <span className="accent-text">Next Generation</span><br />
              of Enterprises
            </h1>
            <p className="hero-desc">
              Righteous African Equities is a business advisory and startup incubation firm
              dedicated to empowering entrepreneurs, SMEs, and high-growth ventures across Africa.
            </p>
            <div className="hero-actions">
              <a href="#services" className="btn-primary">Explore Our Services</a>
              <a href="#partners" className="btn-outline">Partner With Us</a>
            </div>
          </div>
        </div>
        <HeroSlider />
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">8+</span>
          <span className="stat-label">Core Services</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="stat-number">8</span>
          <span className="stat-label">Target Sectors</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="stat-number">Pan-African</span>
          <span className="stat-label">Reach & Vision</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="stat-number">360°</span>
          <span className="stat-label">Business Support</span>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="section-label">Who We Are</div>
          <h2 className="section-title">An Enterprise Development & Venture Support Platform</h2>
          <p className="section-desc">
            Righteous African Equities is an enterprise development and venture support platform
            focused on supporting startups and SMEs through strategic business advisory,
            incubation, and investment facilitation services.
          </p>
          <div className="vision-mission">
            <div className="vm-card vision-card">
              <div className="vm-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>To become Africa's leading enterprise incubation and venture development ecosystem.</p>
            </div>
            <div className="vm-card mission-card">
              <div className="vm-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To empower African entrepreneurs with the tools, networks, and financial systems required to build globally competitive businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section services-section">
        <div className="container">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Our Services</h2>
          <p className="section-desc">
            Comprehensive support across every stage of your business journey — from inception to expansion.
          </p>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.title} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="card-accent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section id="sectors" className="section sectors-section">
        <div className="container">
          <div className="section-label">Who We Serve</div>
          <h2 className="section-title">Sectors We Support</h2>
          <p className="section-desc">We partner with businesses across diverse and high-impact industries driving Africa's growth.</p>
          <div className="sectors-grid">
            {sectors.map((s) => (
              <div key={s.label} className="sector-chip">
                <span className="sector-icon">{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section id="partners" className="section partners-section">
        <div className="container">
          <div className="section-label">Collaborate With Us</div>
          <h2 className="section-title">Partner With Us</h2>
          <p className="section-desc">
            Together, we can accelerate entrepreneurship and economic growth across Africa.
            We welcome partnerships with:
          </p>
          <div className="partners-grid">
            {partners.map((p) => (
              <div key={p.label} className="partner-card">
                <span className="partner-icon">{p.icon}</span>
                <span className="partner-label">{p.label}</span>
              </div>
            ))}
          </div>
          <div className="partner-cta">
            <p>Ready to build Africa's future together?</p>
            <a href="mailto:info@righteousafricanequities.com" className="btn-primary">Get In Touch</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-brand">
                <span className="brand-icon">◈</span>
                <div className="brand-text">
                  <span className="brand-name">Righteous African</span>
                  <span className="brand-sub">Equities</span>
                </div>
              </div>
              <p className="footer-tagline">Empowering Africa's next generation of entrepreneurs and enterprises.</p>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#services">Services</a>
              <a href="#sectors">Sectors</a>
              <a href="#partners">Partner With Us</a>
            </div>
            <div className="footer-links">
              <h4>Services</h4>
              <a href="#services">Startup Incubation</a>
              <a href="#services">Business Registration</a>
              <a href="#services">Financial Modeling</a>
              <a href="#services">Investor Readiness</a>
            </div>
            <div className="footer-contact">
              <h4>Contact</h4>
              <p>📧 info@righteousafricanequities.com</p>
              <p>🌍 Pan-African Operations</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Righteous African Equities. All rights reserved.</p>
            <p className="footer-motto">Building Africa's Next Generation of Enterprises</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
