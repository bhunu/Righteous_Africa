import type { Opportunity } from '../data/types'

const STATUS_CLS: Record<string, string> = {
  'Open': 'opp-status--open',
  'Closed': 'opp-status--closed',
  'Coming Soon': 'opp-status--soon',
}

export default function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  const visible = opportunities.filter(o => o.status !== 'Closed')

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
          <div className="opp-grid">
            {visible.map(opp => (
              <div key={opp.id} className="opp-card">
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

                <a href="#contact" className="opp-cta">Express Interest</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
