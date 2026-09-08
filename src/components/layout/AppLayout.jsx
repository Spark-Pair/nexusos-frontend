import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  return (
    <main className="app-shell">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </main>
  )
}
