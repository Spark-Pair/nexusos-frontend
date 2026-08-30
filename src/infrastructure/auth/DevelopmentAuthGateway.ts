import type { AuthGateway, AuthSession, IdentityKind } from '@domain/auth/session'

const allBusinessPermissions = [
  'inbox',
  'customers',
  'segments',
  'campaigns',
  'updates',
  'products',
  'orders',
  'analytics',
  'integrations',
  'team',
  'profile',
  'billing',
  'settings'
] as const

export const developmentSessions: Readonly<Record<IdentityKind, AuthSession>> = {
  guest: {
    identityKey: 'guest',
    authenticationStatus: 'unauthenticated',
    permissions: [],
    simulated: true
  },
  customer: {
    identityKey: 'customer',
    authenticationStatus: 'authenticated',
    account: { id: 'demo-customer-account', displayName: 'Demo Customer', kind: 'customer' },
    customerOnboardingStatus: 'completed',
    permissions: [],
    simulated: true
  },
  business_owner: {
    identityKey: 'business_owner',
    authenticationStatus: 'authenticated',
    account: {
      id: 'demo-owner-account',
      displayName: 'Demo Business Owner',
      kind: 'business_owner'
    },
    workspace: {
      id: 'demo-studio-one',
      name: 'Studio One',
      verificationStatus: 'approved',
      subscriptionLabel: 'Business · Demo'
    },
    businessOnboardingStatus: 'completed',
    permissions: allBusinessPermissions,
    simulated: true
  },
  business_employee: {
    identityKey: 'business_employee',
    authenticationStatus: 'authenticated',
    account: {
      id: 'demo-employee-account',
      displayName: 'Demo Business Employee',
      kind: 'business_employee'
    },
    workspace: {
      id: 'demo-studio-one',
      name: 'Studio One',
      verificationStatus: 'approved',
      subscriptionLabel: 'Business · Demo'
    },
    businessOnboardingStatus: 'completed',
    permissions: ['inbox', 'customers', 'orders'],
    simulated: true
  },
  platform_admin: {
    identityKey: 'platform_admin',
    authenticationStatus: 'authenticated',
    account: {
      id: 'demo-platform-admin',
      displayName: 'Demo Platform Administrator',
      kind: 'platform_admin'
    },
    permissions: [],
    simulated: true
  }
}

export class DevelopmentAuthGateway implements AuthGateway {
  private session: AuthSession
  private readonly listeners = new Set<(session: AuthSession) => void>()
  private readonly storage: Storage | undefined

  public constructor(initialIdentity: IdentityKind = 'guest', storage?: Storage) {
    this.storage = storage
    const storedIdentity = storage?.getItem('nexusos:demo-identity')
    const resolvedIdentity =
      storedIdentity && storedIdentity in developmentSessions
        ? (storedIdentity as IdentityKind)
        : initialIdentity
    this.session = developmentSessions[resolvedIdentity]
  }

  public getSession(): AuthSession {
    return this.session
  }

  public selectIdentity(identity: IdentityKind): void {
    this.session = developmentSessions[identity]
    if (identity === 'guest') this.storage?.removeItem('nexusos:demo-identity')
    else this.storage?.setItem('nexusos:demo-identity', identity)
    this.emit()
  }

  public signOut(): void {
    this.selectIdentity('guest')
  }

  public subscribe(listener: (session: AuthSession) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.session))
  }
}
