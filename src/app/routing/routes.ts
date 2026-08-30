import type { BusinessPermission } from '@domain/auth/session'
import type { AuthSession } from '@domain/auth/session'
import { matchPath } from 'react-router'

export type RouteArea =
  | 'public'
  | 'authentication'
  | 'customer-onboarding'
  | 'customer'
  | 'business-setup'
  | 'business'
  | 'admin'

export interface AppRouteRecord {
  id: string
  path: string
  title: string
  area: RouteArea
  group?: string
  permission?: BusinessPermission
  primaryNav?: boolean
}

const publicSpecs = [
  ['welcome', '/', 'Welcome'],
  ['product', '/product', 'Product'],
  ['for-businesses', '/for-businesses', 'For businesses'],
  ['for-customers', '/for-customers', 'For customers'],
  ['pricing', '/pricing', 'Pricing'],
  ['help', '/help', 'Help'],
  ['privacy', '/privacy', 'Privacy'],
  ['terms', '/terms', 'Terms'],
  ['contact', '/contact', 'Contact']
] as const satisfies readonly (readonly [string, string, string])[]
const mappedPublicRoutes: AppRouteRecord[] = publicSpecs.map(([id, path, title]) => ({
  id: `public.${id}`,
  path,
  title,
  area: 'public'
}))

const authenticationSpecs = [
  ['sign-in', '/sign-in', 'Sign in'],
  ['create-account', '/create-account', 'Create account'],
  ['phone', '/auth/phone', 'Phone challenge'],
  ['verify', '/auth/verify', 'Verification']
] as const
const authenticationRoutes: AppRouteRecord[] = authenticationSpecs.map(([id, path, title]) => ({
  id: `auth.${id}`,
  path,
  title,
  area: 'authentication'
}))

const onboardingSteps = [
  'welcome',
  'phone',
  'verify',
  'profile',
  'interests',
  'location',
  'notifications'
] as const
const customerOnboardingRoutes = onboardingSteps.map((step) => ({
  id: `customer.onboarding.${step}`,
  path: `/app/onboarding/${step}`,
  title: `Customer onboarding · ${step.replace('-', ' ')}`,
  area: 'customer-onboarding' as const
}))

const customerSpecs = [
  ['discover', '/app/discover', 'Discover', true],
  ['discover-search', '/app/discover/search', 'Discover search'],
  ['business', '/app/businesses/:businessId', 'Business profile'],
  ['business-updates', '/app/businesses/:businessId/updates', 'Business updates'],
  ['business-products', '/app/businesses/:businessId/products', 'Business products'],
  ['business-about', '/app/businesses/:businessId/about', 'About business'],
  ['business-reviews', '/app/businesses/:businessId/reviews', 'Business reviews'],
  ['business-follow', '/app/businesses/:businessId/follow', 'Follow preferences'],
  ['updates', '/app/updates', 'Updates', true],
  ['update', '/app/updates/:updateId', 'Update detail'],
  ['product', '/app/products/:productId', 'Product detail'],
  ['saved-products', '/app/saved/products', 'Saved products'],
  ['saved-updates', '/app/saved/updates', 'Saved updates'],
  ['order-options', '/app/order-requests/new/:productId/options', 'Order options'],
  ['order-delivery', '/app/order-requests/new/:productId/delivery', 'Delivery details'],
  ['order-payment', '/app/order-requests/new/:productId/payment', 'Payment preference'],
  ['order-review', '/app/order-requests/new/:productId/review', 'Order review'],
  ['orders', '/app/orders', 'Orders', true],
  ['order', '/app/orders/:orderId', 'Order detail'],
  ['chats', '/app/chats', 'Chats', true],
  ['chat', '/app/chats/:conversationId', 'Conversation'],
  ['profile', '/app/profile', 'Profile', true],
  ['profile-personal', '/app/profile/personal-information', 'Personal information'],
  ['profile-following', '/app/profile/following', 'Following'],
  ['profile-notifications', '/app/profile/notifications', 'Notification preferences'],
  ['profile-addresses', '/app/profile/addresses', 'Addresses'],
  ['profile-language', '/app/profile/language', 'Language'],
  ['profile-privacy', '/app/profile/privacy', 'Privacy'],
  ['profile-blocked', '/app/profile/blocked-businesses', 'Blocked businesses'],
  ['profile-help', '/app/profile/help', 'Help'],
  ['notifications', '/app/notifications', 'Notifications'],
  ['search', '/app/search', 'Search']
] as const
const customerRoutes = customerSpecs.map(([id, path, title, primaryNav]) => ({
  id: `customer.${id}`,
  path,
  title,
  area: 'customer' as const,
  primaryNav: primaryNav === true
}))

const businessSetupSteps = [
  'basics',
  'category',
  'location',
  'timings',
  'branding',
  'contact',
  'delivery',
  'team',
  'customer-import',
  'integration',
  'review'
] as const
const businessSetupRoutes: AppRouteRecord[] = [
  {
    id: 'business.select',
    path: '/business/select',
    title: 'Select workspace',
    area: 'business-setup'
  },
  ...businessSetupSteps.map((step) => ({
    id: `business.setup.${step}`,
    path: `/business/setup/${step}`,
    title: `Business setup · ${step.replace('-', ' ')}`,
    area: 'business-setup' as const
  }))
]

const businessSpecs: readonly (readonly [
  string,
  string,
  string,
  (BusinessPermission | undefined)?,
  boolean?
])[] = [
  ['overview', 'overview', 'Overview', undefined, true],
  ['verification', 'verification', 'Verification'],
  ['inbox', 'inbox', 'Shared Inbox', 'inbox', true],
  ['conversation', 'inbox/:conversationId', 'Conversation', 'inbox'],
  ['customers', 'customers', 'Customers', 'customers', true],
  ['customer', 'customers/:customerId', 'Customer detail', 'customers'],
  ['segments', 'segments', 'Segments', 'segments', true],
  ['segment-new', 'segments/new', 'New segment', 'segments'],
  ['segment', 'segments/:segmentId', 'Segment detail', 'segments'],
  ['campaigns', 'campaigns', 'Campaigns', 'campaigns', true],
  ['campaign-type', 'campaigns/new/type', 'Campaign type', 'campaigns'],
  ['campaign-details', 'campaigns/new/details', 'Campaign details', 'campaigns'],
  ['campaign-content', 'campaigns/new/content', 'Campaign content', 'campaigns'],
  ['campaign-audience', 'campaigns/new/audience', 'Campaign audience', 'campaigns'],
  ['campaign-delivery', 'campaigns/new/delivery', 'Campaign delivery', 'campaigns'],
  ['campaign-review', 'campaigns/new/review', 'Campaign review', 'campaigns'],
  ['campaign', 'campaigns/:campaignId', 'Campaign detail', 'campaigns'],
  ['campaign-analytics', 'campaigns/:campaignId/analytics', 'Campaign analytics', 'campaigns'],
  ['updates', 'updates', 'Updates', 'updates', true],
  ['update-new', 'updates/new', 'New update', 'updates'],
  ['update', 'updates/:updateId', 'Update detail', 'updates'],
  ['products', 'products', 'Products', 'products', true],
  ['product-new', 'products/new', 'New product', 'products'],
  ['product', 'products/:productId', 'Product detail', 'products'],
  ['orders', 'orders', 'Orders', 'orders', true],
  ['order', 'orders/:orderId', 'Order detail', 'orders'],
  ['analytics', 'analytics', 'Analytics', 'analytics', true],
  ['integrations', 'integrations', 'Integrations', 'integrations', true],
  ['integration', 'integrations/:providerKey', 'Integration detail', 'integrations'],
  ['team', 'team', 'Team', 'team', true],
  ['team-invite', 'team/invite', 'Invite team member', 'team'],
  ['membership', 'team/:membershipId', 'Membership detail', 'team'],
  ['profile', 'profile', 'Business Profile', 'profile', true],
  ['billing', 'billing', 'Billing and Usage', 'billing', true],
  ['settings', 'settings', 'Settings', 'settings', true],
  ['settings-general', 'settings/general', 'General settings', 'settings'],
  ['settings-notifications', 'settings/notifications', 'Notification settings', 'settings'],
  ['settings-inbox', 'settings/inbox', 'Inbox settings', 'settings'],
  ['settings-campaigns', 'settings/campaigns', 'Campaign settings', 'settings'],
  ['settings-privacy', 'settings/privacy', 'Privacy settings', 'settings'],
  ['settings-security', 'settings/security', 'Security settings', 'settings'],
  ['settings-languages', 'settings/languages', 'Language settings', 'settings'],
  ['settings-export', 'settings/export', 'Export', 'settings'],
  ['settings-blocked', 'settings/blocked-customers', 'Blocked customers', 'settings'],
  ['settings-danger', 'settings/danger-zone', 'Danger zone', 'settings'],
  ['notifications', 'notifications', 'Notifications'],
  ['search', 'search', 'Search']
]
const businessRoutes = businessSpecs.map(([id, suffix, title, permission, primaryNav]) => ({
  id: `business.${id}`,
  path: `/business/:businessId/${suffix}`,
  title,
  area: 'business' as const,
  ...(permission ? { permission } : {}),
  primaryNav: primaryNav === true
}))

const adminSpecs = [
  ['dashboard', '/admin', 'Dashboard', true],
  ['verifications', '/admin/verifications', 'Verification Queue', true],
  ['verification', '/admin/verifications/:businessId', 'Verification review'],
  ['moderation', '/admin/moderation', 'Moderation', true],
  ['report', '/admin/moderation/reports/:reportId', 'Report review'],
  ['users', '/admin/users', 'Users', true],
  ['user', '/admin/users/:userId', 'User detail'],
  ['businesses', '/admin/businesses', 'Businesses', true],
  ['business', '/admin/businesses/:businessId', 'Business detail'],
  ['plans', '/admin/plans', 'Plans and Fair Use', true],
  ['plan', '/admin/plans/:planId', 'Plan detail'],
  ['notifications', '/admin/notifications', 'Notifications'],
  ['search', '/admin/search', 'Admin search'],
  ['settings', '/admin/settings', 'Settings', true]
] as const
const adminRoutes = adminSpecs.map(([id, path, title, primaryNav]) => ({
  id: `admin.${id}`,
  path,
  title,
  area: 'admin' as const,
  primaryNav: primaryNav === true
}))

export const appRoutes: readonly AppRouteRecord[] = [
  ...mappedPublicRoutes,
  ...authenticationRoutes,
  ...customerOnboardingRoutes,
  ...customerRoutes,
  ...businessSetupRoutes,
  ...businessRoutes,
  ...adminRoutes
]
export const routesById = Object.fromEntries(
  appRoutes.map((route) => [route.id, route])
) as Readonly<Record<string, AppRouteRecord>>

export function buildPath(
  route: AppRouteRecord,
  params: Readonly<Record<string, string>> = {}
): string {
  return route.path.replace(/:([A-Za-z]+)/gu, (_, key: string) =>
    encodeURIComponent(params[key] ?? `:${key}`)
  )
}

export const roleHomes = {
  guest: '/',
  customer: '/app/discover',
  business_owner: '/business/demo-studio-one/overview',
  business_employee: '/business/demo-studio-one/overview',
  platform_admin: '/admin'
} as const

export const systemPaths = {
  signIn: '/sign-in',
  unauthorized: '/unauthorized',
  customerOnboarding: '/app/onboarding/welcome',
  businessSetup: '/business/setup/basics',
  businessSelect: '/business/select'
} as const

export function isSafeInternalDestination(value: string | null): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))
}

export function allowedReturnDestination(
  value: string | null,
  session: AuthSession
): string | null {
  if (!isSafeInternalDestination(value)) return null
  const pathname = value.split(/[?#]/u, 1)[0] ?? ''
  const route = appRoutes.find((candidate) =>
    matchPath({ path: candidate.path, end: true }, pathname)
  )
  if (!route || route.area === 'authentication') return null
  const allowedAreas: Readonly<Record<AuthSession['identityKey'], readonly RouteArea[]>> = {
    guest: ['public'],
    customer: ['public', 'customer', 'customer-onboarding'],
    business_owner: ['public', 'business', 'business-setup'],
    business_employee: ['public', 'business', 'business-setup'],
    platform_admin: ['public', 'admin']
  }
  if (!allowedAreas[session.identityKey].includes(route.area)) return null
  if (route.permission && !session.permissions.includes(route.permission)) return null
  return value
}
