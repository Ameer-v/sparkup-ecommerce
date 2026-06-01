"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;

  name: string;

  email: string;

  role?: {
    name: string;
  };
};

type AuthContextType = {
  user: User | null;

  token: string | null;

  login: (
    token: string,
    user?: User
  ) => Promise<void>;

  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(
      () => {
        if (
          typeof window ===
          "undefined"
        ) {
          return null;
        }

        return localStorage.getItem(
          "sparkup-token"
        );
      }
    );

  const fetchProfile = useCallback(
    async (token: string) => {

      try {

        const res = await fetch(
          "/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data =
          await res.json();

        setUser(data);

        localStorage.setItem(
          "sparkup-user",
          JSON.stringify(data)
        );

      } catch (error) {

        console.error(error);
      }
    },
    []
  );

  useEffect(() => {

    const storedUser =
      localStorage.getItem(
        "sparkup-user"
      );

    if (storedUser) {

      setUser(
        JSON.parse(storedUser)
      );
    }

    if (token) {

      const timeoutId =
        window.setTimeout(() => {
          fetchProfile(token);
        }, 0);

      return () =>
        window.clearTimeout(
          timeoutId
        );
    }

  }, [fetchProfile, token]);

  async function login(
    nextToken: string,
    nextUser?: User
  ) {

    localStorage.setItem(
      "sparkup-token",
      nextToken
    );

    setToken(nextToken);

    if (nextUser) {

      setUser(nextUser);

      localStorage.setItem(
        "sparkup-user",
        JSON.stringify(nextUser)
      );

      return;
    }

    await fetchProfile(nextToken);
  }

  function logout() {

    localStorage.removeItem(
      "sparkup-token"
    );

    localStorage.removeItem(
      "sparkup-user"
    );

    setUser(null);

    setToken(null);

    window.location.href = "/";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}