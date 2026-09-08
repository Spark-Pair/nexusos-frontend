export default function Avatar({ initials, className = '' }) {
  return <span className={`avatar ${className}`}>{initials}</span>
}
