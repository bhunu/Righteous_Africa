import { useRef, useEffect, useState } from 'react'
import type { Opportunity } from '../data/types'

const STATUS_CLS: Record<string, string> = {
  'Open': 'opp-status--open',
  'Closed': 'opp-status--closed',
  'Coming Soon': 'opp-status--soon',
}

export default function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  const visible = opportunities.filter(o => o.status !== 'Closed')
  const sliderRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    const id = setInterval(() => {
      const card = el.querySelector<HTMLElement>('.opp-card')
      if (!card) return
      const step = card.offsetWidth + 28
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 5000)
    return () => clearInterval(id)
  }, [])

  if (visible.length === 0) return null

  return (
    <section id="opportunities" className="sec">
      <div className="container">
        <div className="sec-hd">
          <div className="rae-tag">Active Opportunities</div>
          <h2 className="rae-h2">Investment &amp; Partnership Opportunities</h2>
          <p className="sec-lead">
            Curated, vetted opportunities across African markets — sourced and structured by our team.
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="content-empty">No active opportunities at this time. <a href="#contact">Contact us</a> to discuss.</p>
        ) : (
          <div className="opp-slider" ref={sliderRef}>
            <div className="opp-grid">
              {visible.map(opp => (
                <div key={opp.id} className={`opp-card${expanded.has(opp.id) ? ' card--expanded' : ''}`}>
                  <div className="opp-head">
                    <div className="opp-badges">
                      <span className="opp-sector">{opp.sector}</span>
                      <span className="opp-type">{opp.type}</span>
                    </div>
                    <span className={`opp-status ${STATUS_CLS[opp.status] ?? ''}`}>{opp.status}</span>
                  </div>

                  <h3 className="opp-title">{opp.title}</h3>
                  <p className="opp-desc">{opp.description}</p>

                  {opp.highlights.length > 0 && (
                    <ul className="opp-highlights">
                      {opp.highlights.map((h, i) => (
                        <li key={i}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="opp-financials">
                    {opp.minInvestment && (
                      <div className="opp-fin-item">
                        <div className="opp-fin-label">Min. Investment</div>
                        <div className="opp-fin-val">{opp.minInvestment}</div>
                      </div>
                    )}
                    {opp.expectedReturns && (
                      <div className="opp-fin-item">
                        <div className="opp-fin-label">Expected Returns</div>
                        <div className="opp-fin-val">{opp.expectedReturns}</div>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="opp-fin-item">
                        <div className="opp-fin-label">Deadline</div>
                        <div className="opp-fin-val">
                          {new Date(opp.deadline).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="opp-cta opp-cta--expand" onClick={() => toggle(opp.id)}>
                    {expanded.has(opp.id) ? 'Show less' : 'Read more'}
                  </button>
                  {expanded.has(opp.id) && (
                    <a href="#contact" className="opp-cta">Express Interest</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
