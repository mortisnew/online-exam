
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { UserProfile } from "../types/auth";
import { getProfile } from "../services/api";

type AuthUser = Pick<
  UserProfile,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "rules"
  | "avatar"
  | "user_code"
>;

type ProfileResponse = {
  profile: AuthUser;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  login: (profile: ProfileResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const access = localStorage.getItem("access");

      if (!access) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        setUser(response.profile);
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  function login(profile: ProfileResponse) {
    setUser(profile.profile);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
