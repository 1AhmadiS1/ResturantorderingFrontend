import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { queryClient } from "../../lib/queryClient";
import { authStorage } from "../../lib/authStorage";
import { getCurrentUser, loginRequest } from "./authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(authStorage.getAccessToken()));

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    queryClient.clear();
  }, []);

  const loadUser = useCallback(async () => {
    if (!authStorage.getAccessToken()) {
      setIsLoading(false);
      return null;
    }
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
    window.addEventListener("restohub:session-expired", logout);
    return () => window.removeEventListener("restohub:session-expired", logout);
  }, [loadUser, logout]);

  const login = useCallback(async (credentials) => {
    const tokens = await loginRequest(credentials);
    authStorage.setTokens(tokens);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      authStorage.clear();
      throw error;
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, isAuthenticated: Boolean(user), login, logout, refreshUser: loadUser }), [user, isLoading, login, logout, loadUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

