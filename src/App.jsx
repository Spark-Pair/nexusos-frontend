import { useState } from 'react'
import './App.css'

const conversations = [
  ['AK', 'Ali Khan', 'Can you share the updated price?', '2m'],
  ['SA', 'Sara Ahmed', 'Thank you!', '18m'],
  ['HR', 'Hamza Raza', 'I received the broadcast.', '1h'],
  ['AN', 'Ayesha Noor', 'Perfect, I will check it.', '3h'],
  ['UM', 'Usman Malik', 'Image', 'Yesterday'],
]

function NavIcon({ children, active, label }) {
  return <button className={`nav-icon ${active ? 'active' : ''}`} aria-label={label}>{children}</button>
}

function App() {
  const [selected, setSelected] = useState(0)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-label="NexusOS">N</div>
        <nav className="nav-stack" aria-label="Primary navigation">
          <NavIcon active label="Chats">●</NavIcon>
          <NavIcon label="Contacts">＋</NavIcon>
          <NavIcon label="Broadcast lists">◫</NavIcon>
        </nav>
        <div className="nav-bottom">
          <NavIcon label="Settings">⚙</NavIcon>
          <button className="profile" aria-label="Profile">SP</button>
        </div>
      </aside>

      <section className="conversation-panel">
        <header className="conversation-heading">
          <h1>Chats</h1>
          <p>12 conversations</p>
        </header>
        <label className="search-box">
          <span>⌕</span>
          <input aria-label="Search conversations" placeholder="Search conversations" />
        </label>
        <div className="conversation-list">
          {conversations.map(([initials, name, message, time], index) => (
            <button key={name} className={`conversation ${selected === index ? 'selected' : ''}`} onClick={() => setSelected(index)}>
              <span className="avatar">{initials}</span>
              <span className="conversation-copy"><strong>{name}</strong><small>{message}</small></span>
              <time>{time}</time>
            </button>
          ))}
        </div>
      </section>

      <section className="chat-panel">
        <header className="chat-header">
          <span className="avatar">AK</span>
          <div><strong>Ali Khan</strong><small>+92 300 1234567 • Active now</small></div>
        </header>
        <div className="messages">
          <span className="day-label">Today</span>
          <div className="message received">Hi Ali! How can we help you today?</div>
          <div className="message sent">Can you share the updated price list?</div>
        </div>
        <form className="composer" onSubmit={(event) => event.preventDefault()}>
          <button type="button" aria-label="Attach">＋</button>
          <input aria-label="Message" placeholder="Type a message…" />
          <button className="send" aria-label="Send">➤</button>
        </form>
      </section>
    </main>
  )
}

export default App
