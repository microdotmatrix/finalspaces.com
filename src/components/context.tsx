import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./theme/provider";
import { Toaster } from "./ui/sonner";

export const AppContext = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <ThemeProvider defaultTheme="light" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
};
