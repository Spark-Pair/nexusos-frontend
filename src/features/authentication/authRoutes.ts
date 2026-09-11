export const authRoutes = Object.freeze({
  signIn: '/sign-in',
  phone: '/auth/phone',
  verify: '/auth/verify',
  chatPreview: '/app/chats',
  adminUsers: '/admin/users'
})

export type AccountKind = 'customer' | 'business'

export function accountKindFromSearch(search: string): AccountKind {
  return new URLSearchParams(search).get('account') === 'business' ? 'business' : 'customer'
}

export function authPath(path: string, account: AccountKind): string {
  return `${path}?account=${account}`
}
