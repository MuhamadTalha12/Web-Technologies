import { api } from '@/lib/api';

/**
 * Make the current user an admin.
 * This should only be called once during initial setup.
 * In production, you would remove this and manage admins through the admin dashboard.
 */
export async function makeCurrentUserAdmin(): Promise<boolean> {
  try {
    const me = await api<{ user: { id: string } }>('/auth/me', { method: 'GET' });
    await api(`/admin/users/${me.user.id}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role: 'admin' }),
    });
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}

/**
 * Check if any admin exists in the system
 */
export async function hasAnyAdmin(): Promise<boolean> {
  try {
    const data = await api<{ items: Array<{ roles: string[] }> }>('/admin/users', { method: 'GET' });
    return (data.items || []).some((u) => (u.roles || []).includes('admin'));
  } catch {
    return false;
  }
}
