import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
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
  const page = route.split('/')[0]
  if (page === 'work' || page === 'info') return page
  return 'home'
}

function getProjectFromRoute() {
  const [, page, projectId] = window.location.hash.match(/^#\/?([^/]+)(?:\/([^/]+))?/) || []
  return page === 'work' ? projectId : undefined
}

function ProjectRows({ entries, activeProject, setActiveProject, onProjectOpen, interactionDisabled = false }) {
  return (
    <div className="work-list">
      {entries.map((project) => {
        const isActive = activeProject === project.id
        return (
          <button
            className={`work-row${isActive ? ' work-row--active' : ''}`}
            type="button"
            key={project.id}
            data-project-id={project.id}
            aria-current={isActive ? 'true' : undefined}
            onMouseEnter={() => !interactionDisabled && setActiveProject(project.id)}
            onFocus={() => !interactionDisabled && setActiveProject(project.id)}
            onClick={(event) => {
              if (interactionDisabled) return
              setActiveProject(project.id)
              onProjectOpen?.(event, project.id)
            }}
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

function HomeShowcase({ project, onProjectOpen }) {
  if (!project) return null

  const href = `${import.meta.env.BASE_URL}#/work/${project.id}`
  return (
    <a
      className={`home-preview${project.image ? '' : ' home-preview--missing'}`}
      href={href}
      aria-label={`Open ${project.client} project`}
      onClick={(event) => onProjectOpen(event, project.id)}
    >
      {project.image ? (
        <img className="home-preview__image" src={project.image} alt={project.imageAlt || `${project.client} project`} />
      ) : (
        <span className="home-preview__fallback">Add a project image to this entry</span>
      )}
    </a>
  )
}

function WorkPage({ activeProject, setActiveProject, routeProjectId, onProjectRoute, onTransitionStateChange }) {
  const pageRef = useRef(null)
  const timelineRef = useRef(null)
  const isAnimatingRef = useRef(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const beginProject = useCallback((projectId) => {
    const page = pageRef.current
    const selectedRow = page?.querySelector(`[data-project-id="${projectId}"]`)
    const columnHeadings = page?.querySelector('.project-columns')
    if (!page || !selectedRow || !columnHeadings || isAnimatingRef.current) return

    const selectedRect = selectedRow.getBoundingClientRect()
    const headingRect = columnHeadings.getBoundingClientRect()
    const rise = headingRect.top - selectedRect.top
    const otherRows = [...page.querySelectorAll('.work-row')].filter((row) => row !== selectedRow)

    isAnimatingRef.current = true
    setActiveProject(projectId)
    setIsAnimating(true)
    onTransitionStateChange(true)
    timelineRef.current?.kill()
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false
        setIsAnimating(false)
        onProjectRoute?.(projectId)
      },
    })
      .to(columnHeadings, { autoAlpha: 0, duration: 0.28, ease: 'power1.out' }, 0)
      .to(otherRows, { autoAlpha: 0, duration: 0.32, ease: 'power1.out' }, 0)
      .to(selectedRow, { y: rise, duration: 0.78, ease: 'power3.inOut' }, 0)
  }, [onProjectRoute, onTransitionStateChange, setActiveProject])

  useEffect(() => () => timelineRef.current?.kill(), [])

  const visibleDetailProjectId = routeProjectId || null

  useEffect(() => {
    if (!visibleDetailProjectId) return undefined
    onTransitionStateChange(false)
    const body = pageRef.current?.querySelector('.project-detail__body')
    if (!body) return undefined
    const reveal = gsap.fromTo(body,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    )
    return () => reveal.kill()
  }, [onTransitionStateChange, visibleDetailProjectId])

  const detailProject = projects.find((project) => project.id === visibleDetailProjectId)

  return (
    <section className={`work-page${detailProject ? ' work-page--detail' : ''}${isAnimating ? ' work-page--animating' : ''}`} aria-label={detailProject ? `${detailProject.client} project` : 'All work'} ref={pageRef} aria-busy={isAnimating}>
      {detailProject ? (
        <>
          <div key="project-metadata" className="project-detail__metadata" data-project-id={detailProject.id}>
            <span>{detailProject.id}</span>
            <span>{detailProject.client}</span>
            <span>{detailProject.project}</span>
            <span className="work-row__year">{detailProject.year}</span>
          </div>
          <div className="project-detail__body">
            {detailProject.image ? (
              <img className="project-detail__image" src={detailProject.image} alt={detailProject.imageAlt || `${detailProject.client} project`} />
            ) : (
              <div className="project-detail__image project-detail__image--missing">Add a project image to this entry</div>
            )}
            <p className="project-detail__description">{detailProject.description || 'Project description coming soon.'}</p>
          </div>
        </>
      ) : (
        <>
          <div key="project-columns" className="project-columns" aria-hidden="true">
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
            interactionDisabled={isAnimating}
            onProjectOpen={(event, projectId) => {
              event.preventDefault()
              beginProject(projectId)
            }}
          />
        </>
      )}
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
  const [activeSection, setActiveSection] = useState('experience')
  const [isMenuHovered, setIsMenuHovered] = useState(false)
  const sectionNames = ['experience', 'education', 'skills', 'connect']

  return (
    <section className="info-page" aria-label="About Martin Gama Jr">
      <nav className={`info-nav${isMenuHovered ? ' info-nav--hovering' : ''}`} aria-label="Info sections">
        <div className="info-nav__list" onPointerLeave={() => setIsMenuHovered(false)}>
          {sectionNames.map((name) => {
            const isActive = activeSection === name
            return (
              <button
                className={`info-nav__item${isActive ? ' info-nav__item--active' : ''}`}
                type="button"
                key={name}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActiveSection(name)}
                onPointerEnter={() => {
                  setActiveSection(name)
                  setIsMenuHovered(true)
                }}
                onFocus={() => setActiveSection(name)}
              >
                <span>{name}</span>
                <span className="info-nav__marker" aria-hidden="true">{'<'}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="info-panel" aria-live="polite">
        {activeSection === 'education' && (
          <div className="education-list">
            <EducationEntry school="University of California San Diego" degree="B.S Mathematics-Computer Science" years="2024-2026" />
            <EducationEntry school="Pasadena City College" degree="A.S-T Computer Science" years="2022-2024" />
          </div>
        )}
        {activeSection === 'experience' && (
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
        )}
        {activeSection === 'skills' && (
          <dl className="info-pairs">
            <dt>design</dt>
            <dd>Figma, Affinity Designer, TouchDesigner</dd>
            <dt>code</dt>
            <dd>HTML, CSS, Python, C++, ReactJS, Git, LaTeX</dd>
          </dl>
        )}
        {activeSection === 'connect' && (
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
        )}
      </div>

      <div className="info-column info-column--portrait">
        <img className="portrait-image" src={`${import.meta.env.BASE_URL}headshot.jpeg`} alt="Portrait of Martin Gama Jr" />
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
  const [activeProject, setActiveProject] = useState(() => getProjectFromRoute() || '000')
  const [currentPage, setCurrentPage] = useState(getCurrentPage)
  const homePageRef = useRef(null)
  const homeTimelineRef = useRef(null)
  const homeTransitionRef = useRef(false)
  const [isHomeTransitioning, setIsHomeTransitioning] = useState(false)
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const updatePageFromHistory = () => {
      setIsHomeTransitioning(false)
      setIsProjectTransitioning(false)
      setCurrentPage(getCurrentPage())
      setActiveProject(getProjectFromRoute() || '000')
    }
    window.addEventListener('popstate', updatePageFromHistory)
    return () => window.removeEventListener('popstate', updatePageFromHistory)
  }, [])

  function navigate(event, path) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const destination = `${import.meta.env.BASE_URL}#${path}`
    window.history.pushState({}, '', destination)
    setIsHomeTransitioning(false)
    setIsProjectTransitioning(false)
    setCurrentPage(getCurrentPage())
    setActiveProject(getProjectFromRoute() || '000')
  }

  const openProjectRoute = useCallback((projectId) => {
    window.history.pushState({}, '', `${import.meta.env.BASE_URL}#/work/${projectId}`)
    setIsHomeTransitioning(false)
    setIsProjectTransitioning(false)
    setCurrentPage('work')
    setActiveProject(projectId)
  }, [])

  function openProjectFromHome(event, projectId) {
    event.preventDefault()
    if (homeTransitionRef.current) return

    const page = homePageRef.current
    const selectedRow = page?.querySelector(`[data-project-id="${projectId}"]`)
    const heading = page?.querySelector('.featured-heading')
    if (!page || !selectedRow || !heading) {
      openProjectRoute(projectId)
      return
    }

    homeTransitionRef.current = true
    setIsHomeTransitioning(true)
    setIsProjectTransitioning(true)
    setActiveProject(projectId)

    const selectedTop = selectedRow.getBoundingClientRect().top
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const detailTop = headerBottom + rootFontSize * 1.5
    const otherRows = [...page.querySelectorAll('.work-row')].filter((row) => row !== selectedRow)
    const fadeAway = [heading, ...otherRows, page.querySelector('.home-preview'), page.querySelector('.brand-description')]
      .filter(Boolean)

    homeTimelineRef.current?.kill()
    homeTimelineRef.current = gsap.timeline({
      onComplete: () => {
        homeTransitionRef.current = false
        openProjectRoute(projectId)
      },
    })
      .to(fadeAway, { autoAlpha: 0, duration: 0.42, ease: 'power1.out' }, 0)
      .to(selectedRow, { y: detailTop - selectedTop, duration: 0.9, ease: 'power3.inOut' }, 0)
  }

  useEffect(() => () => homeTimelineRef.current?.kill(), [])

  const homeHref = `${import.meta.env.BASE_URL}#/`
  const workHref = `${import.meta.env.BASE_URL}#/work`
  const infoHref = `${import.meta.env.BASE_URL}#/info`

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}${isProjectTransitioning ? ' portfolio--transitioning' : ''}`}>
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

      <section className={`page-content page-content--${currentPage}${isHomeTransitioning ? ' home-page--transitioning' : ''}`} id="top" aria-label="Portfolio" ref={currentPage === 'home' ? homePageRef : undefined}>
        {currentPage === 'work' ? (
          <WorkPage
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            routeProjectId={getProjectFromRoute()}
            onProjectRoute={openProjectRoute}
            onTransitionStateChange={setIsProjectTransitioning}
          />
        ) : currentPage === 'info' ? (
          <InfoPage />
        ) : (
          <>
            <p className="brand-description">
              is a Mexican-American 
              multimedia creative / web developer<br />
              based out of Los Angeles County.
            </p>
            <div className="home-hero">
              <section className="featured-work" aria-label="Featured work">
                <div className="featured-heading">
                  <span>featured</span>
                  <span className="featured-toggle__rule" aria-hidden="true" />
                </div>
                <ProjectRows
                  entries={featuredProjects}
                  activeProject={activeProject}
                  setActiveProject={setActiveProject}
                  interactionDisabled={isHomeTransitioning}
                  onProjectOpen={openProjectFromHome}
                />
              </section>
              <HomeShowcase
                project={featuredProjects.find((project) => project.id === activeProject) || featuredProjects[0]}
                onProjectOpen={(event, projectId) => navigate(event, `/work/${projectId}`)}
              />
            </div>
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
