import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your FinalSpaces",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {children}
      </main>
    </div>
  );
}
