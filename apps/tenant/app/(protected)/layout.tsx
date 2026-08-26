import { getTenant } from "@/libs/tenant";
import ProtectedLayout from "./ProtectedLayout";
// import { AIPreviewProvider } from "./context/AIPreviewProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  return (
    <ProtectedLayout tenant={tenant}>
      {/* <AIPreviewProvider> */}
      {children}
      {/* </AIPreviewProvider> */}
    </ProtectedLayout>
  );
}