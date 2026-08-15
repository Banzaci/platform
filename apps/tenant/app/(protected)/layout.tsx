import { getTenant } from "@/libs/tenant";
import ProtectedLayout from "./ProtectedLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  return (
    <ProtectedLayout tenant={tenant}>
      {children}
    </ProtectedLayout>
  );
}