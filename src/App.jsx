import { useState } from 'react'
import './App.css'

const contacts = [
  ['AK', 'Ali Khan', '+92 300 1234567'], ['SA', 'Sara Ahmed', '+92 321 7654321'],
  ['HR', 'Hamza Raza', '+92 333 4567890'], ['AN', 'Ayesha Noor', '+92 301 9081726'], ['UM', 'Usman Malik', '+92 312 4412200'],
]
const conversations = [
  ['AK','Ali Khan','Can you share the updated price?','2m'], ['SA','Sara Ahmed','Thank you!','18m'],
  ['HR','Hamza Raza','I received the broadcast.','1h'], ['AN','Ayesha Noor','Perfect, I will check it.','3h'], ['UM','Usman Malik','Image','Yesterday'],
]
const lists = [
  ['VIP Customers','High-value customers',42], ['Karachi Customers','Customers in Karachi',128],
  ['New Arrivals','Interested in new stock',86], ['Wholesale Buyers','Bulk & wholesale buyers',34],
  ['Inactive 30+ Days','Re-engagement audience',19], ['September Leads','New leads this month',57],
]

function Icon({ children }) { return <span className="icon-glyph">{children}</span> }
function Sidebar({ page, setPage }) {
  return <aside className="sidebar">
    <button className="brand-mark" onClick={() => setPage('chats')} aria-label="NexusOS home">N</button>
    <nav className="nav-stack">
      <button title="Chats" className={`nav-icon ${page === 'chats' ? 'active' : ''}`} onClick={() => setPage('chats')}><Icon>●</Icon></button>
      <button title="Contacts" className={`nav-icon ${page === 'contacts' ? 'active' : ''}`} onClick={() => setPage('contacts')}><Icon>＋</Icon></button>
      <button title="Broadcast Lists" className={`nav-icon ${page === 'lists' ? 'active' : ''}`} onClick={() => setPage('lists')}><Icon>▣</Icon></button>
    </nav>
    <div className="nav-bottom"><button className="nav-icon" title="Settings"><Icon>⚙</Icon></button><button className="profile">SP</button></div>
  </aside>
}

function Chats() {
  const [selected, setSelected] = useState(0)
  return <div className="chats-layout">
    <section className="conversation-panel">
      <header className="conversation-heading"><h1>Chats</h1><p>12 conversations</p></header>
      <label className="search-box"><span>⌕</span><input placeholder="Search conversations" /></label>
      <div className="conversation-list">{conversations.map(([initials,name,message,time],i)=><button key={name} className={`conversation ${selected===i?'selected':''}`} onClick={()=>setSelected(i)}><span className="avatar">{initials}</span><span className="conversation-copy"><strong>{name}</strong><small>{message}</small></span><time>{time}</time></button>)}</div>
    </section>
    <section className="chat-panel">
      <header className="chat-header"><span className="avatar">AK</span><div><strong>Ali Khan</strong><small>+92 300 1234567 • Active now</small></div></header>
      <div className="messages"><span className="day-label">Today</span><div className="message received">Hi Ali! How can we help you today?</div><div className="message sent">Can you share the updated price list?</div></div>
      <form className="composer" onSubmit={e=>e.preventDefault()}><button type="button">＋</button><input placeholder="Type a message…"/><button className="send">➤</button></form>
    </section>
  </div>
}

function Modal({ title, subtitle, onClose, children, footer }) {
  return <div className="modal-layer" onMouseDown={onClose}><section className="modal" onMouseDown={e=>e.stopPropagation()}><header><div><h2>{title}</h2><p>{subtitle}</p></div><button className="close" onClick={onClose}>×</button></header>{children}<footer>{footer}</footer></section></div>
}
function Contacts() {
  const [open,setOpen]=useState(false)
  return <section className="page"><header className="page-header"><div><h1>Contacts</h1><p>People connected to your business. Start a chat or add them to a broadcast list.</p></div><button className="primary" onClick={()=>setOpen(true)}>＋ Add Contact</button></header><label className="search-box wide"><span>⌕</span><input placeholder="Search by name or phone"/></label><div className="section-label">24 contacts</div><div className="table-card"><div className="table-head"><span>CONTACT</span><span>PHONE NUMBER</span><span>ADDED</span><span>STATUS</span><span/></div>{contacts.map(([initials,name,phone],i)=><div className="table-row" key={name}><div className="contact-cell"><span className="avatar">{initials}</span><span><strong>{name}</strong><small>NexusOS user</small></span></div><span>{phone}</span><span>{i?'Sep 4, 2026':'Today, 1:22 PM'}</span><span className="status">Active</span><button className="more">•••</button></div>)}</div>{open&&<Modal title="Add contact" subtitle="Connect a NexusOS user using their phone number." onClose={()=>setOpen(false)} footer={<><button className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="primary" onClick={()=>setOpen(false)}>Add Contact</button></>}><label className="field">Phone number<div className="field-input"><span>+92</span><input placeholder="300 1234567"/></div></label><label className="field">Display name <small>(optional)</small><input placeholder="e.g. Ali Khan"/></label><p className="helper">The contact will appear in Contacts and can be messaged directly.</p></Modal>}</section>
}
function Lists({ setPage }) {
 const [open,setOpen]=useState(false); const [selected,setSelected]=useState(['Ali Khan','Sara Ahmed'])
 const toggle=n=>setSelected(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n])
 return <section className="page"><header className="page-header"><div><h1>Broadcast Lists</h1><p>Create reusable audiences from your contacts.</p></div><div className="header-actions"><button className="secondary" onClick={()=>setPage('broadcast')}>↗ Broadcast</button><button className="primary" onClick={()=>setOpen(true)}>＋ New List</button></div></header><label className="search-box wide"><span>⌕</span><input placeholder="Search broadcast lists"/></label><div className="section-label strong">Your lists</div><div className="lists-layout"><div className="list-grid">{lists.map(([name,desc,count])=><article className="list-card" key={name}><div className="list-icon">▣</div><button className="more">•••</button><h3>{name}</h3><p>{desc}</p><small>{count} contacts</small></article>)}</div><aside className="list-detail"><h3>VIP Customers</h3><p>42 contacts</p><button className="primary full" onClick={()=>setPage('broadcast')}>↗ Create Broadcast</button><span className="eyebrow">MEMBERS</span>{contacts.map(([initials,name,phone])=><div className="mini-contact" key={name}><span className="avatar">{initials}</span><span><strong>{name}</strong><small>{phone}</small></span></div>)}</aside></div>{open&&<Modal title="Create broadcast list" subtitle="Group contacts into a reusable audience." onClose={()=>setOpen(false)} footer={<><span className="selected-count">{selected.length} contacts selected</span><button className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="primary" onClick={()=>setOpen(false)}>Create List</button></>}><label className="field">List name<input placeholder="e.g. VIP Customers"/></label><label className="field">Add contacts<div className="field-input"><span>⌕</span><input placeholder="Search contacts"/></div></label><div className="picker">{contacts.slice(0,3).map(([initials,name])=><button key={name} onClick={()=>toggle(name)}><span className="avatar">{initials}</span><strong>{name}</strong><span className={`check ${selected.includes(name)?'checked':''}`}>{selected.includes(name)?'✓':''}</span></button>)}</div></Modal>}</section>
}
function Broadcast({ setPage }) {
 const [schedule,setSchedule]=useState(false)
 return <section className="page"><header className="page-header"><div><button className="back" onClick={()=>setPage('lists')}>← Broadcast Lists</button><h1>Create Broadcast</h1><p>Send a message directly to contacts’ DMs now or schedule it for later.</p></div></header><div className="broadcast-layout"><div className="broadcast-card"><h3><b>1</b> Audience</h3><label className="field">Choose a broadcast list<select><option>VIP Customers — 42 contacts</option><option>Karachi Customers — 128 contacts</option></select></label><h3><b>2</b> Message</h3><label className="field">Text<textarea defaultValue={'Hi! We’ve just added new arrivals to our collection.\nReply here if you’d like the latest price list.'}/></label><label className="field">Image <small>(optional)</small><div className="upload"><span>▧</span><div><strong>Drop an image here or click to browse</strong><small>PNG, JPG or WEBP • Max 10 MB</small></div></div></label><h3><b>3</b> Delivery</h3><div className="delivery"><button className={!schedule?'selected':''} onClick={()=>setSchedule(false)}>◉ Send now</button><button className={schedule?'selected':''} onClick={()=>setSchedule(true)}>○ Schedule for later</button><button className="primary push">↗ {schedule?'Schedule Broadcast':'Send Broadcast'}</button></div></div><aside className="preview"><h3>Preview</h3><p>This is how the message appears in a DM.</p><div className="phone-preview"><div className="preview-head"><span className="avatar">N</span><strong>SparkPair Business</strong></div><span className="day-label">Today</span><div className="preview-message">Hi! We’ve just added new arrivals to our collection.<br/><br/>Reply here if you’d like the latest price list.</div><div className="image-placeholder">IMAGE PREVIEW</div><div className="preview-reply">Reply to business…</div></div><small>Broadcasts arrive as normal DM messages, so contacts can reply directly.</small></aside></div></section>
}
function App(){ const [page,setPage]=useState('chats'); return <main className="app-shell"><Sidebar page={page} setPage={setPage}/><div className="content">{page==='chats'&&<Chats/>}{page==='contacts'&&<Contacts/>}{page==='lists'&&<Lists setPage={setPage}/>} {page==='broadcast'&&<Broadcast setPage={setPage}/>}</div></main> }
export default App
