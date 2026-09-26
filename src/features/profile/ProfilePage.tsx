import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { Input, Switch, Textarea } from '@shared/components/FormControls'
import { SearchField } from '@shared/components/SearchField'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { useToast } from '@shared/components/toastContext'
import { WorkspaceShell } from '@shared/components/WorkspaceShell'
import { WorkspaceNavLink } from '@shared/components/WorkspaceNavLink'
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Copy,
  History,
  KeyRound,
  ListChecks,
  LogOut,
  Megaphone,
  Moon,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  UserRound
} from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { profileApi, type Profile } from './profileApi'
import { authRoutes } from '@/features/authentication/authRoutes'
import { useAuthSession } from '@/features/authentication/authSession'
import { queueOfflineAction, syncOfflineActions } from '@/features/chats/offlineActions'
import { offlineStore, type QueuedAction, type QueuedMessage } from '@/features/chats/offlineStore'
import { syncOutbox } from '@/features/chats/outbox'
import { inviteApi } from '@/features/invites/inviteApi'
import { usePushNotifications } from '@/features/notifications/usePushNotifications'
import { haptic } from '@/shared/motion/haptics'

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Name, username, about and language',
    icon: UserRound
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Presence, read receipts and broadcasts',
    icon: ShieldCheck
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Theme and visual preferences',
    icon: Moon
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'This browser and device',
    icon: Bell
  },
  {
    id: 'business',
    title: 'Business tools',
    description: 'Invites and business account access',
    icon: BriefcaseBusiness
  },
  {
    id: 'sync',
    title: 'Sync & storage',
    description: 'Offline messages and pending changes',
    icon: RefreshCw
  },
  { id: 'account', title: 'Account', description: 'NexusOS ID and sign-in session', icon: KeyRound }
] as const

const defaultProfileSettings: Profile['settings'] = {
  userId: '',
  bio: '',
  language: 'en',
  showLastSeen: true,
  allowReadReceipts: true,
  allowBroadcasts: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timeZone: 'UTC',
  updatedAt: new Date(0)
}

export default function ProfilePage() {
  const { session, signOut, serverConfirmed } = useAuthSession()
  const token = session!.token
  const toast = useToast()
  const navigate = useNavigate()
  const { section: sectionParam } = useParams()
  const [profile, setProfile] = useState<Profile>()
  const [categorySearch, setCategorySearch] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [requestingBusiness, setRequestingBusiness] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteBusy, setInviteBusy] = useState(false)
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([])
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([])
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const notifications = usePushNotifications(token)
  const refreshSyncQueue = useCallback(async () => {
    const [messages, actions] = await Promise.all([
      offlineStore.queued(session!.data.id).catch(() => []),
      offlineStore.queuedActions(session!.data.id).catch(() => [])
    ])
    setQueuedMessages(messages)
    setQueuedActions(actions)
  }, [session])
  const closeLogout = useCallback(() => {
    if (!signingOut) setLeaving(false)
  }, [signingOut])
  const businessNavigation =
    session!.data.account_kind === 'business' ? (
      <>
        <WorkspaceNavLink
          to="/business/broadcasts/lists"
          icon={ListChecks}
        >
          Broadcast lists
        </WorkspaceNavLink>
        <WorkspaceNavLink
          to="/business/broadcasts/compose"
          icon={Megaphone}
        >
          New broadcast
        </WorkspaceNavLink>
        <WorkspaceNavLink
          to="/business/broadcasts/history"
          icon={History}
        >
          Broadcast history
        </WorkspaceNavLink>
      </>
    ) : null
  const load = useCallback(() => {
    setNotice('')
    return offlineStore
      .read<Profile>(session!.data.id, 'profile')
      .then((cached) => {
        if (cached)
          setProfile({
            ...cached,
            settings: { ...defaultProfileSettings, ...cached.settings }
          })
        if (!navigator.onLine || !serverConfirmed) return cached
        return profileApi.get(token).then((next) => {
          setProfile(next)
          void offlineStore.save(session!.data.id, 'profile', next).catch(() => undefined)
          return next
        })
      })
      .catch((e: unknown) => setNotice(e instanceof Error ? e.message : 'Unable to load profile.'))
  }, [serverConfirmed, session, token])
  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    const refresh = () => {
      setIsOnline(navigator.onLine)
      void refreshSyncQueue()
    }
    void refreshSyncQueue()
    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    window.addEventListener('nexusos-outbox-updated', refresh)
    window.addEventListener('nexusos-actions-updated', refresh)
    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
      window.removeEventListener('nexusos-outbox-updated', refresh)
      window.removeEventListener('nexusos-actions-updated', refresh)
    }
  }, [refreshSyncQueue])
  useEffect(() => {
    if (session!.data.account_kind !== 'business') return
    void inviteApi
      .getBusinessInvite(token)
      .then((result) => setInviteUrl(result.inviteUrl))
      .catch(() => undefined)
  }, [session, token])
  if (!profile)
    return (
      <WorkspaceShell
        accountName={session!.data.name}
        actorId={session!.data.id}
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
      const value = {
        name: profile.name,
        username: profile.username,
        bio: profile.settings.bio,
        language: profile.settings.language,
        show_last_seen: profile.settings.showLastSeen,
        allow_read_receipts: profile.settings.allowReadReceipts,
        allow_broadcasts: profile.settings.allowBroadcasts,
        quiet_hours_enabled: profile.settings.quietHoursEnabled,
        quiet_hours_start: profile.settings.quietHoursStart,
        quiet_hours_end: profile.settings.quietHoursEnd,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || profile.settings.timeZone
      }
      await offlineStore.save(session!.data.id, 'profile', profile)
      if (!navigator.onLine || !serverConfirmed) {
        await queueOfflineAction(session!.data.id, 'profile.update', value)
        setNotice('Profile saved on this device. It will sync when internet returns.')
        return
      }
      await profileApi.update(session!.token, value)
      void syncOfflineActions(session!.data.id, token).catch(() => undefined)
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
  const businessRequest = profile.business_request
  const pendingBusinessRequest = businessRequest?.status === 'pending'
  const section = settingsCategories.find((item) => item.id === sectionParam)?.id
  const sectionTitle =
    section === 'business' && profile.account_kind === 'customer'
      ? 'Business account'
      : settingsCategories.find((item) => item.id === section)?.title

  const requestBusiness = async () => {
    if (requestingBusiness) return
    setRequestingBusiness(true)
    try {
      const value = {
        business_name: businessName,
        contact_person_name: contactPersonName,
        phone: businessPhone
      }
      if (!navigator.onLine || !serverConfirmed) {
        await queueOfflineAction(session!.data.id, 'businessRequest.create', value)
        setBusinessName('')
        setContactPersonName('')
        setBusinessPhone('')
        toast({
          title: 'Business request saved',
          description: 'It will be sent to admins when internet returns.',
          tone: 'success'
        })
        return
      }
      const request = await profileApi.requestBusiness(token, value)
      setProfile({ ...profile, business_request: request })
      setBusinessName('')
      setContactPersonName('')
      setBusinessPhone('')
      toast({
        title: 'Business request sent',
        description: 'An admin will call the contact person before upgrading this account.',
        tone: 'success'
      })
    } catch (e) {
      toast({
        title: 'Request not sent',
        description: e instanceof Error ? e.message : 'Please check the details and try again.',
        tone: 'danger'
      })
    } finally {
      setRequestingBusiness(false)
    }
  }
  if (sectionParam && !section) return <Navigate to="/app/profile" replace />
  const groupedCategories = [
    { title: 'Personal', ids: ['profile', 'privacy', 'appearance'] },
    { title: 'Workspace', ids: ['notifications', 'business'] },
    { title: 'Account', ids: ['sync', 'account'] }
  ] as const
  const notificationSummary = notifications.enabled
    ? 'Enabled on this browser'
    : notifications.permission === 'denied'
      ? 'Blocked by browser settings'
      : 'Permission and delivery settings'
  const normalizedCategorySearch = categorySearch.trim().toLocaleLowerCase()
  const visibleGroups = groupedCategories
    .map((group) => ({
      ...group,
      categories: group.ids
        .map((id) => {
          const category = settingsCategories.find((item) => item.id === id)!
          const title =
            id === 'business'
              ? profile.account_kind === 'business'
                ? 'Business tools'
                : 'Business account'
              : category.title
          const description =
            category.id === 'notifications' ? notificationSummary : category.description
          return { category, title, description }
        })
        .filter(({ title, description }) =>
          `${group.title} ${title} ${description}`
            .toLocaleLowerCase()
            .includes(normalizedCategorySearch)
        )
    }))
    .filter((group) => group.categories.length > 0)
  const failedSyncCount =
    queuedMessages.filter((item) => item.status === 'failed').length +
    queuedActions.filter((item) => item.status === 'failed').length
  const pendingSyncCount =
    queuedMessages.filter((item) => item.status !== 'failed').length +
    queuedActions.filter((item) => item.status !== 'failed').length
  const syncStatus = !isOnline
    ? `Offline${pendingSyncCount ? ` - ${pendingSyncCount} changes waiting` : ''}`
    : failedSyncCount
      ? `${failedSyncCount} change${failedSyncCount === 1 ? '' : 's'} need attention`
      : pendingSyncCount
        ? `Syncing ${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'}`
        : !serverConfirmed
          ? 'Using saved data. Changes will sync when connected.'
          : 'All changes synced'
  const retrySync = async () => {
    if (!isOnline || !serverConfirmed || syncing) return
    setSyncing(true)
    try {
      await Promise.all([
        ...queuedMessages
          .filter((item) => item.status === 'failed')
          .map((item) => offlineStore.enqueue({ ...item, status: 'queued', error: '' })),
        ...queuedActions
          .filter((item) => item.status === 'failed')
          .map((item) => offlineStore.updateAction(item.id, { status: 'queued', error: '' }))
      ])
      window.dispatchEvent(new Event('nexusos-outbox-updated'))
      window.dispatchEvent(new Event('nexusos-actions-updated'))
      await syncOutbox(session!.data.id, token)
      await syncOfflineActions(session!.data.id, token)
      await refreshSyncQueue()
    } catch (error) {
      toast({
        title: 'Sync could not finish',
        description: error instanceof Error ? error.message : 'Please retry when connected.',
        tone: 'danger'
      })
    } finally {
      setSyncing(false)
      await refreshSyncQueue()
    }
  }
  return (
    <WorkspaceShell
      accountName={session!.data.name}
      actorId={session!.data.id}
      accountKind={session!.data.account_kind}
      navigation={businessNavigation}
    >
      <div className="mx-auto w-full max-w-2xl">
        {!section ? (
          <section className="app-panel overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
              <p className="text-xs font-semibold capitalize text-[var(--color-brand-600)]">
                {profile.account_kind} account
              </p>
              <h1 className="mt-1 text-xl font-semibold">{profile.name}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{profile.username}</p>
            </div>
            <div className="px-4 pb-4 pt-4 sm:px-6">
              <SearchField
                label="Search settings"
                value={categorySearch}
                onChange={setCategorySearch}
                placeholder="Search settings"
              />
            </div>
            {visibleGroups.length ? (
              visibleGroups.map((group) => (
                <div key={group.title} className="settings-category-group">
                  <h2 className="settings-category-heading">{group.title}</h2>
                  {group.categories.map(({ category, title, description }) => (
                    <Link
                      key={category.id}
                      to={`/app/profile/${category.id}`}
                      onClick={() => haptic('light')}
                      className="settings-category-row"
                    >
                      <category.icon className="size-[18px] shrink-0 text-slate-500 dark:text-slate-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{title}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {description}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
              ))
            ) : (
              <p className="px-4 pb-5 text-sm text-slate-500 sm:px-6" role="status">
                No settings match: {categorySearch}
              </p>
            )}
          </section>
        ) : (
          <>
            <div className="mb-4">
              <Link
                to="/app/profile"
                onClick={() => haptic('light')}
                className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="size-4" /> Settings
              </Link>
              <h1 className="mt-2 text-xl font-semibold">{sectionTitle}</h1>
            </div>

            {section === 'profile' || section === 'privacy' ? (
              <form
                onSubmit={(event) => void save(event)}
                className="app-panel grid gap-4 p-4 sm:p-6"
              >
                {section === 'profile' ? (
                  <>
                    <Input
                      label="Name"
                      value={profile.name}
                      onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    />
                    <Input
                      label="Username"
                      value={profile.username}
                      onChange={(event) =>
                        setProfile({ ...profile, username: event.target.value.toLowerCase() })
                      }
                    />
                    <Textarea
                      label="About"
                      optional
                      maxLength={240}
                      value={profile.settings.bio}
                      onChange={(event) => setting('bio', event.target.value)}
                    />
                    <Input
                      label="Language"
                      value={profile.settings.language}
                      onChange={(event) =>
                        setting('language', event.target.value as Profile['settings']['language'])
                      }
                      hint="Use en, ur, or roman-ur"
                    />
                  </>
                ) : (
                  <>
                    <Switch
                      label="Show last seen"
                      checked={profile.settings.showLastSeen}
                      onChange={(event) => setting('showLastSeen', event.target.checked)}
                    />
                    <Switch
                      label="Read receipts"
                      checked={profile.settings.allowReadReceipts}
                      onChange={(event) => setting('allowReadReceipts', event.target.checked)}
                    />
                    <Switch
                      label="Receive business broadcasts"
                      checked={profile.settings.allowBroadcasts}
                      onChange={(event) => setting('allowBroadcasts', event.target.checked)}
                    />
                  </>
                )}
                {notice ? (
                  <p role="status" className="text-sm text-slate-500">
                    {notice}
                  </p>
                ) : null}
                <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                  <Button type="submit" loading={saving}>
                    Save changes
                  </Button>
                </div>
              </form>
            ) : null}

            {section === 'appearance' ? (
              <section className="app-panel flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
                <div>
                  <h2 className="text-sm font-medium">Color theme</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Choose light or dark appearance for this device.
                  </p>
                </div>
                <ThemeToggle />
              </section>
            ) : null}

            {section === 'notifications' ? (
              <form
                onSubmit={(event) => void save(event)}
                className="app-panel grid gap-5 p-4 sm:p-6"
              >
                <section className="notification-setting-group">
                  <div>
                    <h2 className="text-sm font-semibold">Browser notifications</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Receive new message alerts on this device. Your browser controls final
                      permission.
                    </p>
                    <p
                      role="status"
                      className="mt-2 inline-flex rounded-full border border-[var(--border-subtle)] bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {notifications.supported
                        ? notifications.enabled
                          ? 'Enabled on this browser'
                          : notifications.permission === 'denied'
                            ? 'Blocked in browser settings'
                            : 'Permission not granted'
                        : 'Not supported on this browser'}
                    </p>
                  </div>
                  <div className="notification-setting-control">
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
                </section>
                <section className="notification-setting-group">
                  <div>
                    <h2 className="text-sm font-semibold">Quiet hours</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Pause message alerts on a schedule. Messages will still arrive as usual.
                    </p>
                  </div>
                  <div className="notification-setting-control">
                    <Switch
                      label="Pause notifications"
                      checked={profile.settings.quietHoursEnabled}
                      onChange={(event) => setting('quietHoursEnabled', event.target.checked)}
                    />
                  </div>
                  {profile.settings.quietHoursEnabled ? (
                    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                      <Input
                        label="Start time"
                        type="time"
                        value={profile.settings.quietHoursStart}
                        onChange={(event) => setting('quietHoursStart', event.target.value)}
                      />
                      <Input
                        label="End time"
                        type="time"
                        value={profile.settings.quietHoursEnd}
                        onChange={(event) => setting('quietHoursEnd', event.target.value)}
                      />
                      <p className="text-xs text-slate-500 sm:col-span-2 dark:text-slate-400">
                        Device timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                      </p>
                    </div>
                  ) : null}
                </section>
                {notice ? (
                  <p role="status" className="text-sm text-slate-500">
                    {notice}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Quiet hours use this device's timezone.
                  </span>
                  <Button type="submit" loading={saving}>
                    Save changes
                  </Button>
                </div>
                {notifications.error ? (
                  <p className="text-sm font-medium text-rose-600">{notifications.error}</p>
                ) : null}
              </form>
            ) : null}

            {section === 'business' ? (
              profile.account_kind === 'business' ? (
                <section className="app-panel flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
                  <div>
                    <h2 className="text-sm font-medium">Customer invite link</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Let customers connect directly to your business chat.
                    </p>
                  </div>
                  <Button type="button" onClick={() => setInviteOpen(true)}>
                    <BriefcaseBusiness className="size-4" /> Manage link
                  </Button>
                </section>
              ) : (
                <section className="app-panel grid gap-4 p-4 sm:p-6">
                  <div>
                    <h2 className="text-sm font-medium">Request a business account</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Admins will call the contact person before upgrading your account.
                    </p>
                    {businessRequest ? (
                      <p className="mt-3 text-sm font-medium">
                        Latest request: {businessRequest.status} · {businessRequest.businessName}
                      </p>
                    ) : null}
                  </div>
                  <Input
                    label="Business name"
                    autoComplete="organization"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                  />
                  <Input
                    label="Person to call"
                    autoComplete="name"
                    value={contactPersonName}
                    onChange={(event) => setContactPersonName(event.target.value)}
                  />
                  <Input
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    hint="Use a number admins can call directly."
                    value={businessPhone}
                    onChange={(event) => setBusinessPhone(event.target.value)}
                  />
                  <div>
                    <Button
                      type="button"
                      loading={requestingBusiness}
                      disabled={pendingBusinessRequest}
                      onClick={() => void requestBusiness()}
                    >
                      {pendingBusinessRequest ? 'Request pending' : 'Send request'}
                    </Button>
                  </div>
                </section>
              )
            ) : null}

            {section === 'sync' ? (
              <section className="app-panel grid gap-4 p-4 sm:p-6">
                <div>
                  <h2 className="text-sm font-medium">Sync status</h2>
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                  >
                    {syncStatus}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-control)] border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Queued messages</p>
                    <p className="mt-1 text-lg font-semibold">
                      {queuedMessages.filter((item) => item.status !== 'failed').length}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-control)] border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Other changes</p>
                    <p className="mt-1 text-lg font-semibold">
                      {queuedActions.filter((item) => item.status !== 'failed').length}
                    </p>
                  </div>
                </div>
                {failedSyncCount ? (
                  <div className="grid gap-2">
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      {failedSyncCount} change{failedSyncCount === 1 ? '' : 's'} failed to sync.
                    </p>
                    <Button
                      type="button"
                      variant="quiet"
                      loading={syncing}
                      disabled={!isOnline || !serverConfirmed}
                      onClick={() => void retrySync()}
                    >
                      <RefreshCw className="size-4" /> Retry failed changes
                    </Button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {section === 'account' ? (
              <section className="app-panel grid gap-5 p-4 sm:p-6">
                <div>
                  <h2 className="text-sm font-medium">NexusOS ID</h2>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <code className="min-w-0 break-all text-xs text-slate-500 dark:text-slate-400">
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
                          .catch(() => toast({ title: 'Could not copy ID', tone: 'danger' }))
                      }
                    >
                      <Copy className="size-4" /> Copy ID
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-medium">Sign out</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Sign out of NexusOS on this device.
                    </p>
                  </div>
                  <Button type="button" variant="danger" onClick={() => setLeaving(true)}>
                    <LogOut className="size-4" /> Sign out
                  </Button>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
      <Dialog
        open={inviteOpen}
        title="Business invite link"
        description="Customers who use this link will be connected to your business chat after sign-in."
        onClose={() => setInviteOpen(false)}
      >
        <div className="grid gap-4">
          <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="break-all font-mono text-xs text-slate-600 dark:text-slate-300">
              {inviteUrl || 'Generating link...'}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="quiet" onClick={() => setInviteOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              disabled={!inviteUrl}
              onClick={() => {
                void navigator.clipboard
                  .writeText(inviteUrl)
                  .then(() => toast({ title: 'Invite link copied', tone: 'success' }))
                  .catch(() => toast({ title: 'Could not copy link', tone: 'danger' }))
              }}
            >
              <Copy className="size-4" /> Copy link
            </Button>
            <Button
              type="button"
              variant="quiet"
              disabled={inviteBusy}
              onClick={() => {
                setInviteBusy(true)
                void inviteApi
                  .regenerateBusinessInvite(token)
                  .then((result) => {
                    setInviteUrl(result.inviteUrl)
                    toast({ title: 'Invite link regenerated', tone: 'success' })
                  })
                  .catch(() => toast({ title: 'Invite link not changed', tone: 'danger' }))
                  .finally(() => setInviteBusy(false))
              }}
            >
              <RotateCw className="size-4" /> Regenerate
            </Button>
          </div>
        </div>
      </Dialog>
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
