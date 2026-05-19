"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  loginRequired: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleLoginRequired: () => void;
}

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "jemboet";

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  username: null,
  loginRequired: true,
  login: () => false,
  logout: () => {},
  toggleLoginRequired: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dracin_auth");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.username === ADMIN_USERNAME) {
          setIsLoggedIn(true);
          setUsername(data.username);
        }
      } catch {}
    }
    const reqSetting = localStorage.getItem("dracin_login_required");
    if (reqSetting !== null) {
      setLoginRequired(reqSetting === "true");
    }
  }, []);

  const login = (user: string, pass: string): boolean => {
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setUsername(user);
      localStorage.setItem("dracin_auth", JSON.stringify({ username: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    localStorage.removeItem("dracin_auth");
  };

  const toggleLoginRequired = () => {
    const next = !loginRequired;
    setLoginRequired(next);
    localStorage.setItem("dracin_login_required", String(next));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, loginRequired, login, logout, toggleLoginRequired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
