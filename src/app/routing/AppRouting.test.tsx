import { appRoutes } from '@app/routing/routes'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/renderApp'

describe('Phase 2 routing and role shells', () => {
  it('registers the complete centralized route catalog without duplicate IDs or paths', () => {
    expect(new Set(appRoutes.map((route) => route.id)).size).toBe(appRoutes.length)
    expect(new Set(appRoutes.map((route) => route.path)).size).toBe(appRoutes.length)
    expect(appRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/app/discover' }),
        expect.objectContaining({ path: '/business/:businessId/overview' }),
        expect.objectContaining({ path: '/admin/verifications' })
      ])
    )
  })

  it('preserves an intended customer destination when sending a guest to sign in', async () => {
    renderApp('/app/orders')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(window.location.search).toContain('returnTo=%2Fapp%2Forders')
  })

  it('redirects authenticated users away from guest-only routes without looping', async () => {
    renderApp('/sign-in', 'customer')
    expect(await screen.findByRole('heading', { name: 'Discover' })).toBeInTheDocument()
  })

  it('shows customer navigation with current-route state and no business/admin navigation', async () => {
    renderApp('/app/orders', 'customer')
    expect(await screen.findByRole('heading', { name: 'Orders' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Orders' })[0]).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.queryByRole('link', { name: 'Campaigns' })).not.toBeInTheDocument()
    expect(screen.queryByText('Platform Administration')).not.toBeInTheDocument()
  })

  it('keeps parent navigation active on detail routes', async () => {
    renderApp('/app/orders/demo-order', 'customer')
    expect(await screen.findByRole('heading', { name: 'Order detail' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Orders' })[0]).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('keeps owner and employee permissions distinct in the business shell', async () => {
    const owner = renderApp('/business/demo-studio-one/products', 'business_owner')
    expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Campaigns' })).toBeInTheDocument()
    owner.unmount()

    renderApp('/business/demo-studio-one/products', 'business_employee')
    expect(await screen.findByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Campaigns' })).not.toBeInTheDocument()
  })

  it('isolates platform administration navigation', async () => {
    renderApp('/admin', 'platform_admin')
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getAllByText('Platform Administration')).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Discover' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Shared Inbox' })).not.toBeInTheDocument()
  })

  it('supports the business mobile drawer and sign-out confirmation', async () => {
    renderApp('/business/demo-studio-one/overview', 'business_owner')
    fireEvent.click(await screen.findByRole('button', { name: 'Open navigation' }))
    expect(screen.getByRole('dialog', { name: 'Business navigation' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Business navigation' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Demo Business Owner' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))
    expect(screen.getByRole('dialog', { name: 'Sign out of NexusOS?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('opens global search by keyboard and navigates to a typed result', async () => {
    renderApp('/app/discover', 'customer')
    await screen.findByRole('heading', { name: 'Discover' })
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    const search = screen.getByRole('dialog', { name: 'Search NexusOS routes' })
    expect(search).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search routes' }), {
      target: { value: 'Orders' }
    })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search routes' }), { key: 'Enter' })
    expect(await screen.findByRole('heading', { name: 'Orders' })).toBeInTheDocument()
  })

  it('excludes the development identity switcher when disabled', async () => {
    renderApp('/', 'guest', false)
    await screen.findByRole('heading', { name: 'Welcome' })
    expect(screen.queryByLabelText('Development identity')).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('shows scoped pending and connectivity feedback without claiming synchronization', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    renderApp('/app/discover', 'customer')
    expect(await screen.findByText('You are offline.')).toBeInTheDocument()
    expect(await screen.findByText('2 pending synchronization')).toBeInTheDocument()
    online.mockReturnValue(true)
    fireEvent(window, new Event('online'))
    expect(await screen.findByText(/Connection restored/iu)).toHaveTextContent(
      'Pending actions still require server acknowledgement'
    )
  })

  it('offers the install action only after the browser supplies an install prompt', async () => {
    renderApp('/app/discover', 'customer')
    await screen.findByRole('heading', { name: 'Discover' })
    expect(screen.queryByRole('button', { name: 'Install app' })).not.toBeInTheDocument()
    const event = new Event('beforeinstallprompt')
    Object.assign(event, {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
    })
    fireEvent(window, event)
    expect(await screen.findByRole('button', { name: 'Install app' })).toBeInTheDocument()
  })

  it('renders an explicit not-found route', async () => {
    renderApp('/missing-route')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders protected not-found pages inside their isolated shell', async () => {
    renderApp('/admin/not-a-route', 'platform_admin')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getAllByText('Platform Administration')).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Discover' })).not.toBeInTheDocument()
  })

  it('does not honor a return destination outside the authenticated role', async () => {
    renderApp('/sign-in?returnTo=%2Fadmin%2Fusers', 'customer')
    expect(await screen.findByRole('heading', { name: 'Discover' })).toBeInTheDocument()
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
  })
})
