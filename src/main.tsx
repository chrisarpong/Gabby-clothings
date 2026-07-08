/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ThemeProvider } from './components/ThemeProvider';
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Forcing the Prod URL temporarily to rule out Vercel Env Var issues
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("Missing VITE_CONVEX_URL");
}
const convex = new ConvexReactClient(CONVEX_URL as string);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider defaultTheme="system" storageKey="gabby-ui-theme">
          <App />
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
