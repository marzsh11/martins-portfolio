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

function getCurrentPage() {
  const route = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (route === 'work' || route === 'info') return route
  return 'home'
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

function EducationEntry({ school, degree, years }) {
  return (
    <div className="education-entry">
      <div className="info-detail">{school}</div>
      <div className="education-degree info-secondary">
        <span>{degree}</span>
        <em>{years}</em>
      </div>
    </div>
  )
}

function ExperienceEntry({ organization, role, children }) {
  return (
    <article className="experience-entry">
      <div className="info-detail">{organization}</div>
      <div className="experience-role info-secondary">{role}</div>
      <p className="info-description">
        {children}
      </p>
    </article>
  )
}

function InfoPage() {
  return (
    <section className="info-page" aria-label="About Martin Gama Jr">
      <div className="info-column info-column--left">
        <section className="info-section" aria-labelledby="education-title">
          <div className="info-section__heading">
            <h1 className="info-section__title" id="education-title">education</h1>
            <span className="info-section__marker" aria-hidden="true">{'<'}</span>
          </div>
          <div className="education-list">
            <EducationEntry
              school="University of California San Diego"
              degree="B.S Mathematics/Computer-Science"
              years="2024-2026"
            />
            <EducationEntry
              school="Pasadena City College"
              degree="A.S-T Computer Science"
              years="2022-2024"
            />
          </div>
        </section>

        <section className="info-section" aria-labelledby="experience-title">
          <div className="info-section__heading">
            <h2 className="info-section__title" id="experience-title">experience</h2>
            <span className="info-section__marker" aria-hidden="true">{'<'}</span>
          </div>
          <div className="experience-list">
            <ExperienceEntry organization="KSDT Radio" role="Computer Engineer / Web Developer Intern">
              Developed and maintained responsive front-end components using React.js and CSS to execute key website redesign initiatives for KSDT Radio. Collaborated on UI/UX improvements that modernized the digital platform, streamlined navigation, and enhanced overall listener engagement.
            </ExperienceEntry>
            <ExperienceEntry organization="Out The Archive" role="Creative Space Interdisciplinary Collaborator">
              Collaborated within a student-led creative collective to conceptualize, style, and produce an original fashion short film from ideation to execution. Designed and showcased a custom garment look for the organization’s live runway show, blending visual storytelling with hands-on fashion design.
            </ExperienceEntry>
            <ExperienceEntry organization="Pasadena City College" role="Math Tutor">
              Translated complex concepts into accessible, step-by-step frameworks for STEM students at Pasadena City College. Leveraged active listening and adaptable communication to diagnose learning gaps, strengthen technical fluency, and accelerate student performance.
            </ExperienceEntry>
          </div>
        </section>
      </div>

      <div className="info-column info-column--middle">
        <section className="info-section" aria-labelledby="skills-title">
          <div className="info-section__heading">
            <h2 className="info-section__title" id="skills-title">skills</h2>
            <span className="info-section__marker" aria-hidden="true">{'<'}</span>
          </div>
          <dl className="info-pairs">
            <dt>design</dt>
            <dd>Figma, Affinity Designer, TouchDesigner</dd>
            <dt>code</dt>
            <dd>HTML, CSS, Python, C++, ReactJS, Git, LaTeX</dd>
          </dl>
        </section>

        <section className="info-section" aria-labelledby="connect-title">
          <div className="info-section__heading">
            <h2 className="info-section__title" id="connect-title">connect</h2>
            <span className="info-section__marker" aria-hidden="true">{'<'}</span>
          </div>
          <dl className="info-pairs info-pairs--connect">
            <dt>email</dt>
            <dd><a href="mailto:martingama2100@gmail.com">martingama2100@gmail.com</a></dd>
            <dt>linkedin</dt>
            <dd><a href="https://www.linkedin.com/in/jrmartingama/" target="_blank" rel="noreferrer">jrmartingama</a></dd>
            <dt>github</dt>
            <dd><a href="https://github.com/marzsh11" target="_blank" rel="noreferrer">marzsh11</a></dd>
            <dt>instagram</dt>
            <dd><a href="https://www.instagram.com/icedlattepounder/" target="_blank" rel="noreferrer">icedlattepounder</a></dd>
          </dl>
        </section>
      </div>

      <div className="info-column info-column--portrait">
        <div className="portrait-placeholder" role="img" aria-label="Portrait image placeholder" />
        <p className="portrait-caption">
          Martin Gama Jr is a Mexican-American multimedia creative and full stack developer based in Los Angeles County.
        </p>
      </div>
    </section>
  )
}

function App() {
  const [time, setTime] = useState(getLosAngelesTime)
  const [isInverted, setIsInverted] = useState(false)
  const [activeProject, setActiveProject] = useState('000')
  const [currentPage, setCurrentPage] = useState(getCurrentPage)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const updatePageFromHistory = () => setCurrentPage(getCurrentPage())
    window.addEventListener('popstate', updatePageFromHistory)
    return () => window.removeEventListener('popstate', updatePageFromHistory)
  }, [])

  function navigate(event, path) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const destination = `${import.meta.env.BASE_URL}#${path}`
    window.history.pushState({}, '', destination)
    setCurrentPage(getCurrentPage())
  }

  const homeHref = `${import.meta.env.BASE_URL}#/`
  const workHref = `${import.meta.env.BASE_URL}#/work`
  const infoHref = `${import.meta.env.BASE_URL}#/info`

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}`}>
      <header className="site-header">
        <a className="brand" href={homeHref} onClick={(event) => navigate(event, '/')} aria-label="Martin Gama Jr home">Martin Gama Jr</a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href={workHref} onClick={(event) => navigate(event, '/work')} aria-current={currentPage === 'work' ? 'page' : undefined}>work</a>
          <a href={infoHref} onClick={(event) => navigate(event, '/info')} aria-current={currentPage === 'info' ? 'page' : undefined}>info</a>
        </nav>
        <a className="contact" href="mailto:martingama2100@gmail.com">
          <span className="contact__label">contact</span>
          <span className="contact__email">martingama2100@gmail.com</span>
        </a>
      </header>

      <section className={`page-content page-content--${currentPage}`} id="top" aria-label="Portfolio">
        {currentPage === 'work' ? (
          <WorkPage activeProject={activeProject} setActiveProject={setActiveProject} />
        ) : currentPage === 'info' ? (
          <InfoPage />
        ) : (
          <>
            <p className="brand-description">
              is a Mexican-American 
              multimedia creative / web developer<br />
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
