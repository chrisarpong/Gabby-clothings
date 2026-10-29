import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { FunctionReference, FunctionReturnType } from 'convex/server';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';

type StaffRole = 'ceo' | 'admin' | 'designer' | 'sales';

interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  totpEnabled?: boolean;
}

interface StaffAuthContextType {
  token: string | null;
  profile: StaffProfile | null | undefined; // undefined = loading, null = unauthenticated
  login: (email: string, pass: string) => Promise<{ status: string; token: string }>;
  changePassword: (pass: string) => Promise<{ status: string; token: string }>;
  setup2FA: () => Promise<{ secret: string; uri: string }>;
  verify2FA: (token: string, code: string, isSetup?: boolean) => Promise<{ status: string; token: string; recoveryCodes?: string[] }>;
  logout: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('staffToken'));
  const navigate = useNavigate();

  // Why sessionStorage? To survive page reloads but expire when the tab is fully closed.
  // We explicitly avoid localStorage so cross-tab session reuse is prevented unless explicitly desired.
  // It mitigates certain token-stealing XSS attacks if they don't have time to execute before tab close.

  const profile = useQuery(api.staffAuth.getStaffProfile, token ? { staffToken: token } : 'skip');
  const loginAction = useAction(api.staffAuthNode.loginAction);
  const changePassAction = useAction(api.staffAuthNode.changePasswordAction);
  const setup2faAction = useAction(api.staffAuthNode.setup2FA);
  const verify2faAction = useAction(api.staffAuthNode.verify2FA);
  const logoutMutation = useMutation(api.staffAuth.logout);

  const clearPosStorage = () => {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('pos_')) sessionStorage.removeItem(key);
    }
  };

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('staffToken', token);
    } else {
      sessionStorage.removeItem('staffToken');
      clearPosStorage();
    }
  }, [token]);

  useEffect(() => {
    if (token && profile === null) {
      clearPosStorage();
      setToken(null);
    }
  }, [token, profile]);

  const login = async (email: string, pass: string) => {
    const res = await loginAction({ email, password: pass });
    if (res.status === 'success') {
      setToken(res.token);
    }
    return res;
  };

  const changePassword = async (pass: string) => {
    if (!token) throw new Error("No session");
    const res = await changePassAction({ staffToken: token, newPassword: pass });
    // We already have the token in state, but the server also returns it
    if (res.status === 'success') {
      setToken(res.token);
    }
    return res;
  };

  const setup2FA = async () => {
    if (!token) throw new Error("No session");
    return await setup2faAction({ staffToken: token });
  };

  const verify2FA = async (challengeTokenOrSessionToken: string, code: string, isSetup?: boolean) => {
    const res = await verify2faAction({ token: challengeTokenOrSessionToken, code, isSetup });
    if (res && res.status === 'success') {
      setToken(res.token);
    }
    return res;
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutMutation({ staffToken: token });
      } catch (e) {
        console.error(e);
      }
    }
    clearPosStorage();
    setToken(null);
    navigate('/staff/login');
  };

  return (
    <StaffAuthContext.Provider value={{ token, profile, login, changePassword, setup2FA, verify2FA, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}

export function useStaffQuery<Query extends FunctionReference<"query", "public">>(queryFunc: Query, args?: any): FunctionReturnType<Query> | undefined {
  const { token } = useStaffAuth();
  if (!token || args === 'skip') {
    return (useQuery as any)(queryFunc, 'skip');
  }
  return useQuery(queryFunc, { ...args, staffToken: token }) as any;
}

export function useStaffMutation<Mutation extends FunctionReference<"mutation", "public">>(mutationFunc: Mutation): (args?: any) => Promise<FunctionReturnType<Mutation>> {
  const { token } = useStaffAuth();
  const mutate = useMutation(mutationFunc);
  return (args?: any) => mutate({ ...args, staffToken: token }) as any;
}

export function useStaffAction<Action extends FunctionReference<"action", "public">>(actionFunc: Action): (args?: any) => Promise<FunctionReturnType<Action>> {
  const { token } = useStaffAuth();
  const act = useAction(actionFunc);
  return (args?: any) => act({ ...args, staffToken: token }) as any;
}
