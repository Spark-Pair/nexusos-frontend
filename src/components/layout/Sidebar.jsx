import { LogOut, MessageCircle, Radio, Settings, UserPlus, UsersRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../features/authentication/authSession.jsx'

const navItems = [
  { to: '/chats', label: 'Chats', icon: MessageCircle },
  { to: '/contacts', label: 'Contacts', icon: UserPlus },
  { to: '/lists', label: 'Broadcast Lists', icon: UsersRound },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { session, signOut } = useAuthSession()
  const initials = session?.data.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SP'

  return (
    <aside className="sidebar">
      <NavLink className="brand-mark" to="/chats" aria-label="NexusOS home">
        N
      </NavLink>
      <nav className="nav-stack" aria-label="Main">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} title={label} className="nav-icon" to={to}>
            <Icon size={23} strokeWidth={2.1} />
          </NavLink>
        ))}
      </nav>
      <div className="nav-bottom">
        <NavLink className="nav-icon" title="Broadcast" to="/broadcast">
          <Radio size={23} strokeWidth={2.1} />
        </NavLink>
        <button className="nav-icon" title="Settings">
          <Settings size={23} strokeWidth={2.1} />
        </button>
        <button className="nav-icon" title="Sign out" onClick={() => signOut().then(() => navigate('/login'))}>
          <LogOut size={23} strokeWidth={2.1} />
        </button>
        <button className="profile" title={session?.data.name || 'Profile'}>{initials}</button>
      </div>
    </aside>
  )
}
