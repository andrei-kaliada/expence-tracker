import type { HealthResponse } from '@expense/shared';
import { api } from '@/lib/api';

export default async function HomePage() {
  let status = 'unreachable';
  try {
    status = (await api<HealthResponse>('/health')).status;
  } catch {}

  return (
    <main>
      <h1>Expense Tracker</h1>
      <p>API status: {status}</p>
    </main>
  );
}
