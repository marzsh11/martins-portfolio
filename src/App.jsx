import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

function ProjectCarousel({ project, isInverted }) {
  const pages = project.pages?.length ? project.pages : project.image ? [project.image] : []
  const [pageIndex, setPageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isFullscreen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsFullscreen(false)
      if (event.key === 'ArrowLeft' && pages.length > 1) {
        event.preventDefault()
        setPageIndex((index) => (index - 1 + pages.length) % pages.length)
      }
      if (event.key === 'ArrowRight' && pages.length > 1) {
        event.preventDefault()
        setPageIndex((index) => (index + 1) % pages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, pages.length])

  if (!pages.length) {
    return <div className="project-detail__image project-detail__image--missing">Add a project image to this entry</div>
  }

  const setRelativePage = (offset) => {
    setPageIndex((index) => (index + offset + pages.length) % pages.length)
  }
  const currentPage = pages[pageIndex]
  const pageAlt = pages.length > 1
    ? `${project.client} ${project.project.toLowerCase()} page ${pageIndex + 1} of ${pages.length}`
    : project.imageAlt || `${project.client} project`
  const counter = `${String(pageIndex + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`
  const imageClass = `project-carousel__image${pages.length > 1 ? ' project-carousel__image--multiple' : ''}`

  return (
    <div className={`project-carousel${pages.length > 1 ? ' project-carousel--multiple' : ''}`}>
      <div className={`project-carousel__stage${pages.length > 1 ? ' project-carousel__stage--multiple' : ''}`}>
        <button className="project-carousel__open" type="button" onClick={() => setIsFullscreen(true)} aria-label={`Open ${project.client} image fullscreen`}>
          <img className={imageClass} src={currentPage} alt={pageAlt} />
        </button>
        {pages.length > 1 && (
          <>
            <button className="project-carousel__arrow project-carousel__arrow--previous" type="button" onClick={() => setRelativePage(-1)} aria-label="Previous page">‹</button>
            <button className="project-carousel__arrow project-carousel__arrow--next" type="button" onClick={() => setRelativePage(1)} aria-label="Next page">›</button>
          </>
        )}
      </div>
      {pages.length > 1 && <div className="project-carousel__count" aria-live="polite">{counter}</div>}
      {isFullscreen && createPortal(
        <div className={`project-lightbox${isInverted ? ' project-lightbox--inverted' : ''}${pages.length === 1 ? ' project-lightbox--single' : ''}`} role="dialog" aria-modal="true" aria-label={`${project.client} image viewer`} onClick={(event) => {
          if (event.target === event.currentTarget) setIsFullscreen(false)
        }}>
          <button className="project-lightbox__close" type="button" onClick={() => setIsFullscreen(false)} aria-label="Close fullscreen viewer">×</button>
          {pages.length > 1 && <button className="project-lightbox__arrow" type="button" onClick={() => setRelativePage(-1)} aria-label="Previous page">‹</button>}
          <figure className="project-lightbox__figure">
            <img className="project-lightbox__image" src={currentPage} alt={pageAlt} />
            {pages.length > 1 && <figcaption>{counter}</figcaption>}
          </figure>
          {pages.length > 1 && <button className="project-lightbox__arrow" type="button" onClick={() => setRelativePage(1)} aria-label="Next page">›</button>}
        </div>,
        document.body,
      )}
    </div>
  )
}

function ProjectMasonry({ project, isInverted }) {
  const images = project.gallery || []
  const [selectedIndex, setSelectedIndex] = useState(null)
  const isOpen = selectedIndex !== null

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSelectedIndex((index) => (index - 1 + images.length) % images.length)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSelectedIndex((index) => (index + 1) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, images.length])

  if (!images.length) {
    return <div className="project-detail__image project-detail__image--missing">Add project photos to this entry</div>
  }

  const selectedImage = isOpen ? images[selectedIndex] : null
  const moveSelection = (offset) => {
    setSelectedIndex((index) => (index + offset + images.length) % images.length)
  }
  const counter = isOpen
    ? `${String(selectedIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`
    : ''

  return (
    <div className="project-masonry">
      {images.map((image, index) => (
        <button
          className="project-masonry__item"
          type="button"
          key={image.src}
          onClick={() => setSelectedIndex(index)}
          aria-label={`Open image ${index + 1} of ${images.length} from ${project.client}`}
        >
          <img src={image.src} alt={image.alt} loading={index > 1 ? 'lazy' : 'eager'} />
        </button>
      ))}
      {isOpen && createPortal(
        <div className={`project-lightbox${isInverted ? ' project-lightbox--inverted' : ''}`} role="dialog" aria-modal="true" aria-label={`${project.client} photo viewer`} onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedIndex(null)
        }}>
          <button className="project-lightbox__close" type="button" onClick={() => setSelectedIndex(null)} aria-label="Close fullscreen viewer">×</button>
          <button className="project-lightbox__arrow" type="button" onClick={() => moveSelection(-1)} aria-label="Previous image">‹</button>
          <figure className="project-lightbox__figure">
            <img className="project-lightbox__image" src={selectedImage.src} alt={selectedImage.alt} />
            <figcaption>{counter}</figcaption>
          </figure>
          <button className="project-lightbox__arrow" type="button" onClick={() => moveSelection(1)} aria-label="Next image">›</button>
        </div>,
        document.body,
      )}
    </div>
  )
}

function WorkPage({ activeProject, setActiveProject, routeProjectId, onProjectOpen, isInverted }) {
  const visibleDetailProjectId = routeProjectId || null

  const detailProject = projects.find((project) => project.id === visibleDetailProjectId)

  return (
    <section
      className={`work-page${detailProject ? ' work-page--detail' : ''}${detailProject?.gallery?.length ? ' work-page--detail-gallery' : ''}`}
      aria-label={detailProject ? `${detailProject.client} project` : 'All work'}
    >
      {detailProject ? (
        <>
          <div className="project-detail__copy">
            <div key="project-metadata" className="project-detail__metadata" data-project-id={detailProject.id}>
              <span className="project-detail__index">{detailProject.id}</span>
              <span className="project-detail__title">{detailProject.client}</span>
              <span className="project-detail__category">{detailProject.project}</span>
              <span className="project-detail__year">{detailProject.year}</span>
            </div>
            <p className="project-detail__description">{detailProject.description || 'Project description coming soon.'}</p>
          </div>
          <div className="project-detail__media">
            {detailProject.gallery?.length
              ? <ProjectMasonry key={detailProject.id} project={detailProject} isInverted={isInverted} />
              : <ProjectCarousel key={detailProject.id} project={detailProject} isInverted={isInverted} />}
          </div>
        </>
      ) : (
        <div className="work-page__index">
          <div key="project-columns" className="project-columns" aria-hidden="true">
            <span>no.</span>
            <span>title</span>
            <span>project</span>
            <span>year</span>
            <span />
          </div>
          <ProjectRows
            entries={projects}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            onProjectOpen={onProjectOpen}
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
      <div className="info-overview">
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
      </div>

    </section>
  )
}

function App() {
  const [time, setTime] = useState(getLosAngelesTime)
  const [isInverted, setIsInverted] = useState(false)
  const [isContactExpanded, setIsContactExpanded] = useState(false)
  const [activeProject, setActiveProject] = useState(() => getProjectFromRoute() || '000')
  const [currentPage, setCurrentPage] = useState(getCurrentPage)
  const pageContentRef = useRef(null)
  const pageNavigationTimelineRef = useRef(null)
  const pageTransitionGuardRef = useRef(false)
  const pageFadeInPendingRef = useRef(false)
  const [pageFadeInKey, setPageFadeInKey] = useState(0)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)

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
      if (pageContentRef.current) pageContentRef.current.scrollTop = 0
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
      if (pageContentRef.current) pageContentRef.current.scrollTop = 0
      window.history.pushState({}, '', destination)
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

  const homeHref = `${import.meta.env.BASE_URL}#/`
  const workHref = `${import.meta.env.BASE_URL}#/work`
  const infoHref = `${import.meta.env.BASE_URL}#/info`

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}`}>
      <header className="site-header">
        <a className="brand" href={homeHref} onClick={(event) => navigate(event, '/')} aria-label="Martin Gama Jr home">Martin Gama Jr</a>
        <div className="header-actions">
          <nav className="primary-nav" aria-label="Main navigation">
            <a href={workHref} onClick={(event) => navigate(event, '/work')} aria-current={currentPage === 'work' ? 'page' : undefined}>work</a>
            <a href={infoHref} onClick={(event) => navigate(event, '/info')} aria-current={currentPage === 'info' ? 'page' : undefined}>info</a>
          </nav>
          <a
            className="contact"
            href="mailto:martingama2100@gmail.com"
            onMouseEnter={() => setIsContactExpanded(true)}
            onMouseLeave={() => setIsContactExpanded(false)}
            onFocus={() => setIsContactExpanded(true)}
            onBlur={() => setIsContactExpanded(false)}
          >
            <span className="contact__text">{isContactExpanded ? 'martingama2100@gmail.com' : 'contact'}</span>
          </a>
        </div>
      </header>

      <section className={`page-content page-content--${currentPage}${currentPage === 'work' && getProjectFromRoute() ? ' page-content--work-detail' : ''}${isPageTransitioning ? ' page-content--transitioning' : ''}`} id="top" aria-label="Portfolio" ref={pageContentRef}>
        {currentPage === 'work' ? (
          <WorkPage
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            routeProjectId={getProjectFromRoute()}
            onProjectOpen={(event, projectId) => navigate(event, `/work/${projectId}`)}
            isInverted={isInverted}
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
                  onProjectOpen={(event, projectId) => navigate(event, `/work/${projectId}`)}
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
