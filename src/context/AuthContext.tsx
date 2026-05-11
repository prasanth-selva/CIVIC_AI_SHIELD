import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "COMMANDER" | "STRATEGIC_OPS" | "FIELD_CONTROL" | "ANALYST" | "OBSERVER";

export type OperatorProfile = {
  rank: string;
  clearance: number; // 1-5
  missionStatus: string;
  efficiency: number; // 0-100
  threatScore: number;
  opsHistory: string[];
  callsign: string;
  neuralLinkStatus: "STABLE" | "SYNCING" | "OFFLINE";
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  profile: OperatorProfile;
  disabled?: boolean;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResult>;
  logout: () => void;
  setProfileStatus: (status: "STABLE" | "SYNCING" | "OFFLINE") => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

import { API_BASE } from "../config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (accessToken: string) => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    return (await response.json()) as AuthUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("civic_ai_token");
  }, []);

  const generateMockProfile = (role: Role, name: string): OperatorProfile => {
    const roles: Record<Role, Partial<OperatorProfile>> = {
      COMMANDER: { rank: "GENERAL_OF_GRID", clearance: 5, callsign: "ARCHON_01" },
      STRATEGIC_OPS: { rank: "COLONEL_TACTICAL", clearance: 4, callsign: "SENTINEL_ALPHA" },
      FIELD_CONTROL: { rank: "MAJOR_OVERSEER", clearance: 3, callsign: "STRIKE_EYE" },
      ANALYST: { rank: "CHIEF_INTELLIGENCE", clearance: 2, callsign: "PATTERN_GHOST" },
      OBSERVER: { rank: "GUEST_RECON", clearance: 1, callsign: "NEURAL_GUEST" },
    };

    return {
      rank: roles[role]?.rank || "UNKNOWN",
      clearance: roles[role]?.clearance || 0,
      missionStatus: "ACTIVE_MONITORING",
      efficiency: 94.2,
      threatScore: 0.02,
      opsHistory: ["OP_SILENT_STORM", "OP_CYBER_SHIELD"],
      callsign: roles[role]?.callsign || "UNIDENTIFIED",
      neuralLinkStatus: "STABLE",
    };
  };

  const login = useCallback(
    async (email: string, password: string, remember = false): Promise<LoginResult> => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return { ok: false, error: "Invalid email or password." };
        }

        const data = (await response.json()) as { access_token: string };
        setToken(data.access_token);
        if (remember) {
          localStorage.setItem("civic_ai_token", data.access_token);
        } else {
          localStorage.removeItem("civic_ai_token");
        }

        const profile = await fetchMe(data.access_token);
        
        // Enhance with tactical profile if not present
        const roleMapping: Record<string, Role> = {
          "ADMIN": "COMMANDER",
          "OPERATOR": "STRATEGIC_OPS",
          "VIEWER": "OBSERVER"
        };
        
        const tacticalUser: AuthUser = {
          ...profile,
          role: roleMapping[profile.role as string] || "OBSERVER",
          profile: generateMockProfile(roleMapping[profile.role as string] || "OBSERVER", profile.full_name)
        };
        
        setUser(tacticalUser);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: "Unable to sign in. Please try again." };
      } finally {
        setLoading(false);
      }
    },
    [fetchMe]
  );

  const setProfileStatus = useCallback((status: "STABLE" | "SYNCING" | "OFFLINE") => {
    setUser(prev => prev ? ({
      ...prev,
      profile: { ...prev.profile, neuralLinkStatus: status }
    }) : null);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = localStorage.getItem("civic_ai_token");
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        setToken(stored);
        const profile = await fetchMe(stored);
        
        const roleMapping: Record<string, Role> = {
          "ADMIN": "COMMANDER",
          "OPERATOR": "STRATEGIC_OPS",
          "VIEWER": "OBSERVER"
        };
        
        const tacticalUser: AuthUser = {
          ...profile,
          role: roleMapping[profile.role as string] || "OBSERVER",
          profile: generateMockProfile(roleMapping[profile.role as string] || "OBSERVER", profile.full_name)
        };
        
        setUser(tacticalUser);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [fetchMe, logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, setProfileStatus }),
    [user, token, loading, login, logout, setProfileStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
