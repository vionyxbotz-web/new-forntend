import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createAuthenticatedClient } from '@/lib/apiClient';

/**
 * Hook to get authenticated API client
 * Automatically includes JWT token in all requests
 */
export function useApiClient() {
  const { token } = useAuth();
  
  const client = useMemo(() => {
    return createAuthenticatedClient(token);
  }, [token]);
  
  return client;
}
