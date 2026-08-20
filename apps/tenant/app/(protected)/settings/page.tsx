import CancellationPolicyForm from "@/app/booking/[bookingId]/settings/CancellationPolicyForm";
import { getTenant } from "@/libs/tenant";
import PaymentSettings from "./components/PaymentSettings";
import EmailSettings from "./components/EmailSettings";
import PasswordSettings from "./components/PasswordSettings";

export default async function SettingsPage() {
  const data = await getTenant();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-8">
        <CancellationPolicyForm
          tenantId={data.tenant.id}
          initialPolicy={data.tenant.cancellation_policy}
        />
        <PaymentSettings tenantId={data.tenant.id} />
        <EmailSettings
          tenantId={data.tenant.id}
        />

        <PasswordSettings
          tenantId={data.tenant.id}
        />
      </div>
    </main>
  );
}