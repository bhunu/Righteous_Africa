import { useState, useEffect, type ReactNode } from 'react'
import type { SiteContent, BlogPost, Opportunity } from '../data/types'

// ─── PIN helpers ─────────────────────────────────────────────────────────────

const DEFAULT_PIN = 'RAE2024'
const PIN_KEY     = 'rae:pin_hash'
const SESSION_KEY = 'rae:admin'
const PAT_KEY     = 'rae:pat'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPin(input: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY)
  const inputHash = await sha256(input)
  if (!stored) {
    const defaultHash = await sha256(DEFAULT_PIN)
    if (inputHash === defaultHash) { localStorage.setItem(PIN_KEY, defaultHash); return true }
    return false
  }
  return inputHash === stored
}

async function changePin(newPin: string) {
  localStorage.setItem(PIN_KEY, await sha256(newPin))
}

// ─── GitHub publish ───────────────────────────────────────────────────────────

const GH_OWNER = 'bhunu'
const GH_REPO  = 'Righteous_Africa'
const GH_FILE  = 'public/data/content.json'
const GH_API   = 'https://api.github.com'

async function publishToGitHub(pat: string, content: SiteContent): Promise<void> {
  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const jsonStr = JSON.stringify(content, null, 2)
  const b64 = btoa(Array.from(new TextEncoder().encode(jsonStr), b => String.fromCharCode(b)).join(''))
  const now = new Date().toISOString().slice(0, 10)

  // GET existing file SHA (needed for updates). 404 means file doesn't exist yet — create it without sha.
  let sha: string | undefined
  const getRes = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`, { headers })
  if (getRes.ok) {
    const fileData = await getRes.json() as { sha: string }
    sha = fileData.sha
  } else if (getRes.status !== 404) {
    const e = await getRes.json().catch(() => ({}))
    throw new Error((e as { message?: string }).message || `GitHub API error ${getRes.status}`)
  }

  const putRes = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `content: update blog and opportunities (${now})`,
      content: b64,
      ...(sha ? { sha } : {}),
      branch: 'main',
    }),
  })

  if (!putRes.ok) {
    const e = await putRes.json().catch(() => ({}))
    throw new Error((e as { message?: string }).message || `Publish failed (${putRes.status})`)
  }
}

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="adm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="adm-modal">
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button className="adm-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  )
}

// ─── PIN gate ─────────────────────────────────────────────────────────────────

function PinGate({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true); setError('')
    const ok = await verifyPin(pin)
    setLoading(false)
    if (ok) { onSuccess() } else { setError('Incorrect PIN. Please try again.'); setPin('') }
  }

  return (
    <div className="adm-pin-screen">
      <div className="adm-pin-box">
        <div className="adm-pin-logo">
          <svg width="36" height="28" viewBox="0 0 46 36" fill="none">
            <path d="M2 33L14 4L26 33"  stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 33L32 4L44 33" stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 33L23 9L35 33" stroke="#0A0A0A" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round" opacity="0.82"/>
          </svg>
          <span>Admin Access</span>
        </div>
        <p className="adm-pin-sub">Enter your admin PIN to continue</p>
        <form onSubmit={handleSubmit} className="adm-pin-form">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="adm-pin-input"
            autoFocus
            maxLength={20}
          />
          {error && <p className="adm-pin-error">{error}</p>}
          <button type="submit" className="adm-pin-btn" disabled={loading || pin.length === 0}>
            {loading ? 'Verifying…' : 'Enter Admin Panel'}
          </button>
        </form>
        <button className="adm-pin-cancel" onClick={onCancel}>← Back to site</button>
      </div>
    </div>
  )
}

// ─── Blog manager ─────────────────────────────────────────────────────────────

const BLOG_CATEGORIES = ['Business Tips', 'Market Insights', 'Investment', 'Entrepreneurship', 'African Markets', 'Diaspora']

const emptyPost = (): Omit<BlogPost, 'id'> => ({
  title: '', category: 'Business Tips', author: 'RAE Team',
  date: new Date().toISOString().slice(0, 10),
  excerpt: '', content: '', image: '', published: false,
})

function BlogManager({ posts, onChange }: { posts: BlogPost[]; onChange: (p: BlogPost[]) => void }) {
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(emptyPost())

  function openNew() { setForm(emptyPost()); setIsNew(true); setEditing({ id: '', ...emptyPost() }) }
  function openEdit(p: BlogPost) { setForm({ ...p }); setIsNew(false); setEditing(p) }
  function closeForm() { setEditing(null) }

  function saveForm() {
    if (!form.title.trim() || !form.excerpt.trim()) return
    if (isNew) {
      onChange([...posts, { ...form, id: crypto.randomUUID() }])
    } else if (editing) {
      onChange(posts.map(p => p.id === editing.id ? { ...form, id: editing.id } : p))
    }
    closeForm()
  }

  function remove(id: string) {
    if (confirm('Delete this post?')) onChange(posts.filter(p => p.id !== id))
  }

  function togglePublished(id: string) {
    onChange(posts.map(p => p.id === id ? { ...p, published: !p.published } : p))
  }

  const f = (k: keyof typeof form, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="adm-manager">
      <div className="adm-manager-head">
        <h3>Blog Posts <span className="adm-count">{posts.length}</span></h3>
        <button className="adm-btn-add" onClick={openNew}>+ New Post</button>
      </div>

      {posts.length === 0 && <p className="adm-empty">No posts yet. Create your first one.</p>}

      <div className="adm-list">
        {posts.map(p => (
          <div key={p.id} className="adm-list-item">
            <div className="adm-list-info">
              <div className="adm-list-title">{p.title}</div>
              <div className="adm-list-meta">
                <span className="adm-tag-sm">{p.category}</span>
                <span>{p.date}</span>
                <span className={`adm-pub-badge ${p.published ? 'adm-pub-badge--on' : ''}`}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="adm-list-actions">
              <button className="adm-act" onClick={() => togglePublished(p.id)} title={p.published ? 'Unpublish' : 'Publish'}>
                {p.published ? '⊙' : '○'}
              </button>
              <button className="adm-act" onClick={() => openEdit(p)}>Edit</button>
              <button className="adm-act adm-act--del" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <Modal title={isNew ? 'New Blog Post' : 'Edit Post'} onClose={closeForm}>
          <div className="adm-form">
            <div className="adm-fg">
              <label>Title *</label>
              <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Post title" />
            </div>
            <div className="adm-row2">
              <div className="adm-fg">
                <label>Category</label>
                <select value={form.category} onChange={e => f('category', e.target.value)}>
                  {BLOG_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="adm-fg">
                <label>Author</label>
                <input value={form.author} onChange={e => f('author', e.target.value)} placeholder="Author name" />
              </div>
            </div>
            <div className="adm-row2">
              <div className="adm-fg">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => f('date', e.target.value)} />
              </div>
              <div className="adm-fg">
                <label>Image URL</label>
                <input value={form.image} onChange={e => f('image', e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="adm-fg">
              <label>Excerpt * <span className="adm-char">{form.excerpt.length}/200</span></label>
              <textarea rows={2} maxLength={200} value={form.excerpt} onChange={e => f('excerpt', e.target.value)} placeholder="Brief summary shown in the blog grid…" />
            </div>
            <div className="adm-fg">
              <label>Full Content</label>
              <textarea rows={8} value={form.content} onChange={e => f('content', e.target.value)} placeholder="Full article content…" />
            </div>
            <div className="adm-check-row">
              <label className="adm-check">
                <input type="checkbox" checked={form.published} onChange={e => f('published', e.target.checked)} />
                Publish immediately
              </label>
            </div>
            <div className="adm-form-actions">
              <button className="adm-btn-save" onClick={saveForm} disabled={!form.title.trim() || !form.excerpt.trim()}>
                {isNew ? 'Create Post' : 'Save Changes'}
              </button>
              <button className="adm-btn-cancel" onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Opportunity manager ──────────────────────────────────────────────────────

const SECTORS = [
  'Agribusiness', 'Medical Enterprises', 'Export Ventures', 'Technology',
  'Renewable Energy', 'Fuel & Petroleum', 'Women-Led Businesses', 'Youth Entrepreneurs',
  'Manufacturing', 'Real Estate', 'Retail & FMCG', 'Financial Services',
]

const emptyOpp = (): Omit<Opportunity, 'id'> => ({
  title: '', sector: 'Agribusiness', type: 'Investment', description: '',
  minInvestment: '', expectedReturns: '', deadline: '', status: 'Open', highlights: [''],
})

function OppManager({ opportunities, onChange }: { opportunities: Opportunity[]; onChange: (o: Opportunity[]) => void }) {
  const [editing, setEditing] = useState<Opportunity | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(emptyOpp())

  function openNew() { setForm(emptyOpp()); setIsNew(true); setEditing({ id: '', ...emptyOpp() }) }
  function openEdit(o: Opportunity) { setForm({ ...o, highlights: [...o.highlights] }); setIsNew(false); setEditing(o) }
  function closeForm() { setEditing(null) }

  function saveForm() {
    if (!form.title.trim() || !form.description.trim()) return
    const clean = { ...form, highlights: form.highlights.filter(h => h.trim()) }
    if (isNew) {
      onChange([...opportunities, { ...clean, id: crypto.randomUUID() }])
    } else if (editing) {
      onChange(opportunities.map(o => o.id === editing.id ? { ...clean, id: editing.id } : o))
    }
    closeForm()
  }

  function remove(id: string) {
    if (confirm('Delete this opportunity?')) onChange(opportunities.filter(o => o.id !== id))
  }

  const f = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  function setHighlight(i: number, v: string) {
    setForm(prev => { const h = [...prev.highlights]; h[i] = v; return { ...prev, highlights: h } })
  }
  function addHighlight() { setForm(prev => ({ ...prev, highlights: [...prev.highlights, ''] })) }
  function removeHighlight(i: number) {
    setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))
  }

  return (
    <div className="adm-manager">
      <div className="adm-manager-head">
        <h3>Opportunities <span className="adm-count">{opportunities.length}</span></h3>
        <button className="adm-btn-add" onClick={openNew}>+ New Opportunity</button>
      </div>

      {opportunities.length === 0 && <p className="adm-empty">No opportunities yet. Create your first one.</p>}

      <div className="adm-list">
        {opportunities.map(o => (
          <div key={o.id} className="adm-list-item">
            <div className="adm-list-info">
              <div className="adm-list-title">{o.title}</div>
              <div className="adm-list-meta">
                <span className="adm-tag-sm">{o.sector}</span>
                <span className="adm-tag-sm">{o.type}</span>
                <span className={`adm-pub-badge ${o.status === 'Open' ? 'adm-pub-badge--on' : ''}`}>{o.status}</span>
              </div>
            </div>
            <div className="adm-list-actions">
              <button className="adm-act" onClick={() => openEdit(o)}>Edit</button>
              <button className="adm-act adm-act--del" onClick={() => remove(o.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <Modal title={isNew ? 'New Opportunity' : 'Edit Opportunity'} onClose={closeForm}>
          <div className="adm-form">
            <div className="adm-fg">
              <label>Title *</label>
              <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Opportunity title" />
            </div>
            <div className="adm-row2">
              <div className="adm-fg">
                <label>Sector</label>
                <select value={form.sector} onChange={e => f('sector', e.target.value)}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="adm-fg">
                <label>Type</label>
                <select value={form.type} onChange={e => f('type', e.target.value)}>
                  {(['Investment', 'Partnership', 'Grant', 'Joint Venture'] as const).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-fg">
              <label>Description *</label>
              <textarea rows={4} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Detailed description…" />
            </div>
            <div className="adm-row3">
              <div className="adm-fg">
                <label>Min. Investment</label>
                <input value={form.minInvestment} onChange={e => f('minInvestment', e.target.value)} placeholder="e.g. $10,000" />
              </div>
              <div className="adm-fg">
                <label>Expected Returns</label>
                <input value={form.expectedReturns} onChange={e => f('expectedReturns', e.target.value)} placeholder="e.g. 20–25% ROI" />
              </div>
              <div className="adm-fg">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => f('deadline', e.target.value)} />
              </div>
            </div>
            <div className="adm-fg">
              <label>Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)}>
                {(['Open', 'Coming Soon', 'Closed'] as const).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="adm-fg">
              <label>Key Highlights</label>
              {form.highlights.map((h, i) => (
                <div key={i} className="adm-highlight-row">
                  <input value={h} onChange={e => setHighlight(i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
                  {form.highlights.length > 1 && (
                    <button className="adm-hl-del" onClick={() => removeHighlight(i)} type="button">✕</button>
                  )}
                </div>
              ))}
              <button className="adm-hl-add" onClick={addHighlight} type="button">+ Add highlight</button>
            </div>
            <div className="adm-form-actions">
              <button className="adm-btn-save" onClick={saveForm} disabled={!form.title.trim() || !form.description.trim()}>
                {isNew ? 'Create Opportunity' : 'Save Changes'}
              </button>
              <button className="adm-btn-cancel" onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  // ── PIN change ──
  const [currentPin, setCurrentPin] = useState('')
  const [newPin,     setNewPin]     = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [pinMsg,     setPinMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  async function handlePinChange(e: { preventDefault(): void }) {
    e.preventDefault()
    if (newPin.length < 4) { setPinMsg({ type: 'err', text: 'New PIN must be at least 4 characters.' }); return }
    if (newPin !== confirm) { setPinMsg({ type: 'err', text: 'New PINs do not match.' }); return }
    setPinLoading(true)
    const ok = await verifyPin(currentPin)
    if (!ok) { setPinLoading(false); setPinMsg({ type: 'err', text: 'Current PIN is incorrect.' }); return }
    await changePin(newPin)
    setPinLoading(false)
    setPinMsg({ type: 'ok', text: 'PIN changed successfully.' })
    setCurrentPin(''); setNewPin(''); setConfirm('')
  }

  // ── GitHub token ──
  const [savedPat,    setSavedPat]    = useState(() => localStorage.getItem(PAT_KEY) || '')
  const [newPat,      setNewPat]      = useState('')
  const [showNewPat,  setShowNewPat]  = useState(false)
  const [patMsg,      setPatMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function maskedPat(t: string) {
    return t.length > 8 ? t.slice(0, 10) + '••••••••' + t.slice(-4) : '••••••••••••'
  }

  function savePat() {
    if (!newPat.trim()) { setPatMsg({ type: 'err', text: 'Please enter a token.' }); return }
    localStorage.setItem(PAT_KEY, newPat.trim())
    setSavedPat(newPat.trim())
    setNewPat('')
    setPatMsg({ type: 'ok', text: 'Token saved. You will not need to enter it again.' })
  }

  function clearPat() {
    if (!window.confirm('Remove the saved GitHub token?')) return
    localStorage.removeItem(PAT_KEY)
    setSavedPat('')
    setPatMsg(null)
  }

  return (
    <div className="adm-manager">
      <div className="adm-manager-head"><h3>Settings</h3></div>

      {/* GitHub token */}
      <div className="adm-settings-section" style={{ marginBottom: '1.5rem' }}>
        <h4>GitHub Access Token</h4>
        <p className="adm-settings-note">
          Save your token once — it is stored locally in this browser and used automatically every time you publish.
        </p>
        {savedPat ? (
          <div className="adm-pat-saved">
            <div className="adm-pat-saved-row">
              <span className="adm-pat-saved-val">{maskedPat(savedPat)}</span>
              <span className="adm-pat-saved-badge">✓ Saved</span>
            </div>
            <div className="adm-pat-saved-actions">
              <button className="adm-btn-save" style={{ fontSize: '.8rem', padding: '.4rem .9rem' }}
                onClick={() => { setSavedPat(''); setNewPat('') }}>
                Replace Token
              </button>
              <button className="adm-btn-cancel" style={{ fontSize: '.8rem', padding: '.4rem .9rem' }}
                onClick={clearPat}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="adm-form adm-form--narrow">
            <div className="adm-fg">
              <label>Personal Access Token</label>
              <div className="adm-pat-row">
                <input
                  type={showNewPat ? 'text' : 'password'}
                  value={newPat}
                  onChange={e => setNewPat(e.target.value)}
                  placeholder="github_pat_…"
                  className="adm-pat-input"
                />
                <button className="adm-pat-toggle" onClick={() => setShowNewPat(s => !s)} type="button">
                  {showNewPat ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="adm-settings-note" style={{ marginTop: '.4rem' }}>
                Go to <strong>github.com → Settings → Developer Settings → Personal Access Tokens → Fine-grained</strong>.
                Grant <strong>Contents: Read and Write</strong> on the <strong>{GH_REPO}</strong> repo.
              </p>
            </div>
            {patMsg && <p className={`adm-settings-msg adm-settings-msg--${patMsg.type}`}>{patMsg.text}</p>}
            <button className="adm-btn-save" onClick={savePat} disabled={!newPat.trim()}>
              Save Token
            </button>
          </div>
        )}
        {patMsg && savedPat && <p className={`adm-settings-msg adm-settings-msg--${patMsg.type}`} style={{ marginTop: '.5rem' }}>{patMsg.text}</p>}
      </div>

      {/* PIN change */}
      <div className="adm-settings-section">
        <h4>Change Admin PIN</h4>
        <p className="adm-settings-note">Default PIN is <strong>RAE2024</strong>. Change it to something only you know.</p>
        <form onSubmit={handlePinChange} className="adm-form adm-form--narrow">
          <div className="adm-fg">
            <label>Current PIN</label>
            <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} placeholder="Current PIN" />
          </div>
          <div className="adm-fg">
            <label>New PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min 4 chars)" minLength={4} />
          </div>
          <div className="adm-fg">
            <label>Confirm New PIN</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new PIN" />
          </div>
          {pinMsg && <p className={`adm-settings-msg adm-settings-msg--${pinMsg.type}`}>{pinMsg.text}</p>}
          <button type="submit" className="adm-btn-save" disabled={pinLoading || !currentPin || !newPin || !confirm}>
            {pinLoading ? 'Saving…' : 'Change PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Publish modal ────────────────────────────────────────────────────────────

function PublishModal({
  content, onClose, onSuccess,
}: {
  content: SiteContent
  onClose: () => void
  onSuccess: () => void
}) {
  const [savedPat,  setSavedPat]  = useState(() => localStorage.getItem(PAT_KEY) || '')
  const [newPat,    setNewPat]    = useState('')
  const [showPat,   setShowPat]   = useState(false)
  const [changing,  setChanging]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handlePublish(pat: string) {
    setLoading(true); setError('')
    try {
      localStorage.setItem(PAT_KEY, pat)
      setSavedPat(pat)
      await publishToGitHub(pat, content)
      localStorage.removeItem('rae:content')
      onSuccess()
    } catch (err) {
      setError((err as Error).message || 'Publish failed. Check your token and try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasSaved = Boolean(savedPat) && !changing
  const masked = savedPat.length > 8
    ? savedPat.slice(0, 10) + '••••••••' + savedPat.slice(-4)
    : '••••••••••••'

  return (
    <Modal title="Publish to GitHub" onClose={onClose}>
      <div className="adm-publish-body">
        <p className="adm-publish-info">
          This will commit <code>public/data/content.json</code> to <strong>{GH_OWNER}/{GH_REPO}</strong> on the <code>main</code> branch, triggering a GitHub Actions deployment.
        </p>

        {hasSaved ? (
          /* ── Token already saved — one-click publish ── */
          <>
            <div className="adm-pat-saved">
              <div className="adm-pat-saved-row">
                <span className="adm-pat-saved-val">{masked}</span>
                <span className="adm-pat-saved-badge">✓ Token saved</span>
              </div>
              <button className="adm-hl-add" onClick={() => setChanging(true)}>Use a different token</button>
            </div>
            {error && <p className="adm-publish-error">{error}</p>}
            <div className="adm-form-actions">
              <button className="adm-btn-save" onClick={() => handlePublish(savedPat)} disabled={loading}>
                {loading ? 'Publishing…' : 'Publish Now'}
              </button>
              <button className="adm-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          /* ── No token yet (or changing) — show setup steps ── */
          <>
            <div className="adm-publish-steps">
              <div className="adm-step">
                <span className="adm-step-n">1</span>
                <span>Go to <strong>github.com → Settings → Developer Settings → Personal Access Tokens → Fine-grained</strong></span>
              </div>
              <div className="adm-step">
                <span className="adm-step-n">2</span>
                <span>Grant <strong>Contents: Read and Write</strong> on the <strong>{GH_REPO}</strong> repository</span>
              </div>
              <div className="adm-step">
                <span className="adm-step-n">3</span>
                <span>Paste below — saved permanently in this browser so you never repeat this</span>
              </div>
            </div>
            <div className="adm-fg">
              <label>GitHub Personal Access Token</label>
              <div className="adm-pat-row">
                <input
                  type={showPat ? 'text' : 'password'}
                  value={newPat}
                  onChange={e => setNewPat(e.target.value)}
                  placeholder="github_pat_…"
                  className="adm-pat-input"
                  autoFocus
                />
                <button className="adm-pat-toggle" onClick={() => setShowPat(s => !s)} type="button">
                  {showPat ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <p className="adm-publish-error">{error}</p>}
            <div className="adm-form-actions">
              <button className="adm-btn-save" onClick={() => handlePublish(newPat.trim())}
                disabled={loading || !newPat.trim()}>
                {loading ? 'Publishing…' : 'Save Token & Publish'}
              </button>
              <button className="adm-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

type Tab = 'blog' | 'opportunities' | 'settings'

interface Props {
  content: SiteContent
  onContentChange: (c: SiteContent) => void
  onExit: () => void
}

export default function AdminPanel({ content, onContentChange, onExit }: Props) {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('blog')
  const [showPublish, setShowPublish] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') setAuthed(true)
    const saved = localStorage.getItem('rae:content')
    if (saved) {
      try { onContentChange(JSON.parse(saved)) } catch {}
    }
  }, [])

  function handleAuth() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setAuthed(true)
  }

  function handleExit() {
    sessionStorage.removeItem(SESSION_KEY)
    onExit()
  }

  function updateContent(next: SiteContent) {
    onContentChange(next)
    localStorage.setItem('rae:content', JSON.stringify(next))
    setHasChanges(true)
    setPublishSuccess(false)
  }

  if (!authed) {
    return <PinGate onSuccess={handleAuth} onCancel={onExit} />
  }

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <svg width="30" height="23" viewBox="0 0 46 36" fill="none">
            <path d="M2 33L14 4L26 33"  stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 33L32 4L44 33" stroke="#C8102E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 33L23 9L35 33" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </svg>
          <div>
            <div className="adm-logo-name">RAE Admin</div>
            <div className="adm-logo-sub">Content Manager</div>
          </div>
        </div>

        <nav className="adm-nav">
          {([
            { key: 'blog', label: 'Blog Posts', icon: '📝' },
            { key: 'opportunities', label: 'Opportunities', icon: '💼' },
            { key: 'settings', label: 'Settings', icon: '⚙️' },
          ] as { key: Tab; label: string; icon: string }[]).map(item => (
            <button
              key={item.key}
              className={`adm-nav-item ${tab === item.key ? 'adm-nav-item--on' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-bottom">
          {publishSuccess && (
            <div className="adm-publish-ok">
              ✓ Published! CI/CD will deploy in ~2 min.
            </div>
          )}
          <button
            className={`adm-publish-btn ${hasChanges ? 'adm-publish-btn--active' : ''}`}
            onClick={() => setShowPublish(true)}
          >
            {hasChanges ? '↑ Publish Changes' : 'Publish to GitHub'}
          </button>
          <button className="adm-exit-btn" onClick={handleExit}>← Back to Site</button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        {tab === 'blog' && (
          <BlogManager
            posts={content.blogPosts}
            onChange={posts => updateContent({ ...content, blogPosts: posts })}
          />
        )}
        {tab === 'opportunities' && (
          <OppManager
            opportunities={content.opportunities}
            onChange={opps => updateContent({ ...content, opportunities: opps })}
          />
        )}
        {tab === 'settings' && <SettingsPanel />}
      </main>

      {showPublish && (
        <PublishModal
          content={content}
          onClose={() => setShowPublish(false)}
          onSuccess={() => { setShowPublish(false); setPublishSuccess(true); setHasChanges(false) }}
        />
      )}
    </div>
  )
}
