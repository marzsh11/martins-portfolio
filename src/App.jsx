import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { featuredProjects, projects } from './data/projects/index.js'
import './App.css'

const translations = {
  en: {
    nav: { work: 'work', info: 'info', contact: 'contact' },
    home: { featured: 'featured', addImage: 'Add a project image to this entry' },
    work: { all: 'All work', no: 'no.', title: 'title', project: 'project', year: 'year', back: 'back', addImage: 'Add a project image to this entry', addPhotos: 'Add project photos to this entry', comingSoon: 'Project description coming soon.' },
    info: {
      label: 'About Martin Gama Jr',
      sections: { experience: 'experience', education: 'education', skills: 'skills', connect: 'connect' },
      education: [
        { school: 'University of California San Diego', degree: 'B.S Mathematics-Computer Science', years: '2024-2026' },
        { school: 'Pasadena City College', degree: 'A.S-T Computer Science', years: '2022-2024' },
      ],
      experience: [
        { organization: 'KSDT Radio', role: 'Computer Engineer / Web Developer Intern', description: 'Developed and maintained responsive front-end components using React.js and CSS to execute key website redesign initiatives for KSDT Radio. Collaborated on UI/UX improvements that modernized the digital platform, streamlined navigation, and enhanced overall listener engagement.' },
        { organization: 'Out The Archive', role: 'Creative Space Interdisciplinary Collaborator', description: 'Collaborated within a student-led creative collective to conceptualize, style, and produce an original fashion short film from ideation to execution. Designed and showcased a custom garment look for the organization’s live runway show, blending visual storytelling with hands-on fashion design.' },
        { organization: 'Pasadena City College', role: 'Math Tutor', description: 'Translated complex concepts into accessible, step-by-step frameworks for STEM students at Pasadena City College. Leveraged active listening and adaptable communication to diagnose learning gaps, strengthen technical fluency, and accelerate student performance.' },
      ],
      skills: { design: 'design', code: 'code' },
      connect: { email: 'email', linkedin: 'linkedin', github: 'github', instagram: 'instagram' },
    },
    footer: { location: 'Los Angeles, California', dark: 'Switch to dark theme', light: 'Switch to light theme' },
    viewer: { image: 'image', page: 'page', of: 'of', open: 'Open image fullscreen', previous: 'Previous image', next: 'Next image', close: 'Close fullscreen viewer' },
  },
  es: {
    nav: { work: 'trabajo', info: 'info', contact: 'contacto' },
    home: { featured: 'destacado', addImage: 'Agrega una imagen del proyecto a esta entrada' },
    work: { all: 'Todos los proyectos', no: 'núm.', title: 'título', project: 'proyecto', year: 'año', back: 'volver', addImage: 'Agrega una imagen del proyecto a esta entrada', addPhotos: 'Agrega fotos del proyecto a esta entrada', comingSoon: 'Descripción del proyecto próximamente.' },
    info: {
      label: 'Acerca de Martin Gama Jr',
      sections: { experience: 'experiencia', education: 'educación', skills: 'habilidades', connect: 'contacto' },
      education: [
        { school: 'University of California San Diego', degree: 'B.S. Matemáticas y Ciencias de la Computación', years: '2024-2026' },
        { school: 'Pasadena City College', degree: 'A.S.-T. Ciencias de la Computación', years: '2022-2024' },
      ],
      experience: [
        { organization: 'KSDT Radio', role: 'Practicante de Ingeniería Informática y Desarrollo Web', description: 'Desarrollé y mantuve componentes de interfaz adaptables con React.js y CSS para llevar a cabo iniciativas clave de rediseño del sitio web de KSDT Radio. Colaboré en mejoras de UI/UX que modernizaron la plataforma digital, simplificaron la navegación y mejoraron la interacción de la audiencia.' },
        { organization: 'Out The Archive', role: 'Colaborador interdisciplinario de espacio creativo', description: 'Colaboré con un colectivo creativo dirigido por estudiantes para conceptualizar, diseñar y producir un cortometraje de moda original, desde la idea hasta su realización. Diseñé y presenté un atuendo personalizado para el desfile de la organización, combinando narrativa visual y diseño de moda práctico.' },
        { organization: 'Pasadena City College', role: 'Tutor de matemáticas', description: 'Convertí conceptos complejos en explicaciones accesibles y paso a paso para estudiantes de áreas STEM en Pasadena City College. Usé la escucha activa y una comunicación adaptable para detectar dificultades, fortalecer sus habilidades técnicas y acelerar su progreso académico.' },
      ],
      skills: { design: 'diseño', code: 'programación' },
      connect: { email: 'correo', linkedin: 'linkedin', github: 'github', instagram: 'instagram' },
    },
    footer: { location: 'Los Ángeles, California', dark: 'Cambiar al tema oscuro', light: 'Cambiar al tema claro' },
    viewer: { image: 'imagen', page: 'página', of: 'de', open: 'Abrir imagen en pantalla completa', previous: 'Imagen anterior', next: 'Imagen siguiente', close: 'Cerrar pantalla completa' },
  },
}

function getProjectText(project, field, language) {
  return project.translations?.[language]?.[field] ?? project[field]
}

function getLosAngelesTime(language = 'en') {
  return new Intl.DateTimeFormat(language === 'es' ? 'es-US' : 'en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(new Date())
}

function ThemeMark({ isInverted }) {
  return (
    <span className={`theme-mark${isInverted ? ' theme-mark--inverted' : ''}`} aria-hidden="true">
      <span className="theme-mark__disc theme-mark__disc--solid" />
      <span className="theme-mark__disc theme-mark__disc--outline" />
    </span>
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

function ProjectRows({ entries, activeProject, setActiveProject, onProjectOpen, interactionDisabled = false, language = 'en' }) {
  return (
    <div className="work-list">
      {entries.map((project) => {
        const isActive = activeProject === project.id
        const category = getProjectText(project, 'project', language)
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
            <span className="work-row__category">{category}</span>
            <span className="work-row__year">{project.year}</span>
            <span className="work-row__marker" aria-hidden="true">{isActive ? '<' : ''}</span>
          </button>
        )
      })}
    </div>
  )
}

function HomeShowcase({ project, onProjectOpen, language }) {
  if (!project) return null

  const href = `${import.meta.env.BASE_URL}#/work/${project.id}`
  return (
    <a
      className={`home-preview${project.image ? '' : ' home-preview--missing'}`}
      href={href}
      aria-label={`${language === 'es' ? 'Abrir el proyecto' : 'Open'} ${project.client}`}
      onClick={(event) => onProjectOpen(event, project.id)}
    >
      {project.image ? (
        <img className="home-preview__image" src={project.image} alt={project.imageAlt || `${project.client} project`} />
      ) : (
        <span className="home-preview__fallback">{translations[language].home.addImage}</span>
      )}
    </a>
  )
}

function ProjectCarousel({ project, isInverted, language = 'en' }) {
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
    return <div className="project-detail__image project-detail__image--missing">{translations[language].work.addImage}</div>
  }

  const setRelativePage = (offset) => {
    setPageIndex((index) => (index + offset + pages.length) % pages.length)
  }
  const currentPage = pages[pageIndex]
  const pageAlt = pages.length > 1
    ? `${project.client} ${getProjectText(project, 'project', language).toLowerCase()} ${translations[language].viewer.page} ${pageIndex + 1} ${translations[language].viewer.of} ${pages.length}`
    : project.imageAlt || `${project.client} project`
  const counter = `${String(pageIndex + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`
  const imageClass = `project-carousel__image${pages.length > 1 ? ' project-carousel__image--multiple' : ''}`

  return (
    <div className={`project-carousel${pages.length > 1 ? ' project-carousel--multiple' : ''}`}>
      <div className={`project-carousel__stage${pages.length > 1 ? ' project-carousel__stage--multiple' : ''}`}>
        <button className="project-carousel__open" type="button" onClick={() => setIsFullscreen(true)} aria-label={`${translations[language].viewer.open}: ${project.client}`}>
          <img className={imageClass} src={currentPage} alt={pageAlt} />
        </button>
        {pages.length > 1 && (
          <>
            <button className="project-carousel__arrow project-carousel__arrow--previous" type="button" onClick={() => setRelativePage(-1)} aria-label={translations[language].viewer.previous}>‹</button>
            <button className="project-carousel__arrow project-carousel__arrow--next" type="button" onClick={() => setRelativePage(1)} aria-label={translations[language].viewer.next}>›</button>
          </>
        )}
      </div>
      {pages.length > 1 && <div className="project-carousel__count" aria-live="polite">{counter}</div>}
      {isFullscreen && createPortal(
        <div className={`project-lightbox${isInverted ? ' project-lightbox--inverted' : ''}${pages.length === 1 ? ' project-lightbox--single' : ''}`} role="dialog" aria-modal="true" aria-label={`${project.client} image viewer`} onClick={(event) => {
          if (event.target === event.currentTarget) setIsFullscreen(false)
        }}>
          <button className="project-lightbox__close" type="button" onClick={() => setIsFullscreen(false)} aria-label={translations[language].viewer.close}>×</button>
          {pages.length > 1 && <button className="project-lightbox__arrow project-lightbox__arrow--previous" type="button" onClick={() => setRelativePage(-1)} aria-label={translations[language].viewer.previous}>‹</button>}
          <figure className="project-lightbox__figure">
            <img className="project-lightbox__image" src={currentPage} alt={pageAlt} />
            {pages.length > 1 && <figcaption>{counter}</figcaption>}
          </figure>
          {pages.length > 1 && <button className="project-lightbox__arrow project-lightbox__arrow--next" type="button" onClick={() => setRelativePage(1)} aria-label={translations[language].viewer.next}>›</button>}
        </div>,
        document.body,
      )}
    </div>
  )
}

function ProjectMasonry({ project, isInverted, language = 'en' }) {
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
    return <div className="project-detail__image project-detail__image--missing">{translations[language].work.addPhotos}</div>
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
          aria-label={`${translations[language].viewer.open} ${index + 1} ${translations[language].viewer.of} ${images.length} ${project.client}`}
        >
          <img src={image.src} alt={image.alt} loading={index > 1 ? 'lazy' : 'eager'} />
        </button>
      ))}
      {isOpen && createPortal(
        <div className={`project-lightbox${isInverted ? ' project-lightbox--inverted' : ''}`} role="dialog" aria-modal="true" aria-label={`${project.client} photo viewer`} onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedIndex(null)
        }}>
          <button className="project-lightbox__close" type="button" onClick={() => setSelectedIndex(null)} aria-label={translations[language].viewer.close}>×</button>
          <button className="project-lightbox__arrow project-lightbox__arrow--previous" type="button" onClick={() => moveSelection(-1)} aria-label={translations[language].viewer.previous}>‹</button>
          <figure className="project-lightbox__figure">
            <img className="project-lightbox__image" src={selectedImage.src} alt={selectedImage.alt} />
            <figcaption>{counter}</figcaption>
          </figure>
          <button className="project-lightbox__arrow project-lightbox__arrow--next" type="button" onClick={() => moveSelection(1)} aria-label={translations[language].viewer.next}>›</button>
        </div>,
        document.body,
      )}
    </div>
  )
}

function WorkPage({ activeProject, setActiveProject, routeProjectId, onProjectOpen, onBack, isInverted, language = 'en' }) {
  const visibleDetailProjectId = routeProjectId || null

  const detailProject = projects.find((project) => project.id === visibleDetailProjectId)
  const projectCategory = detailProject ? getProjectText(detailProject, 'project', language) : ''
  const projectDescription = detailProject
    ? getProjectText(detailProject, 'description', language) || translations[language].work.comingSoon
    : ''

  return (
    <section
      className={`work-page${detailProject ? ' work-page--detail' : ''}${detailProject?.gallery?.length ? ' work-page--detail-gallery' : ''}`}
      aria-label={detailProject ? `${detailProject.client} ${translations[language].work.project}` : translations[language].work.all}
    >
      {detailProject ? (
        <>
          <div className="project-detail__copy">
            <div key="project-metadata" className="project-detail__metadata" data-project-id={detailProject.id}>
              <span className="project-detail__index">{detailProject.id}</span>
              <span className="project-detail__title">{detailProject.client}</span>
              <span className="project-detail__category">{projectCategory}</span>
              <span className="project-detail__year">{detailProject.year}</span>
            </div>
            <p className="project-detail__description">{projectDescription}</p>
            {detailProject.externalLink && (
              <a className="project-detail__external-link" href={detailProject.externalLink} target="_blank" rel="noreferrer">
                {detailProject.externalLink.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
              </a>
            )}
            <button className="project-detail__back" type="button" onClick={onBack}>
              {'< '}{translations[language].work.back}
            </button>
          </div>
          <div className="project-detail__media">
            {detailProject.gallery?.length
              ? <ProjectMasonry key={detailProject.id} project={detailProject} isInverted={isInverted} language={language} />
              : <ProjectCarousel key={detailProject.id} project={detailProject} isInverted={isInverted} language={language} />}
          </div>
        </>
      ) : (
        <div className="work-page__index">
          <div key="project-columns" className="project-columns" aria-hidden="true">
            <span>{translations[language].work.no}</span>
            <span>{translations[language].work.title}</span>
            <span>{translations[language].work.project}</span>
            <span>{translations[language].work.year}</span>
            <span />
          </div>
          <ProjectRows
            entries={projects}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            onProjectOpen={onProjectOpen}
            language={language}
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

function InfoPage({ language = 'en' }) {
  const [activeSection, setActiveSection] = useState('experience')
  const [hoveredSection, setHoveredSection] = useState(null)
  const content = translations[language].info
  const sectionNames = ['experience', 'education', 'skills', 'connect']

  return (
    <section className="info-page" aria-label={content.label}>
      <div className="info-overview">
        <nav
          className={`info-nav${hoveredSection ? ' info-nav--hovering' : ''}`}
          aria-label="Info sections"
          onPointerLeave={() => setHoveredSection(null)}
        >
          <div className="info-nav__list">
            {sectionNames.map((name) => {
              const isActive = activeSection === name
              return (
                <button
                  className={`info-nav__item${isActive ? ' info-nav__item--active' : ''}${hoveredSection === name ? ' info-nav__item--hovered' : ''}`}
                  type="button"
                  key={name}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveSection(name)}
                  onPointerEnter={() => setHoveredSection(name)}
                >
                  <span>{content.sections[name]}</span>
                  <span className="info-nav__marker" aria-hidden="true">{'<'}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="info-panel" aria-live="polite">
          {activeSection === 'education' && (
            <div className="education-list">
              {content.education.map((entry) => <EducationEntry key={entry.school} {...entry} />)}
            </div>
          )}
          {activeSection === 'experience' && (
            <div className="experience-list">
              {content.experience.map((entry) => (
                <ExperienceEntry key={`${entry.organization}-${entry.role}`} organization={entry.organization} role={entry.role}>
                  {entry.description}
                </ExperienceEntry>
              ))}
            </div>
          )}
          {activeSection === 'skills' && (
            <dl className="info-pairs">
              <dt>{content.skills.design}</dt>
              <dd>Figma, Affinity Designer, TouchDesigner, Garment Pattern Making/Construction</dd>
              <dt>{content.skills.code}</dt>
              <dd>HTML, CSS, Python, C++, ReactJS, Git, LaTeX</dd>
            </dl>
          )}
          {activeSection === 'connect' && (
            <dl className="info-pairs info-pairs--connect">
              <dt>{content.connect.email}</dt>
              <dd><a href="mailto:martingama2100@gmail.com">martingama2100@gmail.com</a></dd>
              <dt>{content.connect.linkedin}</dt>
              <dd><a href="https://www.linkedin.com/in/jrmartingama/" target="_blank" rel="noreferrer">jrmartingama</a></dd>
              <dt>{content.connect.github}</dt>
              <dd><a href="https://github.com/marzsh11" target="_blank" rel="noreferrer">marzsh11</a></dd>
              <dt>{content.connect.instagram}</dt>
              <dd><a href="https://www.instagram.com/icedlattepounder/" target="_blank" rel="noreferrer">icedlattepounder</a></dd>
            </dl>
          )}
        </div>
      </div>

    </section>
  )
}

function App() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem('portfolio-language') === 'es' ? 'es' : 'en')
  const [time, setTime] = useState(() => getLosAngelesTime(language))
  const [isInverted, setIsInverted] = useState(() => window.localStorage.getItem('portfolio-theme') === 'light')
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
    document.documentElement.lang = language
    window.localStorage.setItem('portfolio-language', language)
    const intervalId = window.setInterval(() => setTime(getLosAngelesTime(language)), 1000)
    return () => window.clearInterval(intervalId)
  }, [language])

  useEffect(() => {
    window.localStorage.setItem('portfolio-theme', isInverted ? 'light' : 'dark')
  }, [isInverted])

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
  const copy = translations[language]

  return (
    <main className={`portfolio${isInverted ? ' portfolio--inverted' : ''}`}>
      <header className="site-header">
        <a className="brand" href={homeHref} onClick={(event) => navigate(event, '/')} aria-label={`Martin Gama Jr ${language === 'es' ? 'inicio' : 'home'}`}>Martin Gama Jr</a>
        <div className="header-actions">
          <nav className="primary-nav" aria-label="Main navigation">
            <a href={workHref} onClick={(event) => navigate(event, '/work')} aria-current={currentPage === 'work' ? 'page' : undefined}>{copy.nav.work}</a>
            <a href={infoHref} onClick={(event) => navigate(event, '/info')} aria-current={currentPage === 'info' ? 'page' : undefined}>{copy.nav.info}</a>
          </nav>
          <a
            className="contact"
            href="mailto:martingama2100@gmail.com"
            onMouseEnter={() => setIsContactExpanded(true)}
            onMouseLeave={() => setIsContactExpanded(false)}
            onFocus={() => setIsContactExpanded(true)}
            onBlur={() => setIsContactExpanded(false)}
          >
            <span className="contact__text">{isContactExpanded ? 'martingama2100@gmail.com' : copy.nav.contact}</span>
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
            onBack={(event) => navigate(event, '/work')}
            isInverted={isInverted}
            language={language}
          />
        ) : currentPage === 'info' ? (
          <InfoPage language={language} />
        ) : (
          <>
            <p className="brand-description">
              {language === 'es'
                ? <>es un creativo multimedia mexicano-estadounidense / <span className="brand-description__role">desarrollador full stack</span><br />ubicado en el condado de Los Ángeles.</>
                : <>is a Mexican-American multimedia creative / <span className="brand-description__role">full stack developer</span><br />based out of Los Angeles County.</>}
            </p>
            <div className="home-hero">
              <section className="featured-work" aria-label={copy.home.featured}>
                <div className="featured-heading">
                  <span>{copy.home.featured}</span>
                  <span className="featured-toggle__rule" aria-hidden="true" />
                </div>
                <ProjectRows
                  entries={featuredProjects}
                  activeProject={activeProject}
                  setActiveProject={setActiveProject}
                  onProjectOpen={(event, projectId) => navigate(event, `/work/${projectId}`)}
                  language={language}
                />
              </section>
              <HomeShowcase
                project={featuredProjects.find((project) => project.id === activeProject) || featuredProjects[0]}
                onProjectOpen={(event, projectId) => navigate(event, `/work/${projectId}`)}
                language={language}
              />
            </div>
          </>
        )}
        <span className="visually-hidden" id="info">About Martin Gama Jr</span>
      </section>

      <footer className="site-footer">
        <div className="footer-meta">
          <span>{copy.footer.location}</span>
          <time>{time}</time>
        </div>
        <div className="footer-language" role="group" aria-label={language === 'es' ? 'Idioma' : 'Language'}>
          <button className={language === 'en' ? 'footer-language__active' : ''} type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>en</button>
          <span aria-hidden="true">/</span>
          <button className={language === 'es' ? 'footer-language__active' : ''} type="button" aria-pressed={language === 'es'} onClick={() => setLanguage('es')}>es</button>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-label={isInverted ? copy.footer.dark : copy.footer.light}
          aria-pressed={isInverted}
          onClick={() => setIsInverted((current) => !current)}
        >
          <ThemeMark isInverted={isInverted} />
        </button>
      </footer>
    </main>
  )
}

export default App
