import { AuthContext } from '@app/auth/AuthContext'
import {
  BusinessContextGuard,
  BusinessVerificationGuard,
  CustomerOnboardingGuard,
  RoleGuard
} from '@app/routing/guards'
import type { AuthSession } from '@domain/auth/session'
import { developmentSessions } from '@infrastructure/auth/DevelopmentAuthGateway'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

function renderGuard(session: AuthSession, initialPath: string, element: React.ReactNode) {
  return render(
    <AuthContext.Provider value={{ session, selectIdentity: vi.fn(), signOut: vi.fn() }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>{element}</Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

const marker = (label: string) => <p>{label}</p>

describe('route guards', () => {
  it('redirects incomplete customers to onboarding and completed customers away from onboarding', () => {
    const incomplete: AuthSession = {
      ...developmentSessions.customer,
      customerOnboardingStatus: 'in_progress'
    }
    renderGuard(
      incomplete,
      '/app/orders',
      <>
        <Route element={<RoleGuard allowed={['customer']} />}>
          <Route element={<CustomerOnboardingGuard requireComplete />}>
            <Route path="/app/orders" element={marker('orders')} />
          </Route>
        </Route>
        <Route path="/app/onboarding/welcome" element={marker('onboarding')} />
      </>
    )
    expect(screen.getByText('onboarding')).toBeInTheDocument()
  })

  it('redirects incomplete businesses to setup and rejects the wrong workspace', () => {
    const incomplete: AuthSession = {
      ...developmentSessions.business_owner,
      businessOnboardingStatus: 'in_progress'
    }
    renderGuard(
      incomplete,
      '/business/demo-studio-one/overview',
      <>
        <Route element={<BusinessContextGuard />}>
          <Route path="/business/:businessId/overview" element={marker('overview')} />
        </Route>
        <Route path="/business/setup/basics" element={marker('setup')} />
      </>
    )
    expect(screen.getByText('setup')).toBeInTheDocument()
  })

  it('routes unverified business contexts to their verification page', () => {
    const unverified: AuthSession = {
      ...developmentSessions.business_owner,
      workspace: {
        ...developmentSessions.business_owner.workspace!,
        verificationStatus: 'under_review'
      }
    }
    renderGuard(
      unverified,
      '/protected',
      <>
        <Route element={<BusinessVerificationGuard />}>
          <Route path="/protected" element={marker('protected')} />
        </Route>
        <Route path="/business/:businessId/verification" element={marker('verification')} />
      </>
    )
    expect(screen.getByText('verification')).toBeInTheDocument()
  })
})
