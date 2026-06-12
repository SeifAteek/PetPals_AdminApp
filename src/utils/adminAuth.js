import { supabase } from '../supabaseClient'

export async function fetchAdminProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, user_name, email, user_type')
    .eq('user_id', userId)
    .single()

  if (error) return { profile: null, error: error.message }
  if (data?.user_type !== 'Admin') {
    return {
      profile: null,
      error: 'This portal is restricted to Admin accounts. Contact support to upgrade your profile.',
    }
  }
  return { profile: data, error: null }
}
