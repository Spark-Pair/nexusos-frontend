import { PlaceholderPage } from '@shared/components/PlaceholderPage'
import { DevelopmentIdentitySwitcher } from '@/features/authentication/DevelopmentIdentitySwitcher'
export default function AuthenticationPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PlaceholderPage title={title} />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 text-sm font-semibold">Development authentication only</p>
        <DevelopmentIdentitySwitcher />
        <p className="mt-3 text-xs leading-5 text-amber-900">
          No OTP, secure session, or backend authorization is implemented in Phase 2.
        </p>
      </div>
    </div>
  )
}
