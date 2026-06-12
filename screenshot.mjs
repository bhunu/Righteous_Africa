import { chromium, devices } from 'playwright'

const iPhone13 = devices['iPhone 13']

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
})

const context = await browser.newContext({
  ...iPhone13,
  viewport: { width: 390, height: 844 },
  // bypass CSP so external images (Unsplash) load
  bypassCSP: true,
})

const page = await context.newPage()

// Log any render errors
page.on('console', m => { if (m.type() === 'error') console.error('PAGE ERR:', m.text()) })
page.on('pageerror', e => console.error('PAGE CRASH:', e.message))

// Give external images time to load
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 })

// Wait for hero background image to paint
await page.waitForFunction(() => {
  const bg = document.querySelector('.hero-bg')
  if (!bg) return false
  const style = window.getComputedStyle(bg)
  return style.backgroundImage !== 'none' && style.backgroundImage !== ''
}, { timeout: 15000 }).catch(() => console.log('hero-bg timeout — proceeding anyway'))

// Extra settle time for images + fonts
await page.waitForTimeout(3000)

// ── Screenshot 1: Hero + navbar ──────────────────────────────────────────────
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
await page.screenshot({ path: 'iphone13-1-hero.png', fullPage: false })
console.log('✓ 1-hero')

// ── Screenshot 2: Stats strip + About section ────────────────────────────────
await page.evaluate(() => document.querySelector('.stats-strip')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'iphone13-2-stats.png', fullPage: false })
console.log('✓ 2-stats')

// ── Screenshot 3: Services section ───────────────────────────────────────────
await page.evaluate(() => document.querySelector('#services')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'iphone13-3-services.png', fullPage: false })
console.log('✓ 3-services')

// ── Screenshot 4: Packages section ───────────────────────────────────────────
await page.evaluate(() => document.querySelector('#packages')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'iphone13-4-packages.png', fullPage: false })
console.log('✓ 4-packages')

// ── Screenshot 5: Contact form ────────────────────────────────────────────────
await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'iphone13-5-contact.png', fullPage: false })
console.log('✓ 5-contact')

// ── Screenshot 6: Footer ──────────────────────────────────────────────────────
await page.evaluate(() => document.querySelector('.footer')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(400)
await page.screenshot({ path: 'iphone13-6-footer.png', fullPage: false })
console.log('✓ 6-footer')

await browser.close()
console.log('\nAll done — check iphone13-*.png in the project root.')
