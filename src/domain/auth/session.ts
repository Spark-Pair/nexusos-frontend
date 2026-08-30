export type IdentityKind =
  'guest' | 'customer' | 'business_owner' | 'business_employee' | 'platform_admin'
export type AuthenticationStatus = 'unauthenticated' | 'authenticated'
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed'
export type VerificationStatus =
  'not_submitted' | 'pending_sync' | 'under_review' | 'approved' | 'rejected' | 'suspended'

export type BusinessPermission =
  | 'inbox'
  | 'customers'
  | 'segments'
  | 'campaigns'
  | 'updates'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'integrations'
  | 'team'
  | 'profile'
  | 'billing'
  | 'settings'

export interface AccountContext {
  id: string
  displayName: string
  kind: Exclude<IdentityKind, 'guest'>
}

export interface WorkspaceContext {
  id: string
  name: string
  verificationStatus: VerificationStatus
  subscriptionLabel: string
}

export interface AuthSession {
  identityKey: IdentityKind
  authenticationStatus: AuthenticationStatus
  account?: AccountContext
  workspace?: WorkspaceContext
  customerOnboardingStatus?: OnboardingStatus
  businessOnboardingStatus?: OnboardingStatus
  permissions: readonly BusinessPermission[]
  simulated: true
}

export interface AuthGateway {
  getSession: () => AuthSession
  selectIdentity: (identity: IdentityKind) => void
  signOut: () => void
  subscribe: (listener: (session: AuthSession) => void) => () => void
}

export function hasPermission(session: AuthSession, permission: BusinessPermission): boolean {
  return session.permissions.includes(permission)
}
