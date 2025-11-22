import { createContext, useContext, useState, useEffect } from "react";
import { post, get } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        get("/user")
          .then((res) => setUser(res))
          .catch(() => logout());
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await post("/login", { email, password });
      const newToken = res.access_token;
      setToken(newToken);
      setUser(res.user);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
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
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
