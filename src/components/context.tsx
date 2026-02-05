import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { connection } from "next/server";
import { Suspense } from "react";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "@/app/api/uploadthing/core";
import { AuthProvider } from "./auth/provider";
import { ThemeProvider } from "./theme/provider";
import { Toaster } from "./ui/sonner";

async function UTSSR() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />;
}

export const AppContext = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" enableSystem>
        {children}
        <Suspense fallback={null}>
          <UTSSR />
        </Suspense>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
};
