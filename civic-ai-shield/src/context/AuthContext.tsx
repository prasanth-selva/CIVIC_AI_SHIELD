import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "ADMIN" | "OPERATOR" | "VIEWER";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  disabled?: boolean;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

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
        setUser(profile);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: "Unable to sign in. Please try again." };
      } finally {
        setLoading(false);
      }
    },
    [fetchMe]
  );

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
        setUser(profile);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [fetchMe, logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
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
