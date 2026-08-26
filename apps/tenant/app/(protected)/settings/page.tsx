import CancellationPolicyForm from "@/app/booking/[bookingId]/settings/CancellationPolicyForm";
import { getTenant } from "@/libs/tenant";
import PaymentSettings from "./components/PaymentSettings";
import EmailSettings from "./components/EmailSettings";
import PasswordSettings from "./components/PasswordSettings";
import CurrencySettings from "./components/CurrencySettings";

export default async function SettingsPage() {
  const data = await getTenant();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-8">
        <CurrencySettings />
        <CancellationPolicyForm initialPolicy={data.tenant.cancellation_policy} />
        <PaymentSettings />
        <EmailSettings />
        <PasswordSettings />
      </div>
    </main>
  );
}