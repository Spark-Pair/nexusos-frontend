import { ActionMenu } from '@shared/components/ActionMenu'
import { Badge } from '@shared/components/Badge'
import { Button } from '@shared/components/Button'
import {
  ChatListScreen,
  type ChatFilter,
  type ChatPreview
} from '@shared/components/ChatListScreen'
import { ChoiceCard } from '@shared/components/ChoiceCard'
import { Combobox } from '@shared/components/Combobox'
import { DataTable, type DataColumn, type SortDirection } from '@shared/components/DataTable'
import { Dialog } from '@shared/components/Dialog'
import { Drawer } from '@shared/components/Drawer'
import { Checkbox, Input, Radio, Switch, Textarea } from '@shared/components/FormControls'
import { IconButton } from '@shared/components/IconButton'
import { ApplicationFrame, AuthenticationFrame } from '@shared/components/LayoutFrames'
import { MediaPicker } from '@shared/components/MediaPicker'
import { BroadcastCard, ImageAttachment, MessageComposer } from '@shared/components/Messaging'
import { Breadcrumbs, Pagination, StepProgress } from '@shared/components/NavigationPrimitives'
import { OtpInput } from '@shared/components/OtpInput'
import { SchedulePicker } from '@shared/components/SchedulePicker'
import { ConflictState } from '@shared/components/states/ConflictState'
import { EmptyState } from '@shared/components/states/EmptyState'
import { ErrorState } from '@shared/components/states/ErrorState'
import { OfflineState } from '@shared/components/states/OfflineState'
import { PermissionDeniedState } from '@shared/components/states/PermissionDeniedState'
import { Alert, Avatar, Card, Skeleton } from '@shared/components/Surface'
import { TabPanel, Tabs } from '@shared/components/Tabs'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { Toast } from '@shared/components/Toast'
import {
  CommunicationPreferences,
  DeliveryStateIndicator,
  FrequencyWarning,
  PolicyNotice
} from '@shared/components/TrustAndDelivery'
import { validationMessage, validationRules } from '@shared/validation/formValidation'
import {
  Archive,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Compass,
  Eye,
  LayoutDashboard,
  MessageCircle,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound
} from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { chatExamples } from './chatExamples'

const customerNavigation = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'updates', label: 'Updates', icon: Sparkles, count: 3 },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'chats', label: 'Chats', icon: MessageCircle, count: 4 },
  { id: 'profile', label: 'Profile', icon: UserRound }
] as const

const businessNavigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inbox', label: 'Shared inbox', icon: MessageCircle, count: 8 },
  { id: 'customers', label: 'Customers', icon: UsersRound },
  { id: 'catalog', label: 'Catalog', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const

interface CustomerRow {
  id: string
  name: string
  city: string
  status: 'Active' | 'Pending' | 'Blocked'
  orders: number
}

const customerRows: CustomerRow[] = [
  { id: 'customer-1', name: 'Ayesha Malik', city: 'Karachi', status: 'Active', orders: 8 },
  { id: 'customer-2', name: 'Hamza Usman', city: 'Lahore', status: 'Pending', orders: 2 },
  { id: 'customer-3', name: 'Noor Sheikh', city: 'Karachi', status: 'Blocked', orders: 0 }
]

const colors = [
  ['Brand', '#287663', 'bg-[var(--color-brand-500)]'],
  ['Ink', '#1C2420', 'bg-slate-900'],
  ['Canvas', '#F8F9F8', 'bg-[var(--color-canvas)]'],
  ['Success', '#047857', 'bg-emerald-700'],
  ['Warning', '#B45309', 'bg-amber-700'],
  ['Danger', '#BE123C', 'bg-rose-700']
] as const

function Section({
  children,
  description,
  title
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <section className="scroll-mt-24 py-6 sm:py-8" id={title.toLowerCase().replaceAll(' ', '-')}>
      <div className="mb-5 grid gap-3 border-t border-slate-200 pt-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] md:items-end dark:border-slate-700">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            System
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500 md:justify-self-end dark:text-slate-400">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const [dialog, setDialog] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [toast, setToast] = useState(false)
  const [city, setCity] = useState('karachi')
  const [chatQuery, setChatQuery] = useState('')
  const [chatFilter, setChatFilter] = useState<ChatFilter>('all')
  const [mobileTab, setMobileTab] = useState('chats')
  const [chatNotice, setChatNotice] = useState('Interactive mock preview only')
  const [layoutRole, setLayoutRole] = useState<'customer' | 'business'>('customer')
  const [accountChoice, setAccountChoice] = useState<'customer' | 'business'>('customer')
  const [broadcastSaved, setBroadcastSaved] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [tableSort, setTableSort] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: 'name',
    direction: 'asc'
  })
  const [tableNotice, setTableNotice] = useState('No table action selected')
  const [otpPreview, setOtpPreview] = useState('')
  const [previewPage, setPreviewPage] = useState(2)
  const [progressStep, setProgressStep] = useState('profile')
  const [preferencesMuted, setPreferencesMuted] = useState(false)
  const [preferencesBlocked, setPreferencesBlocked] = useState(false)
  const customerColumns: DataColumn<CustomerRow>[] = [
    { id: 'name', header: 'Customer', sortable: true, cell: (row) => row.name },
    { id: 'city', header: 'City', sortable: true, cell: (row) => row.city },
    { id: 'orders', header: 'Orders', sortable: true, cell: (row) => row.orders },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge
          tone={
            row.status === 'Active' ? 'success' : row.status === 'Blocked' ? 'danger' : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: '',
      className: 'w-16',
      cell: (row) => (
        <ActionMenu
          label={`Actions for ${row.name}`}
          items={[
            { id: 'view', label: 'View details', icon: Eye },
            { id: 'archive', label: 'Archive locally', icon: Archive },
            { id: 'delete', label: 'Delete local draft', icon: Trash2, tone: 'danger' }
          ]}
          onAction={(action) => setTableNotice(`${action} selected for ${row.name}`)}
        />
      )
    }
  ]
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl border border-blue-700 bg-[var(--color-brand-500)] text-sm font-bold text-white">
              N
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">
                NexusOS
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Design system · Preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="spring-interaction rounded-[var(--radius-control)] border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition duration-200 hover:border-blue-400  dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back to top
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mt-6 overflow-hidden rounded-[var(--radius-surface)] border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
          <div className="relative">
            <Badge tone="brand">Foundation 01 · Review</Badge>
            <h1 className="mt-6 max-w-4xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Designed for clarity,
              <span className="block text-[var(--color-brand-500)] dark:text-blue-300">
                built for connection.
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              A modern, calm and consistent visual language for every NexusOS experience—from
              customer discovery to daily business operations.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.querySelector('#colors')?.scrollIntoView()}
              >
                Explore components
              </Button>
              <p className="text-xs font-medium text-slate-400">
                Temporary visual direction · v0.2
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-16 z-30 -mx-4 mt-8 border-y border-slate-300 bg-slate-50 px-4 py-3  sm:mx-0 sm:rounded-[var(--radius-control)] sm:border dark:border-slate-700 dark:bg-slate-950">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Design system sections">
            {[
              'Colors',
              'Typography',
              'Buttons',
              'Forms',
              'Application layouts',
              'Navigation and progress',
              'Data display',
              'Tables and menus',
              'Chats screen',
              'Messaging and broadcasts',
              'Privacy and delivery',
              'Feedback',
              'Overlays',
              'Loading and empty states'
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                className="spring-interaction shrink-0 rounded-[var(--radius-control)] border border-transparent px-3 py-2 text-xs font-semibold text-slate-500 transition duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800  dark:text-slate-400 dark:hover:border-blue-900 dark:hover:bg-blue-950 dark:hover:text-blue-200"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <Section
          title="Colors"
          description="Temporary NexusOS application palette. Brand colors remain provisional until identity approval."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map(([name, hex, style]) => (
              <Card
                key={name}
                className="spring-interaction group flex items-center gap-4 p-4 transition duration-200  hover:border-blue-300  dark:hover:border-blue-800"
              >
                <span
                  className={`size-14 shrink-0 rounded-[var(--radius-control)] border-2 border-black/10 dark:border-white/20 ${style}`}
                />
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="font-mono text-xs text-slate-500">{hex}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="Typography"
          description="A compact system type scale optimized for mobile interfaces and dense business workspaces."
        >
          <Card className="grid gap-9 p-6 sm:p-8">
            <div>
              <p className="text-xs text-slate-500">Display · 48/52</p>
              <p className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                Grow with better connections.
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Heading 1 · 36/40</p>
              <h1 className="text-4xl font-bold tracking-tight">Discover businesses</h1>
            </div>
            <div>
              <p className="text-xs text-slate-500">Heading 2 · 24/32</p>
              <h2 className="text-2xl font-bold">Recent updates</h2>
            </div>
            <div>
              <p className="text-xs text-slate-500">Body · 16/24</p>
              <p className="max-w-2xl leading-6">
                NexusOS keeps customer relationships, commerce and business communication connected
                in one place.
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Caption · 12/16</p>
              <p className="text-xs text-slate-500">Saved locally · Waiting to synchronize</p>
            </div>
          </Card>
        </Section>

        <Section
          title="Buttons"
          description="Primary, secondary, quiet and destructive actions across sizes and interaction states."
        >
          <Card className="grid gap-7 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary action</Button>
              <Button>Secondary action</Button>
              <Button variant="quiet">Quiet action</Button>
              <Button variant="danger">Delete</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary">
                Small
              </Button>
              <Button size="md" variant="primary">
                Medium
              </Button>
              <Button size="lg" variant="primary">
                Large
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <Button loading variant="primary">
                Loading
              </Button>
              <Button className="w-full sm:w-auto" variant="primary">
                Responsive full width
              </Button>
            </div>
          </Card>
        </Section>

        <Section
          title="Forms"
          description="Accessible form controls with labels, help text, validation, disabled and selected states."
        >
          <Card className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
            <Input
              label="Full name"
              placeholder="e.g. Hasan Raza"
              hint="Use the name customers recognize."
              forceCasing="title"
            />
            <Input
              label="Phone number"
              placeholder="03XX XXXXXXX"
              error={validationMessage(validationRules.pakistanPhone, '123')}
              required
            />
            <Combobox
              label="City"
              value={city}
              onChange={setCity}
              hint="Type to filter available cities."
              options={[
                { label: 'Karachi', value: 'karachi' },
                { label: 'Lahore', value: 'lahore' },
                { label: 'Islamabad', value: 'islamabad' }
              ]}
            />
            <Input disabled label="Workspace ID" defaultValue="demo-studio-one" />
            <Textarea
              className="lg:col-span-2"
              label="Description"
              optional
              placeholder="Tell customers about your business…"
            />
            <div className="lg:col-span-2">
              <MediaPicker label="Product or broadcast images" optional maxFiles={4} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <Checkbox
                defaultChecked
                label="Order updates"
                description="Important changes to your order requests."
              />
              <Checkbox
                label="Sales and discounts"
                description="Offers from businesses you follow."
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <Radio
                defaultChecked
                name="delivery"
                label="Standard delivery"
                description="Estimated 3–5 working days"
              />
              <Radio
                name="delivery"
                label="Express delivery"
                description="Estimated 1–2 working days"
              />
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-950 lg:col-span-2">
              <Switch
                defaultChecked
                label="New arrival notifications"
                description="Receive updates from followed businesses."
              />
              <Switch
                label="Marketing recommendations"
                description="Personalized discovery suggestions."
              />
              <Switch disabled label="Backend-only preference" />
            </div>
          </Card>
        </Section>

        <Section
          title="Application layouts"
          description="Responsive shell compositions for customer, business workspace and future authentication journeys."
        >
          <div className="mb-5 max-w-sm">
            <Tabs
              activeId={layoutRole}
              label="Application layout previews"
              onChange={(role) => setLayoutRole(role as 'customer' | 'business')}
              items={[
                { id: 'customer', label: 'Customer' },
                { id: 'business', label: 'Business' }
              ]}
            />
          </div>
          <TabPanel id={layoutRole} label="Application layout previews">
            {layoutRole === 'customer' ? (
              <ApplicationFrame
                activeId="discover"
                brandLabel="NexusOS"
                roleLabel="Customer"
                navigation={customerNavigation}
                toolbar={
                  <>
                    <IconButton
                      label="Search preview"
                      icon={<Search className="size-4" />}
                      variant="quiet"
                    />
                    <IconButton
                      label="Notifications preview"
                      icon={<Bell className="size-4" />}
                      variant="quiet"
                    />
                  </>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Card
                    className="sm:col-span-2 xl:col-span-3"
                    title="Discover around you"
                    description="Customer content canvas with compact sections."
                  >
                    <div className="grid gap-2 sm:grid-cols-3">
                      {['Fashion', 'Food', 'Home'].map((item) => (
                        <div
                          key={item}
                          className="rounded-[var(--radius-control)] border border-slate-300 bg-slate-50 p-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </Card>
                  {['Recommended businesses', 'Popular products', 'Recently viewed'].map((item) => (
                    <Card key={item} title={item}>
                      <Skeleton className="h-24 w-full rounded-[var(--radius-control)]" />
                    </Card>
                  ))}
                </div>
              </ApplicationFrame>
            ) : (
              <ApplicationFrame
                activeId="overview"
                brandLabel="Studio One"
                roleLabel="Business workspace"
                navigation={businessNavigation}
                toolbar={
                  <Button size="sm" variant="primary">
                    Create update
                  </Button>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {['Followers', 'Unread chats', 'Orders', 'Campaign reach'].map((item, index) => (
                    <Card key={item} title={item}>
                      <p className="text-2xl font-bold">{[1248, 8, 23, '—'][index]}</p>
                      <p className="mt-1 text-xs text-slate-500">Mock metric</p>
                    </Card>
                  ))}
                  <Card className="sm:col-span-2 xl:col-span-3" title="Workspace activity">
                    <Skeleton className="h-40 w-full rounded-[var(--radius-control)]" />
                  </Card>
                  <Card title="Needs attention">
                    <div className="grid gap-2">
                      <Badge tone="warning">3 pending</Badge>
                      <Badge tone="danger">1 failed</Badge>
                    </div>
                  </Card>
                </div>
              </ApplicationFrame>
            )}
          </TabPanel>

          <div className="mt-8">
            <div className="mb-4">
              <p className="text-sm font-bold">Authentication layout</p>
              <p className="mt-1 text-xs text-slate-500">
                Layout preview only; authentication behavior is intentionally not implemented.
              </p>
            </div>
            <AuthenticationFrame>
              <Badge tone="brand">Account access</Badge>
              <h3 className="mt-5 text-3xl font-bold tracking-tight">Welcome to NexusOS</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose an account journey after the design system is approved.
              </p>
              <div className="mt-6 grid gap-3">
                <ChoiceCard
                  selected={accountChoice === 'customer'}
                  title="Customer account"
                  description="Discover, follow, order and chat"
                  icon={UserRound}
                  onClick={() => setAccountChoice('customer')}
                />
                <ChoiceCard
                  selected={accountChoice === 'business'}
                  title="Business account"
                  description="Manage customers and communication"
                  icon={BriefcaseBusiness}
                  onClick={() => setAccountChoice('business')}
                />
              </div>
            </AuthenticationFrame>
          </div>
        </Section>

        <Section
          title="Navigation and progress"
          description="Reusable orientation patterns for authentication, onboarding and paginated business data."
        >
          <div className="grid gap-5">
            <Card
              title="Multi-step progress"
              description="Completed, current and upcoming steps remain legible across screen sizes."
            >
              <StepProgress
                activeId={progressStep}
                steps={[
                  { id: 'account', label: 'Account', description: 'Choose account type' },
                  { id: 'identity', label: 'Identity', description: 'Verify contact' },
                  { id: 'profile', label: 'Profile', description: 'Add core details' },
                  { id: 'preferences', label: 'Preferences', description: 'Choose updates' }
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {['account', 'identity', 'profile', 'preferences'].map((step) => (
                  <Button
                    key={step}
                    size="sm"
                    variant={progressStep === step ? 'primary' : 'secondary'}
                    onClick={() => setProgressStep(step)}
                  >
                    {step}
                  </Button>
                ))}
              </div>
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card
                title="OTP input"
                description="Input behavior only. Real code delivery and verification require the backend."
              >
                <OtpInput value={otpPreview} onChange={setOtpPreview} />
                <p className="mt-3 text-xs text-slate-500">
                  {otpPreview.length}/6 digits entered · Not verified
                </p>
              </Card>
              <Card
                title="Breadcrumbs and pagination"
                description="Hierarchical location and result navigation."
              >
                <Breadcrumbs
                  items={[
                    { label: 'Customers', onClick: () => setTableNotice('Customers selected') },
                    { label: 'Karachi', onClick: () => setTableNotice('Karachi selected') },
                    { label: 'Ayesha Malik' }
                  ]}
                />
                <div className="mt-8 border-t border-slate-300 pt-5 dark:border-slate-700">
                  <Pagination
                    currentPage={previewPage}
                    totalPages={5}
                    onPageChange={setPreviewPage}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Section>

        <Section
          title="Data display"
          description="Reusable surfaces for identities, status, grouping and navigation."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="relative overflow-hidden border-blue-300 p-0 dark:border-blue-800">
              <div className="border-b border-blue-200 bg-blue-50/50 px-5 py-3 dark:border-blue-900 dark:bg-blue-950/30">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
                  Customer identity
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar label="Hasan Raza" size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold tracking-tight">Hasan Raza</p>
                      <Badge tone="success">Active</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Karachi, Pakistan · Customer since 2026
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-[var(--radius-control)] border border-slate-200 p-2 dark:border-slate-700">
                  <div className="rounded-[var(--radius-control)] border border-blue-200 bg-blue-50 p-2 text-center dark:border-blue-900 dark:bg-blue-950">
                    <p className="text-lg font-bold">12</p>
                    <p className="text-[10px] text-slate-500">Following</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] border border-violet-200 bg-violet-50 p-2 text-center dark:border-violet-900 dark:bg-violet-950">
                    <p className="text-lg font-bold">8</p>
                    <p className="text-[10px] text-slate-500">Saved</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-2 text-center dark:border-emerald-900 dark:bg-emerald-950">
                    <p className="text-lg font-bold">3</p>
                    <p className="text-[10px] text-slate-500">Orders</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <Badge tone="warning">Pending sync</Badge>
                  <Button size="sm" onClick={() => setToast(true)}>
                    View profile
                  </Button>
                </div>
              </div>
            </Card>
            <Card title="Tabs" description="Keyboard-friendly content navigation">
              <Tabs
                label="Content preview"
                activeId={tab}
                onChange={setTab}
                items={[
                  { id: 'Overview', label: 'Overview' },
                  { id: 'Products', label: 'Products', count: 12 },
                  { id: 'Updates', label: 'Updates', count: 3 }
                ]}
              />
              <TabPanel id={tab} label="Content preview">
                <p className="py-6 text-sm text-slate-600">{tab} content preview</p>
              </TabPanel>
            </Card>
          </div>
        </Section>

        <Section
          title="Tables and menus"
          description="Responsive business data patterns with sorting, selection, row actions and explicit empty states."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Customer records</p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedCustomers.length ? `${selectedCustomers.length} selected` : tableNotice}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!selectedCustomers.length}>
                Bulk action
              </Button>
              <ActionMenu
                label="Open table options"
                items={[
                  { id: 'export', label: 'Export requires backend', icon: Archive, disabled: true },
                  { id: 'clear', label: 'Clear selection', icon: Trash2 }
                ]}
                onAction={(action) => {
                  if (action === 'clear') setSelectedCustomers([])
                  setTableNotice(`${action} selected`)
                }}
              />
            </div>
          </div>
          <DataTable
            caption="Customer records preview"
            columns={customerColumns}
            rows={customerRows}
            selectedIds={selectedCustomers}
            onSelectionChange={setSelectedCustomers}
            sort={tableSort}
            onSort={(columnId, direction) => {
              setTableSort({ columnId, direction })
              setTableNotice(`${columnId} sorted ${direction}`)
            }}
            onRowOpen={(row) => setTableNotice(`${row.name} opened in preview`)}
          />
          <div className="mt-5">
            <p className="mb-3 text-sm font-bold">Empty table</p>
            <DataTable
              caption="Empty records preview"
              columns={customerColumns.slice(0, 4)}
              rows={[]}
              emptyMessage="Customers will appear after an authoritative account relationship exists."
            />
          </div>
        </Section>

        <Section
          title="Chats screen"
          description="A reusable mobile chat-list composition with an iOS-inspired bottom app bar. All content and interactions are mock previews."
        >
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
            <Card
              title="Composition notes"
              description="Familiar chat hierarchy, expressed with NexusOS tokens and shared components."
              className="lg:sticky lg:top-36"
            >
              <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="rounded-[var(--radius-control)] border border-slate-300 p-4 dark:border-slate-700">
                  Search, filters, identity rows and unread counts are reusable presentation
                  patterns—not simulated delivery behavior.
                </p>
                <p className="rounded-[var(--radius-control)] border border-blue-300 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                  {chatNotice}
                </p>
                <p className="text-xs leading-5 text-slate-500">
                  The bottom navigation includes safe-area spacing, clear selected state and
                  restrained interaction feedback for mobile use.
                </p>
              </div>
            </Card>
            <ChatListScreen
              activeTab={mobileTab}
              conversations={chatExamples}
              filter={chatFilter}
              query={chatQuery}
              onActiveTabChange={(id) => {
                setMobileTab(id)
                setChatNotice(`${id[0]?.toUpperCase()}${id.slice(1)} tab selected in preview`)
              }}
              onCompose={() => setChatNotice('New chat action previewed—nothing was sent')}
              onFilterChange={setChatFilter}
              onOpenConversation={(chat: ChatPreview) =>
                setChatNotice(`${chat.name} selected—no conversation was opened`)
              }
              onQueryChange={setChatQuery}
            />
          </div>
        </Section>

        <Section
          title="Messaging and broadcasts"
          description="Reusable conversation, local image intent and separate customer Updates patterns with honest delivery states."
        >
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Card
              title="Message composer"
              description="Text and image intents remain local until a backend acknowledges them."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ImageAttachment
                  name="lookbook.jpg"
                  state="local"
                  onRemove={() => setChatNotice('Local image removed')}
                />
                <ImageAttachment name="catalog.png" state="pending" />
                <ImageAttachment name="receipt.jpg" state="acknowledged" />
                <ImageAttachment
                  name="large-photo.png"
                  state="failed"
                  onRetry={() => setChatNotice('Retry preview only')}
                />
              </div>
              <div className="mt-4">
                <MessageComposer
                  quickReplies={['Is this available?', 'Do you offer COD?']}
                  onAddImage={() => setChatNotice('Image picker preview only')}
                  onSubmit={() => setChatNotice('Message saved locally — not delivered')}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500" role="status">
                {chatNotice}
              </p>
            </Card>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Customer Updates inbox</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Broadcasts stay separate from personal chats.
                  </p>
                </div>
                <Badge tone="brand">3 unread</Badge>
              </div>
              <BroadcastCard
                business="Studio One"
                kind="new-arrival"
                time="12 min"
                body="Our linen edit is now available in new seasonal colors."
                saved={broadcastSaved}
                onSave={() => setBroadcastSaved((current) => !current)}
                onOpen={() => setChatNotice('Update detail preview selected')}
              />
              <div className="mt-4">
                <SchedulePicker />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Privacy and delivery"
          description="Consent, suppression, anti-spam and acknowledgement states that must remain consistent across customer and business experiences."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card
              title="Delivery lifecycle"
              description="Local intent is never presented as external completion."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {(['local', 'queued', 'server-accepted', 'delivered', 'failed'] as const).map(
                  (state) => (
                    <DeliveryStateIndicator key={state} state={state} />
                  )
                )}
              </div>
            </Card>
            <CommunicationPreferences
              muted={preferencesMuted}
              blocked={preferencesBlocked}
              onMute={() => setPreferencesMuted((current) => !current)}
              onUnfollow={() =>
                setChatNotice('Unfollow requires confirmation and backend acknowledgement')
              }
              onBlock={() => setPreferencesBlocked((current) => !current)}
            />
            <PolicyNotice title="Phone number remains private">
              Following a business does not reveal a customer phone number. Contact access requires
              explicit permission and backend enforcement.
            </PolicyNotice>
            <PolicyNotice title="Suppression overrides consent" tone="blocked">
              Blocked, unsubscribed or suppressed recipients must not receive marketing—even when a
              follow or segment rule includes them.
            </PolicyNotice>
            <div className="lg:col-span-2">
              <FrequencyWarning
                recentCount={4}
                onReview={() => setChatNotice('Audience policy review previewed')}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Feedback"
          description="Inline feedback communicates status without claiming backend completion."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Alert title="Information">This request will be saved on this device.</Alert>
            <Alert title="Saved locally" tone="success">
              Your draft is available offline.
            </Alert>
            <Alert title="Pending synchronization" tone="warning">
              We will retry when your connection returns.
            </Alert>
            <Alert title="Could not save" tone="danger">
              Review the fields and try again.
            </Alert>
          </div>
          <Button
            className="mt-5"
            onClick={() => {
              setToast(true)
              window.setTimeout(() => setToast(false), 2500)
            }}
          >
            Preview toast
          </Button>
          {toast && (
            <div className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-sm sm:left-auto sm:mx-0">
              <Toast title="Saved locally" tone="success" onClose={() => setToast(false)}>
                Changes remain on this device until synchronization.
              </Toast>
            </div>
          )}
        </Section>

        <Section
          title="Overlays"
          description="Focus-managed dialog and mobile drawer patterns for confirmation and contextual tasks."
        >
          <Card className="flex flex-wrap gap-3 border-violet-300 dark:border-violet-800">
            <Button variant="primary" onClick={() => setDialog(true)}>
              Open dialog
            </Button>
            <Button onClick={() => setDrawer(true)}>Open drawer</Button>
          </Card>
          <Dialog
            open={dialog}
            title="Confirm order request"
            description="This creates a local request and queues it for synchronization."
            onClose={() => setDialog(false)}
          >
            <div className="flex justify-end gap-3">
              <Button onClick={() => setDialog(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setDialog(false)}>
                Confirm request
              </Button>
            </div>
          </Dialog>
          <Drawer open={drawer} title="Notification preferences" onClose={() => setDrawer(false)}>
            <div className="grid gap-4">
              <Switch defaultChecked label="Order updates" />
              <Switch label="Recommendations" />
              <Button variant="primary" onClick={() => setDrawer(false)}>
                Save preferences
              </Button>
            </div>
          </Drawer>
        </Section>

        <Section
          title="Loading and empty states"
          description="Foundation states for slow, empty, failed and disconnected experiences."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Loading connection" className="border-violet-300 dark:border-violet-800">
              <div className="mb-6 flex items-center gap-2" role="status" aria-label="Loading">
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="size-2.5 animate-bounce rounded-full border border-violet-700 bg-violet-500"
                    style={{ animationDelay: `${item * 120}ms` }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-12 rounded-[var(--radius-control)]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </Card>
            <EmptyState
              title="No saved products"
              description="Products you save will appear here."
              actionLabel="Discover products"
              onAction={() => document.querySelector('#colors')?.scrollIntoView()}
            />
            <ErrorState
              compact
              title="Something went wrong"
              description="The information could not be loaded."
              actionLabel="Try again"
              onAction={() => undefined}
            />
            <OfflineState />
            <ConflictState onReview={() => setChatNotice('Conflict review preview selected')} />
            <PermissionDeniedState onGoBack={() => setChatNotice('Go back selected')} />
          </div>
        </Section>
      </main>
      <footer className="mt-12 border-t border-slate-200 bg-white py-10 text-center text-xs font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-950">
        NexusOS temporary design foundation · Review before product-wide adoption
      </footer>
    </div>
  )
}
