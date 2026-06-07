import type { BlogPost } from '../data/types'

export default function BlogSection({ posts }: { posts: BlogPost[] }) {
  const published = posts.filter(p => p.published)

  return (
    <section id="blog" className="sec sec--gray">
      <div className="container">
        <div className="sec-hd">
          <div className="rae-tag">Insights &amp; Ideas</div>
          <h2 className="rae-h2">From the RAE Blog</h2>
          <p className="sec-lead">Expert perspectives on African business, investment, and entrepreneurship.</p>
        </div>

        {published.length === 0 ? (
          <p className="content-empty">No posts published yet. Check back soon.</p>
        ) : (
          <div className="blog-grid">
            {published.map(post => (
              <article key={post.id} className="blog-card">
                {post.image && (
                  <div className="blog-img-wrap">
                    <img src={post.image} alt={post.title} className="blog-img" loading="lazy" />
                    <span className="blog-cat">{post.category}</span>
                  </div>
                )}
                <div className="blog-body">
                  <div className="blog-meta">
                    <span>{post.author}</span>
                    <span className="blog-dot">·</span>
                    <span>
                      {new Date(post.date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <span className="srv-more">
                    Read more
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M3 8h10M8 3l5 5-5 5" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
