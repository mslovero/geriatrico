import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { get, post } from "@/api/api";
import type { AuthContextValue, AuthUser, LoginResponse } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
        } else {
          try {
            const fetched = await get<AuthUser>("/user");
            if (fetched) setUser(fetched);
          } catch (error) {
            console.error("Auth init error:", error);
            await logout();
          }
        }
      }
      setLoading(false);
    };
    void initAuth();
  }, [token, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await post<LoginResponse>("/login", { email, password });
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
};
