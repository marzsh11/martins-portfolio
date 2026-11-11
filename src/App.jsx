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

function App() {
  const [time, setTime] = useState(getLosAngelesTime)
  const [isInverted, setIsInverted] = useState(false)

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
        <span className="visually-hidden" id="work">Selected work</span>
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
