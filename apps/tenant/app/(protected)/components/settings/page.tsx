export default async function SettingsPage() {
  const data = await getTenant();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">
        Settings
      </h1>

      <div className="mt-8 space-y-8">
        <GeneralSettings
          tenant={data.tenant}
        />

        <CancellationPolicyForm
          tenantId={data.tenant.id}
          initialPolicy={
            data.tenant.cancellation_policy
          }
        />

        <IntegrationsSettings
          tenantId={data.tenant.id}
        />

        <PaymentSettings
          tenantId={data.tenant.id}
        />
      </div>
    </main>
  );
}