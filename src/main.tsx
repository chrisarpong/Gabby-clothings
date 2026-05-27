/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_bXV0dWFsLXN0aW5ncmF5LTkzLmNsZXJrLmFjY291bnRzLmRldiQ";
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Forcing the Prod URL temporarily to rule out Vercel Env Var issues
const CONVEX_URL = "https://silent-albatross-823.convex.cloud";
const convex = new ConvexReactClient(CONVEX_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
