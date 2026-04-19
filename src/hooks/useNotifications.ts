import { useQuery } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function useNotifications() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const auth = localStorage.getItem('icecast_auth');
      const r = await fetch(`${API}/service-requests`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      const d = await r.json();
      const requests = d.requests || [];
      const pending = requests.filter((r: any) =>
        r.status === 'pending' || r.status === 'pending_payment'
      );
      return {
        count: pending.length,
        items: pending.slice(0, 5)
      };
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });

  return {
    count: data?.count ?? 0,
    items: data?.items ?? []
  };
}
