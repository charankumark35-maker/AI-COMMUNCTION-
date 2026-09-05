import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProfile } from "../services/api";
import { saveToken, removeToken, isAuthenticated } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking initial auth

  // Fetch current user from /auth/profile
  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) { setLoading(false); return; }
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = (token) => {
    saveToken(token);
    fetchUser();          // immediately hydrate user state
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
