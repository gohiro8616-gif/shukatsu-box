import { AppLayout } from "@/components/layout/app-layout";

export default function EmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
