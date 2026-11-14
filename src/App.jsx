import { useEffect, useState } from 'react'
import { featuredProjects, projects } from './data/projects/index.js'
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

function isWorkRoute() {
  return window.location.pathname.replace(/\/+$/, '') === '/work'
}

function ProjectRows({ entries, activeProject, setActiveProject }) {
  return (
    <div className="work-list">
      {entries.map((project) => {
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
            <span className="work-row__category">{project.project}</span>
            <span className="work-row__year">{project.year}</span>
            <span className="work-row__marker" aria-hidden="true">{isActive ? '<' : ''}</span>
          </button>
        )
      })}
    </div>
  )
}

function WorkPage({ activeProject, setActiveProject }) {
  return (
    <section className="work-page" aria-label="All work">
      <div className="project-columns" aria-hidden="true">
        <span>no.</span>
        <span>client</span>
        <span>project</span>
        <span>year</span>
        <span />
      </div>
      <ProjectRows
        entries={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />
    </section>
  )
}

function App() {
  const [time, setTime] = useState(getLosAngelesTime)
  const [isInverted, setIsInverted] = useState(false)
  const [activeProject, setActiveProject] = useState('000')
  const [isWorkPage, setIsWorkPage] = useState(isWorkRoute)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const updatePageFromHistory = () => setIsWorkPage(isWorkRoute())
    window.addEventListener('popstate', updatePageFromHistory)
    return () => window.removeEventListener('popstate', updatePageFromHistory)
  }, [])

  function navigate(event, path) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, '', path)
    setIsWorkPage(isWorkRoute())
  }

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}`}>
      <header className="site-header">
        <a className="brand" href="/" onClick={(event) => navigate(event, '/')} aria-label="Martin Gama Jr home">Martin Gama Jr</a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href="/work" onClick={(event) => navigate(event, '/work')} aria-current={isWorkPage ? 'page' : undefined}>work</a>
          <a href="/#info">info</a>
        </nav>
        <a className="contact" href="mailto:martingama2100@gmail.com">
          <span className="contact__label">contact</span>
          <span className="contact__email">martingama2100@gmail.com</span>
        </a>
      </header>

      <section className={`page-content${isWorkPage ? ' page-content--work' : ''}`} id="top" aria-label="Portfolio">
        {isWorkPage ? (
          <WorkPage activeProject={activeProject} setActiveProject={setActiveProject} />
        ) : (
          <>
            <p className="brand-description">
              is a Mexican-American<br />
              multimedia creative / full stack developer<br />
              based out of Los Angeles County.
            </p>
            <section className="featured-work" aria-label="Featured work">
              <div className="featured-heading">
                <span>featured</span>
                <span className="featured-toggle__rule" aria-hidden="true" />
              </div>
              <ProjectRows
                entries={featuredProjects}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
              />
            </section>
          </>
        )}
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
