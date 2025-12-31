import { supabase } from '@/integrations/supabase/client';

/**
 * Make the current user an admin.
 * This should only be called once during initial setup.
 * In production, you would remove this and manage admins through the admin dashboard.
 */
export async function makeCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user logged in');
    return false;
  }

  // Check if already admin
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (existingRole) {
    console.log('User is already an admin');
    return true;
  }

  // Add admin role
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: user.id, role: 'admin' });

  if (error) {
    console.error('Error making user admin:', error);
    return false;
  }

  console.log('Successfully made user an admin');
  return true;
}

/**
 * Check if any admin exists in the system
 */
export async function hasAnyAdmin(): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  return (data?.length || 0) > 0;
}
