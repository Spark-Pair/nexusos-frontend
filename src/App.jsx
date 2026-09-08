import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppLayout from './components/layout/AppLayout.jsx'
import BroadcastPage from './pages/BroadcastPage.jsx'
import ChatsPage from './pages/ChatsPage.jsx'
import ContactsPage from './pages/ContactsPage.jsx'
import ListsPage from './pages/ListsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import { RequireAuthRoute, SignedOutOnlyRoute } from './features/authentication/authSession.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<SignedOutOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>
      <Route element={<RequireAuthRoute />}>
        <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/chats" replace />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/chats" replace />} />
    </Routes>
  )
}
