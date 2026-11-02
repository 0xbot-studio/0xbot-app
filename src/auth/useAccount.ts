import { useCallback, useEffect, useState } from "react";
import { api, result, type User } from "../api/client";
export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.GET("/v1/auth/me");
      if (res.response.status === 401) {
        setUser(null);
      } else {
        setUser(result(res));
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  const logout = async () => {
    result(await api.POST("/v1/auth/logout"));
    setUser(null);
  };
  return { user, loading, error, reload, logout };
}
