import { Client, Local } from "../client";

/**
 * Create API client with Authorization header
 */
export function createAuthenticatedClient(token: string | null) {
  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || Local;
  
  const client = new Client(baseUrl, {
    requestInit: {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : undefined
    }
  });
  
  return client;
}

/**
 * Get token from localStorage/sessionStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * Create authenticated API client from stored token
 */
export function createStoredAuthClient() {
  const token = getStoredToken();
  return createAuthenticatedClient(token);
}
