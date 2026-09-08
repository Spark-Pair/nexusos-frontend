import { Check, MoreHorizontal, Plus, Radio, Search, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/shared/Avatar.jsx'
import Modal from '../components/shared/Modal.jsx'
import { contacts, lists } from '../data/demoData.js'

export default function ListsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(['Ali Khan', 'Sara Ahmed'])
  const toggle = (name) => setSelected((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name])

  return (
    <section className="page">
      <header className="page-header">
        <div><h1>Broadcast Lists</h1><p>Create reusable audiences from your contacts.</p></div>
        <div className="header-actions">
          <button className="secondary" onClick={() => navigate('/broadcast')}><Radio size={18} /> Broadcast</button>
          <button className="primary" onClick={() => setOpen(true)}><Plus size={18} /> New List</button>
        </div>
      </header>
      <label className="search-box wide"><Search size={16} /><input placeholder="Search broadcast lists" /></label>
      <div className="section-label strong">Your lists</div>
      <div className="lists-layout">
        <div className="list-grid">
          {lists.map((list) => (
            <article className="list-card" key={list.name}>
              <div className="list-icon"><UsersRound size={20} /></div>
              <button className="more" aria-label={`More actions for ${list.name}`}><MoreHorizontal size={18} /></button>
              <h3>{list.name}</h3><p>{list.description}</p><small>{list.count} contacts</small>
            </article>
          ))}
        </div>
        <aside className="list-detail">
          <h3>VIP Customers</h3><p>42 contacts</p>
          <button className="primary full" onClick={() => navigate('/broadcast')}><Radio size={18} /> Create Broadcast</button>
          <span className="eyebrow">MEMBERS</span>
          {contacts.map((contact) => <div className="mini-contact" key={contact.name}><Avatar initials={contact.initials} /><span><strong>{contact.name}</strong><small>{contact.phone}</small></span></div>)}
        </aside>
      </div>
      {open && (
        <Modal title="Create broadcast list" subtitle="Group contacts into a reusable audience." onClose={() => setOpen(false)} footer={<><span className="selected-count">{selected.length} contacts selected</span><button className="secondary" onClick={() => setOpen(false)}>Cancel</button><button className="primary" onClick={() => setOpen(false)}>Create List</button></>}>
          <label className="field">List name<input placeholder="e.g. VIP Customers" /></label>
          <label className="field">Add contacts<div className="field-input"><Search size={16} /><input placeholder="Search contacts" /></div></label>
          <div className="picker">{contacts.slice(0, 3).map((contact) => <button key={contact.name} onClick={() => toggle(contact.name)}><Avatar initials={contact.initials} /><strong>{contact.name}</strong><span className={`check ${selected.includes(contact.name) ? 'checked' : ''}`}>{selected.includes(contact.name) ? <Check size={15} /> : null}</span></button>)}</div>
        </Modal>
      )}
    </section>
  )
}
