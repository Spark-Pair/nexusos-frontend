import {
  Bell,
  Check,
  ChevronLeft,
  Clock3,
  History,
  ListChecks,
  Megaphone,
  MessageCircle,
  Moon,
  Sun,
  UserRound
} from 'lucide-react'
import { useState } from 'react'
import './theme-preview.css'

const palettes = [
  { id: 'green', label: 'Green', source: 'Current NexusOS' },
  { id: 'blue', label: 'Blue', source: 'GitHub Primer' },
  { id: 'orange', label: 'Orange', source: 'Bright orange' }
] as const

type Palette = (typeof palettes)[number]['id']
type PreviewMode = 'dark' | 'light'

export default function ThemePreviewPage() {
  const [palette, setPalette] = useState<Palette>('green')
  const [mode, setMode] = useState<PreviewMode>('dark')
  return (
    <div className="theme-preview" data-palette={palette} data-mode={mode}>
      <aside className="theme-preview-sidebar">
        <a className="theme-preview-brand" href="/app/chats">
          <span className="theme-preview-mark">N</span>
          <span>
            <strong>NexusOS</strong>
            <small>Business workspace</small>
          </span>
        </a>
        <nav className="theme-preview-navigation" aria-label="Workspace">
          <div className="theme-preview-nav-item">
            <MessageCircle /> Chats
          </div>
          <div className="theme-preview-nav-item">
            <ListChecks /> Broadcast lists
          </div>
          <div className="theme-preview-nav-item">
            <Megaphone /> New broadcast
          </div>
          <div className="theme-preview-nav-item">
            <History /> Broadcast history
          </div>
        </nav>
        <div className="theme-preview-sidebar-footer">
          <div className="theme-preview-nav-item active">
            <UserRound /> Profile &amp; settings
          </div>
          <div className="theme-preview-account">
            <span className="theme-preview-avatar">SP</span>
            <span>
              <strong>SparkPair Test</strong>
              <small>Profile &amp; settings</small>
            </span>
          </div>
        </div>
      </aside>

      <main className="theme-preview-main">
        <header className="theme-preview-toolbar">
          <div>
            <span className="theme-preview-eyebrow">NexusOS appearance</span>
            <h1>Theme preview</h1>
          </div>
          <div className="theme-preview-controls">
            <div
              className="theme-preview-selector"
              role="group"
              aria-label="Choose preview palette"
            >
              {palettes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={palette === option.id}
                  onClick={() => setPalette(option.id)}
                >
                  <span className={`theme-preview-swatch ${option.id}`} aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
            <div
              className="theme-preview-selector theme-preview-mode"
              role="group"
              aria-label="Choose preview appearance"
            >
              <button
                type="button"
                aria-pressed={mode === 'light'}
                onClick={() => setMode('light')}
              >
                <Sun aria-hidden="true" /> Light
              </button>
              <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>
                <Moon aria-hidden="true" /> Dark
              </button>
            </div>
          </div>
        </header>

        <div className="theme-preview-content">
          <button className="theme-preview-back" type="button">
            <ChevronLeft aria-hidden="true" /> Settings
          </button>
          <div className="theme-preview-heading">
            <div className="theme-preview-section-icon">
              <Bell aria-hidden="true" />
            </div>
            <div>
              <span className="theme-preview-eyebrow">Preferences</span>
              <h2>Notifications</h2>
            </div>
          </div>

          <section className="theme-preview-settings" aria-label="Notification settings preview">
            <div className="theme-preview-setting-row">
              <div className="theme-preview-setting-icon">
                <Bell aria-hidden="true" />
              </div>
              <div className="theme-preview-setting-copy">
                <h3>Browser notifications</h3>
                <p>
                  Receive new message alerts on this device. Your browser controls final permission.
                </p>
                <span className="theme-preview-status">
                  <Check aria-hidden="true" /> Enabled on this browser
                </span>
              </div>
              <button className="theme-preview-enabled" type="button" disabled>
                Notifications enabled
              </button>
            </div>

            <div className="theme-preview-divider" />

            <div className="theme-preview-setting-row quiet-row">
              <div className="theme-preview-setting-icon">
                <Moon aria-hidden="true" />
              </div>
              <div className="theme-preview-setting-copy">
                <h3>Quiet hours</h3>
                <p>Pause message alerts on a schedule. Messages will still arrive as usual.</p>
              </div>
              <label className="theme-preview-switch">
                <input type="checkbox" />
                <span className="theme-preview-switch-track" />
                <span className="theme-preview-switch-label">Pause notifications</span>
              </label>
            </div>

            <div className="theme-preview-divider" />

            <div className="theme-preview-setting-footer">
              <span>
                <Clock3 aria-hidden="true" /> Quiet hours use this device's timezone.
              </span>
              <button type="button" className="theme-preview-save">
                Save changes
              </button>
            </div>
          </section>
          <p className="theme-preview-footnote">
            {palettes.find((item) => item.id === palette)?.source} palette | Preview only
          </p>
        </div>

        <nav className="theme-preview-mobile-nav" aria-label="Mobile navigation preview">
          <span>
            <MessageCircle /> Chats
          </span>
          <span>
            <ListChecks /> Lists
          </span>
          <span>
            <Megaphone /> Send
          </span>
          <span>
            <UserRound /> Profile
          </span>
        </nav>
      </main>
    </div>
  )
}
