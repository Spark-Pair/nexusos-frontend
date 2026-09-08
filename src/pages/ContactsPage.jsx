import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../components/shared/Avatar.jsx'
import Modal from '../components/shared/Modal.jsx'
import { contacts } from '../data/demoData.js'

export default function ContactsPage() {
  const [open, setOpen] = useState(false)

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Contacts</h1>
          <p>People connected to your business. Start a chat or add them to a broadcast list.</p>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Add Contact
        </button>
      </header>
      <label className="search-box wide">
        <Search size={16} />
        <input placeholder="Search by name or phone" />
      </label>
      <div className="section-label">24 contacts</div>
      <div className="table-card">
        <div className="table-head">
          <span>CONTACT</span><span>PHONE NUMBER</span><span>ADDED</span><span>STATUS</span><span />
        </div>
        {contacts.map((contact, index) => (
          <div className="table-row" key={contact.name}>
            <div className="contact-cell">
              <Avatar initials={contact.initials} />
              <span><strong>{contact.name}</strong><small>NexusOS user</small></span>
            </div>
            <span>{contact.phone}</span>
            <span>{index ? 'Sep 4, 2026' : 'Today, 1:22 PM'}</span>
            <span className="status">Active</span>
            <button className="more" aria-label={`More actions for ${contact.name}`}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
      {open && (
        <Modal
          title="Add contact"
          subtitle="Connect a NexusOS user using their phone number."
          onClose={() => setOpen(false)}
          footer={<><button className="secondary" onClick={() => setOpen(false)}>Cancel</button><button className="primary" onClick={() => setOpen(false)}>Add Contact</button></>}
        >
          <label className="field">Phone number<div className="field-input"><span>+92</span><input placeholder="300 1234567" /></div></label>
          <label className="field">Display name <small>(optional)</small><input placeholder="e.g. Ali Khan" /></label>
          <p className="helper">The contact will appear in Contacts and can be messaged directly.</p>
        </Modal>
      )}
    </section>
  )
}
