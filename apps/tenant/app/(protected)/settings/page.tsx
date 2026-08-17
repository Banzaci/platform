import { getTenant } from "@/libs/tenant";
import CancellationPolicyForm from "./CancellationPolicyForm";

export default async function SettingsPage() {
  const data = await getTenant();

  const policy =
    data.tenant.cancellation_policy ?? {
      free_cancellation_days: 14,
      partial_refund_hours: 48,
      partial_refund_percent: 50,
    };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your booking and hotel settings.
        </p>
      </div>

      <div className="space-y-8">
        <CancellationPolicyForm
          tenantId={data.tenant.id}
          initialPolicy={policy}
        />
      </div>
    </main>
  );
}