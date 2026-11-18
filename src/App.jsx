import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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

function createLetterFlights(sourceRow, layer, deltaX, deltaY) {
  const flights = []
  const rowOpacity = Number.parseFloat(getComputedStyle(sourceRow).opacity) || 1
  const walker = document.createTreeWalker(sourceRow, NodeFilter.SHOW_TEXT)
  let textNode = walker.nextNode()

  while (textNode) {
    const text = textNode.textContent || ''
    const cell = textNode.parentElement
    const cellStyle = getComputedStyle(cell)
    const range = document.createRange()

    for (let offset = 0; offset < text.length;) {
      const character = String.fromCodePoint(text.codePointAt(offset))
      const nextOffset = offset + character.length
      range.setStart(textNode, offset)
      range.setEnd(textNode, nextOffset)
      const rect = range.getBoundingClientRect()

      if (rect.height > 0 && !cell?.closest('.work-row__marker')) {
        const flyer = document.createElement('span')
        flyer.className = 'home-letter-flight'
        flyer.textContent = character
        flyer.setAttribute('aria-hidden', 'true')
        Object.assign(flyer.style, {
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          color: cellStyle.color,
          font: cellStyle.font,
          fontKerning: cellStyle.fontKerning,
          letterSpacing: cellStyle.letterSpacing,
          lineHeight: cellStyle.lineHeight,
          opacity: String(rowOpacity),
        })
        layer.appendChild(flyer)

        const startX = rect.left
        const startY = rect.top
        const targetX = startX + deltaX
        const targetY = startY + deltaY
        const dx = deltaX
        const dy = deltaY
        const bend = Math.max(2.5 * parseFloat(cellStyle.fontSize), Math.min(8 * parseFloat(cellStyle.fontSize), Math.hypot(dx, dy) * 0.16))
        flights.push({
          element: flyer,
          startX,
          startY,
          controlX: startX + dx * 0.52 + (startX - targetX) * 0.1,
          controlY: Math.min(startY, targetY) - bend,
          targetX,
          targetY,
          progress: { value: 0 },
        })
      }

      offset = nextOffset
    }

    textNode = walker.nextNode()
  }

  return flights.sort((a, b) => (b.startX - a.startX) || (a.startY - b.startY))
}

function WorkPage({ activeProject, setActiveProject, routeProjectId, onProjectRoute, onProjectDetailReady, onTransitionStateChange }) {
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
    const pageRect = page.getBoundingClientRect()
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const detailHeaderGap = parseFloat(getComputedStyle(page).getPropertyValue('--detail-header-gap')) * rootFontSize
    const rise = pageRect.top + detailHeaderGap - selectedRect.top
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

  useLayoutEffect(() => {
    if (visibleDetailProjectId) onProjectDetailReady?.()
  }, [onProjectDetailReady, visibleDetailProjectId])

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
    <section
      className={`work-page${detailProject ? ' work-page--detail' : ''}${isAnimating ? ' work-page--animating' : ''}`}
      aria-label={detailProject ? `${detailProject.client} project` : 'All work'}
      ref={pageRef}
      aria-busy={isAnimating}
    >
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
        <div className="work-page__index">
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
        </div>
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
        <img className="portrait-image" src={`${import.meta.env.BASE_URL}headshot.jpeg`} alt="Portrait of Martin Gama Jr" width="5079" height="3386" decoding="async" />
        <p className="portrait-caption">
          Martin Gama Jr is a Mexican-American multimedia creative and web developer based in Los Angeles County.
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
  const pageContentRef = useRef(null)
  const pageNavigationTimelineRef = useRef(null)
  const pageTransitionGuardRef = useRef(false)
  const pageFadeInPendingRef = useRef(false)
  const [pageFadeInKey, setPageFadeInKey] = useState(0)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const homePageRef = useRef(null)
  const homeTimelineRef = useRef(null)
  const homeFlightLayerRef = useRef(null)
  const homeTransitionRef = useRef(false)
  const [isHomeTransitioning, setIsHomeTransitioning] = useState(false)
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useLayoutEffect(() => {
    if (!pageFadeInPendingRef.current) return
    const pageContent = pageContentRef.current
    if (!pageContent) return

    pageNavigationTimelineRef.current?.kill()
    pageNavigationTimelineRef.current = gsap.fromTo(pageContent,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.28,
        ease: 'power1.out',
        onComplete: () => {
          pageFadeInPendingRef.current = false
          pageTransitionGuardRef.current = false
          setIsPageTransitioning(false)
        },
      },
    )
  }, [pageFadeInKey])

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
    if (window.location.hash === `#${path}` || pageTransitionGuardRef.current) return

    pageTransitionGuardRef.current = true
    setIsPageTransitioning(true)
    const pageContent = pageContentRef.current

    const commitPageChange = () => {
      window.history.pushState({}, '', destination)
      setIsHomeTransitioning(false)
      setIsProjectTransitioning(false)
      setCurrentPage(getCurrentPage())
      setActiveProject(getProjectFromRoute() || '000')
      pageFadeInPendingRef.current = true
      setPageFadeInKey((key) => key + 1)
    }

    if (!pageContent) {
      commitPageChange()
      return
    }

    pageNavigationTimelineRef.current?.kill()
    pageNavigationTimelineRef.current = gsap.to(pageContent, {
      autoAlpha: 0,
      duration: 0.18,
      ease: 'power1.out',
      onComplete: commitPageChange,
    })
  }

  const openProjectRoute = useCallback((projectId) => {
    window.history.pushState({}, '', `${import.meta.env.BASE_URL}#/work/${projectId}`)
    setIsHomeTransitioning(false)
    setIsProjectTransitioning(false)
    setCurrentPage('work')
    setActiveProject(projectId)
  }, [])

  const releaseHomeFlightLayer = useCallback(() => {
    homeFlightLayerRef.current?.remove()
    homeFlightLayerRef.current = null
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

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const detailGap = parseFloat(getComputedStyle(page).getPropertyValue('--detail-header-gap')) * rootFontSize
    const selectedRect = selectedRow.getBoundingClientRect()
    const targetRowLeft = (window.innerWidth - selectedRect.width) / 2
    const targetRowTop = page.getBoundingClientRect().top + detailGap
    const deltaX = targetRowLeft - selectedRect.left
    const deltaY = targetRowTop - selectedRect.top
    const layer = document.createElement('div')
    layer.className = 'home-letter-flight-layer'
    layer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(layer)
    homeFlightLayerRef.current = layer

    const flights = createLetterFlights(selectedRow, layer, deltaX, deltaY)
    if (flights.length === 0) {
      layer.remove()
      homeFlightLayerRef.current = null
      homeTransitionRef.current = false
      openProjectRoute(projectId)
      return
    }

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
      .set([...fadeAway, selectedRow], { transition: 'none' }, 0)
      .to(fadeAway, { autoAlpha: 0, duration: 0.363375, ease: 'power1.out' }, 0)
      .to(selectedRow, { autoAlpha: 0, duration: 0.0855, ease: 'none' }, 0)

    const characterDuration = 0.7695
    const characterStagger = 0.0149625
    flights.forEach((flight, index) => {
      homeTimelineRef.current.to(flight.progress, {
        value: 1,
        duration: characterDuration,
        ease: 'power2.in',
        onUpdate: () => {
          const t = flight.progress.value
          const inverse = 1 - t
          const x = inverse * inverse * flight.startX
            + 2 * inverse * t * flight.controlX
            + t * t * flight.targetX
          const y = inverse * inverse * flight.startY
            + 2 * inverse * t * flight.controlY
            + t * t * flight.targetY
          gsap.set(flight.element, {
            x: x - flight.startX,
            y: y - flight.startY,
          })
        },
      }, index * characterStagger)
    })

    homeTimelineRef.current.to({}, { duration: 0.3 })
  }

  useEffect(() => () => {
    homeTimelineRef.current?.kill()
    homeFlightLayerRef.current?.remove()
  }, [])

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

      <section className={`page-content page-content--${currentPage}${isHomeTransitioning ? ' home-page--transitioning' : ''}${isPageTransitioning ? ' page-content--transitioning' : ''}`} id="top" aria-label="Portfolio" ref={(element) => {
        pageContentRef.current = element
        if (currentPage === 'home') homePageRef.current = element
      }}>
        {currentPage === 'work' ? (
          <WorkPage
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            routeProjectId={getProjectFromRoute()}
            onProjectRoute={openProjectRoute}
            onProjectDetailReady={releaseHomeFlightLayer}
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
