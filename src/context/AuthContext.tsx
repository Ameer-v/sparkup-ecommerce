"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Role = {
  id?: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sparkup-token");
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sparkup-user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User) {
  localStorage.setItem("sparkup-user", JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem("sparkup-token");
  localStorage.removeItem("sparkup-user");
}

function normaliseUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  // Unwrap common response envelopes: { user: {...} }, { data: { user: {...} } }, or flat
  const data =
    (r.user as Record<string, unknown>) ??
    ((r.data as Record<string, unknown>)?.user as Record<string, unknown>) ??
    (r.data as Record<string, unknown>) ??
    r;

  if (!data.id && !data.email) return null;

  let role: Role | undefined;

  if (data.role) {
    if (typeof data.role === "string") {
      role = { name: data.role };
    } else if (typeof data.role === "object") {
      const rv = data.role as Record<string, unknown>;
      role = { name: String(rv.name ?? ""), id: rv.id as string | undefined };
    }
  }

  if (!role && data.roleName) {
    role = { name: String(data.roleName) };
  }

  return {
    id: String(data.id ?? ""),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    phone: data.phone ? String(data.phone) : undefined,
    address: data.address ? String(data.address) : undefined,
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(!!readStoredToken());

  const fetchProfile = useCallback(async (tkn: string): Promise<User | null> => {
    try {
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${tkn}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = await res.json();
      return normaliseUser(json);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchProfile(token).then((freshUser) => {
      if (cancelled) return;
      if (freshUser) {
        setUser(freshUser);
        persistUser(freshUser);
      } else {
        clearStorage();
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(nextToken: string, partialUser?: User) {
    localStorage.setItem("sparkup-token", nextToken);
    setToken(nextToken);

    if (partialUser) {
      const normalised = normaliseUser(partialUser) ?? partialUser;
      setUser(normalised);
      persistUser(normalised);
    }

    setIsLoading(true);
    const freshUser = await fetchProfile(nextToken);
    setIsLoading(false);

    if (freshUser) {
      setUser(freshUser);
      persistUser(freshUser);
    }
  }

  function logout() {
    clearStorage();
    setUser(null);
    setToken(null);
    window.location.href = "/";
  }

  const isAdmin = user?.role?.name?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}