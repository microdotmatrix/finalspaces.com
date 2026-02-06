import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import type React from "react";
import { Suspense } from "react";

type ClerkProviderProps = React.ComponentProps<typeof ClerkProvider>;

export const AuthProvider = ({ children, appearance }: ClerkProviderProps) => {
  return (
    <Suspense fallback={null}>
      <ClerkProvider
        appearance={{
          theme: shadcn,
          ...appearance,
        }}
      >
        {children}
      </ClerkProvider>
    </Suspense>
  );
};
