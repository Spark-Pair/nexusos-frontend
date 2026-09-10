import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { Input, Switch, Textarea } from '@shared/components/FormControls'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { useToast } from '@shared/components/toastContext'
import { WorkspaceShell } from '@shared/components/WorkspaceShell'
import { ArrowLeft, Copy, History, ListChecks, LogOut, Megaphone, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { profileApi, type Profile } from './profileApi'
import { authRoutes } from '@/features/authentication/authRoutes'
import { useAuthSession } from '@/features/authentication/authSession'
import { usePushNotifications } from '@/features/notifications/usePushNotifications'

export default function ProfilePage() {
  const { session, signOut } = useAuthSession()
  const token = session!.token
  const toast = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile>()
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const notifications = usePushNotifications(token)
  const closeLogout = useCallback(() => {
    if (!signingOut) setLeaving(false)
  }, [signingOut])
  const businessNavigation =
    session!.data.account_kind === 'business' ? (
      <>
        <Link to="/business/broadcasts" className="workspace-nav-link">
          <ListChecks className="size-[18px]" aria-hidden="true" />
          Broadcast lists
        </Link>
        <Link to="/business/broadcasts?view=compose" className="workspace-nav-link">
          <Megaphone className="size-[18px]" aria-hidden="true" />
          New broadcast
        </Link>
        <Link to="/business/broadcasts?view=history" className="workspace-nav-link">
          <History className="size-[18px]" aria-hidden="true" />
          Broadcast history
        </Link>
      </>
    ) : null
  const load = useCallback(() => {
    setNotice('')
    return profileApi
      .get(token)
      .then(setProfile)
      .catch((e: unknown) => setNotice(e instanceof Error ? e.message : 'Unable to load profile.'))
  }, [token])
  useEffect(() => {
    void load()
  }, [load])
  if (!profile)
    return (
      <WorkspaceShell
        accountName={session!.data.name}
        accountKind={session!.data.account_kind}
        navigation={businessNavigation}
      >
        <section className="app-panel mx-auto w-full max-w-md p-5">
          <Button variant="quiet" onClick={() => void navigate('/app/chats')}>
            <ArrowLeft className="size-4" />
            Chats
          </Button>
          <p role="status" className="my-5 text-sm">
            {notice || 'Loading profile...'}
          </p>
          {notice && <Button onClick={() => void load()}>Retry</Button>}
        </section>
      </WorkspaceShell>
    )
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setNotice('')
    try {
      await profileApi.update(session!.token, {
        name: profile.name,
        username: profile.username,
        bio: profile.settings.bio,
        language: profile.settings.language,
        show_last_seen: profile.settings.showLastSeen,
        allow_read_receipts: profile.settings.allowReadReceipts,
        allow_broadcasts: profile.settings.allowBroadcasts
      })
      setNotice('Profile saved.')
      toast({ title: 'Profile saved', tone: 'success' })
    } catch (e) {
      toast({
        title: 'Profile not saved',
        description: e instanceof Error ? e.message : 'Please retry.',
        tone: 'danger'
      })
      setNotice(e instanceof Error ? e.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }
  const setting = <K extends keyof Profile['settings']>(key: K, value: Profile['settings'][K]) =>
    setProfile({ ...profile, settings: { ...profile.settings, [key]: value } })
  return (
    <WorkspaceShell
      accountName={session!.data.name}
      accountKind={session!.data.account_kind}
      navigation={businessNavigation}
    >
      <form
        onSubmit={(e) => void save(e)}
        className="grid w-full gap-3 lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        <aside className="app-panel p-5">
          <Button type="button" variant="quiet" onClick={() => void navigate('/app/chats')}>
            <ArrowLeft className="size-4" /> Chats
          </Button>
          <div className="mt-8">
            <span className="grid size-16 place-items-center rounded-3xl border border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <UserRound className="size-7" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
              {profile.account_kind}
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold tracking-tight">
              Profile & settings
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your public name, username and privacy controls for chats.
            </p>
          </div>
          <div className="mt-8 min-w-0 rounded-2xl border border-slate-300 p-3 text-sm dark:border-slate-700">
            <p className="font-semibold">NexusOS ID</p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {profile.id}
              </code>
              <Button
                type="button"
                size="sm"
                variant="quiet"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(profile.id)
                    .then(() => toast({ title: 'NexusOS ID copied', tone: 'success' }))
                    .catch(() =>
                      toast({
                        title: 'Could not copy ID',
                        description: 'Select and copy the ID manually.',
                        tone: 'danger'
                      })
                    )
                }
              >
                <Copy className="size-4" /> Copy
              </Button>
            </div>
          </div>
        </aside>
        <section className="app-panel p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Account details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keep this information clear for people who message you.
            </p>
          </div>
          <div className="grid gap-5">
            <Input
              label="Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase() })}
            />
            <Textarea
              label="About"
              optional
              maxLength={240}
              value={profile.settings.bio}
              onChange={(e) => setting('bio', e.target.value)}
            />
            <Input
              label="Language"
              value={profile.settings.language}
              onChange={(e) =>
                setting('language', e.target.value as Profile['settings']['language'])
              }
              hint="Use en, ur, or roman-ur"
            />
            <section className="grid gap-3 rounded-2xl border border-slate-300 p-4 dark:border-slate-700">
              <div>
                <h2 className="font-bold">Appearance</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Switch the app between light and dark mode.
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Theme
                </span>
                <ThemeToggle />
              </div>
            </section>
            <section className="grid gap-3 rounded-2xl border border-slate-300 p-4 dark:border-slate-700">
              <h2 className="font-bold">Privacy</h2>
              <Switch
                label="Show last seen"
                checked={profile.settings.showLastSeen}
                onChange={(e) => setting('showLastSeen', e.target.checked)}
              />
              <Switch
                label="Read receipts"
                checked={profile.settings.allowReadReceipts}
                onChange={(e) => setting('allowReadReceipts', e.target.checked)}
              />
              <Switch
                label="Receive business broadcasts"
                checked={profile.settings.allowBroadcasts}
                onChange={(e) => setting('allowBroadcasts', e.target.checked)}
              />
            </section>
            <section className="grid gap-3 rounded-2xl border border-slate-300 p-4 dark:border-slate-700">
              <div>
                <h2 className="font-bold">Device notifications</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Get browser notifications for new messages and broadcasts on this device.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {notifications.supported
                    ? notifications.enabled
                      ? 'Enabled on this browser'
                      : notifications.permission === 'denied'
                        ? 'Blocked by browser settings'
                        : 'Not enabled yet'
                    : 'Not supported on this browser'}
                </p>
                <Button
                  type="button"
                  disabled={
                    !notifications.supported ||
                    notifications.enabled ||
                    notifications.permission === 'denied'
                  }
                  onClick={() => void notifications.enable()}
                >
                  {notifications.enabled ? 'Notifications enabled' : 'Enable notifications'}
                </Button>
              </div>
              {notifications.error ? (
                <p className="text-sm font-semibold text-rose-600">{notifications.error}</p>
              ) : null}
            </section>
            <section className="grid gap-3 rounded-2xl border border-slate-300 p-4 dark:border-slate-700">
              <div>
                <h2 className="font-bold">Session</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Sign out of NexusOS on this device from settings.
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                className="w-full justify-center sm:w-fit"
                onClick={() => setLeaving(true)}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </section>
            {notice ? (
              <p role="status" className="text-sm text-blue-700">
                {notice}
              </p>
            ) : null}
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </section>
      </form>
      <Dialog
        open={leaving}
        title="Sign out?"
        description="Saved chats and unsent messages on this device will be removed."
        onClose={closeLogout}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" disabled={signingOut} onClick={closeLogout}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={signingOut}
            onClick={() => {
              setSigningOut(true)
              void signOut()
                .then(() => navigate(authRoutes.signIn))
                .catch(() => {
                  setSigningOut(false)
                  toast({ title: 'Unable to sign out', tone: 'danger' })
                })
            }}
          >
            Sign out
          </Button>
        </div>
      </Dialog>
    </WorkspaceShell>
  )
}
