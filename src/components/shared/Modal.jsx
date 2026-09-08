import { X } from 'lucide-react'

export default function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        {children}
        <footer>{footer}</footer>
      </section>
    </div>
  )
}
