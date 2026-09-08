import { ArrowLeft, Image, Radio, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/shared/Avatar.jsx'

export default function BroadcastPage() {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(false)

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <button className="back" onClick={() => navigate('/lists')}><ArrowLeft size={17} /> Broadcast Lists</button>
          <h1>Create Broadcast</h1>
          <p>Send a message directly to contacts' DMs now or schedule it for later.</p>
        </div>
      </header>
      <div className="broadcast-layout">
        <div className="broadcast-card">
          <h3><b>1</b> Audience</h3>
          <label className="field">Choose a broadcast list<select><option>VIP Customers - 42 contacts</option><option>Karachi Customers - 128 contacts</option></select></label>
          <h3><b>2</b> Message</h3>
          <label className="field">Text<textarea defaultValue={'Hi! We have just added new arrivals to our collection.\nReply here if you would like the latest price list.'} /></label>
          <label className="field">Image <small>(optional)</small><div className="upload"><Image size={24} /><div><strong>Drop an image here or click to browse</strong><small>PNG, JPG or WEBP - Max 10 MB</small></div></div></label>
          <h3><b>3</b> Delivery</h3>
          <div className="delivery">
            <button className={!schedule ? 'selected' : ''} onClick={() => setSchedule(false)}>Send now</button>
            <button className={schedule ? 'selected' : ''} onClick={() => setSchedule(true)}>Schedule for later</button>
            <button className="primary push"><Radio size={18} /> {schedule ? 'Schedule Broadcast' : 'Send Broadcast'}</button>
          </div>
        </div>
        <aside className="preview">
          <h3>Preview</h3>
          <p>This is how the message appears in a DM.</p>
          <div className="phone-preview">
            <div className="preview-head"><Avatar initials="N" /><strong>SparkPair Business</strong></div>
            <span className="day-label">Today</span>
            <div className="preview-message">Hi! We have just added new arrivals to our collection.<br /><br />Reply here if you would like the latest price list.</div>
            <div className="image-placeholder"><Search size={20} /> IMAGE PREVIEW</div>
            <div className="preview-reply">Reply to business...</div>
          </div>
          <small>Broadcasts arrive as normal DM messages, so contacts can reply directly.</small>
        </aside>
      </div>
    </section>
  )
}
