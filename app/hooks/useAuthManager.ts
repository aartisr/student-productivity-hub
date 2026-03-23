import { useCallback, useEffect, useState } from "react";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import type { ClientSafeProvider } from "next-auth/react";
import type { ViewKey } from "../domain";

function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/api/auth")) return "/";
  return raw;
}

type UseAuthManagerArgs = {
  setAuthMsg: (value: string) => void;
  setView: (value: ViewKey) => void;
};

export function useAuthManager(args: UseAuthManagerArgs) {
  const { setAuthMsg, setView } = args;
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<ClientSafeProvider[]>([]);
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [loginPendingProviderId, setLoginPendingProviderId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProviders = async () => {
      const allProviders = await getProviders();
      if (!mounted || !allProviders) return;
      setProviders(Object.values(allProviders));
    };
    void loadProviders();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(sanitizeCallbackUrl(params.get("returnTo")));
  }, []);

  const login = useCallback(
    async (providerId: string) => {
      setAuthMsg(`Redirecting to ${providerId}...`);
      setLoginPendingProviderId(providerId);
      await signIn(providerId, { callbackUrl });
    },
    [callbackUrl, setAuthMsg],
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setView("auth");
    setAuthMsg("Signed out.");
  }, [setAuthMsg, setView]);

  return {
    session,
    role: session?.user?.role || "student",
    sessionStatus: status,
    providers,
    loginPendingProviderId,
    login,
    logout,
  };
}
