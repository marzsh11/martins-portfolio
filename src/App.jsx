import { useEffect, useState } from 'react'
import './App.css'

function getLosAngelesTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(new Date())
}

function ThemeMark() {
  return (
    <svg className="theme-mark" viewBox="0 0 34 34" aria-hidden="true">
      <circle className="theme-mark__outer" cx="17" cy="17" r="16.5" />
      <circle className="theme-mark__inner" cx="17" cy="17" r="10.5" />
      <path className="theme-mark__fill" d="M17 6.5a10.5 10.5 0 0 1 0 21V6.5Z" />
    </svg>
  )
}

const featuredProjects = [
  { id: '000', client: 'M. G. Jr Portrait', category: 'Photography', year: '2025' },
  { id: '001', client: 'The Open Studio', category: 'Zine', year: '2025' },
  { id: '002', client: 'Antojitos Mi Amor', category: 'Website', year: '2026' },
  { id: '003', client: 'Disillusion', category: 'Website', year: '2026' },
]

function App() {
  const [time, setTime] = useState(getLosAngelesTime)
  const [isInverted, setIsInverted] = useState(false)
  const [activeProject, setActiveProject] = useState('000')

  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}`}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Martin Gama Jr home">Martin Gama Jr</a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href="#work">work</a>
          <a href="#info">info</a>
        </nav>
        <a className="contact" href="mailto:martingama2100@gmail.com">
          <span className="contact__label">contact</span>
          <span className="contact__email">martingama2100@gmail.com</span>
        </a>
      </header>

      <section className="page-content" id="top" aria-label="Portfolio">
        <p className="brand-description">
          is a Mexican-American<br />
          multimedia creative / full stack developer<br />
          based out of Los Angeles County.
        </p>
        <section className="featured-work" id="work" aria-label="Featured work">
          <div className="featured-heading">
            <span>featured</span>
            <span className="featured-toggle__rule" aria-hidden="true" />
          </div>
          <div className="work-list" id="featured-project-list">
              {featuredProjects.map((project) => {
                const isActive = activeProject === project.id
                return (
                  <button
                    className={`work-row${isActive ? ' work-row--active' : ''}`}
                    type="button"
                    key={project.id}
                    aria-current={isActive ? 'true' : undefined}
                    onMouseEnter={() => setActiveProject(project.id)}
                    onFocus={() => setActiveProject(project.id)}
                    onClick={() => setActiveProject(project.id)}
                  >
                    <span className="work-row__number">{project.id}</span>
                    <span className="work-row__client">{project.client}</span>
                    <span className="work-row__category">{project.category}</span>
                    <span className="work-row__year">{project.year}</span>
                    <span className="work-row__marker" aria-hidden="true">{isActive ? '<' : ''}</span>
                  </button>
                )
              })}
          </div>
        </section>
        <span className="visually-hidden" id="info">About Martin Gama Jr</span>
      </section>

      <footer className="site-footer">
        <div className="footer-meta">
          <span>Los Angeles, California</span>
          <time>{time}</time>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-label={isInverted ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-pressed={isInverted}
          onClick={() => setIsInverted((current) => !current)}
        >
          <span>click to toggle</span>
          <ThemeMark />
        </button>
      </footer>
    </main>
  )
}

export default App
