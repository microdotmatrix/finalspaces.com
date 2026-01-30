import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your FinalSpaces",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* App shell header will be added here */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
