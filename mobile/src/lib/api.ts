import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export type ResourceState<T> = {
  data: T | null;
  error: string | null;
  errorCode: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

async function readResponse<T>(response: Response) {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The household request could not be completed.");
  }
  return body;
}

export function useHouseholdMutation() {
  const { getToken } = useAuth();

  return useCallback(
    async (
      path: `/api/${string}`,
      body: Record<string, unknown>,
      method: "PATCH" | "POST" | "DELETE" = "PATCH",
    ) => {
      if (!apiUrl) throw new Error("The app service has not been configured.");
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");

      const response = await fetch(`${apiUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return readResponse<{ success: true }>(response);
    },
    [getToken],
  );
}

export function useApiResource<T>(path: `/api/v1/${string}`): ResourceState<T> {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(!isLoaded);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      if (!apiUrl) throw new Error("The app service has not been configured.");
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");

      const response = await fetch(`${apiUrl}${path}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = (await response.json()) as T & ApiErrorBody;
      if (!response.ok) {
        setErrorCode(body.error?.code ?? "unexpected_error");
        throw new Error(body.error?.message ?? "We could not load this household.");
      }
      setData(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn, path]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, errorCode, loading, refresh };
}

export function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
