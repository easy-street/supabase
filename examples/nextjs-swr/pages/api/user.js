import { supabase } from '@/lib/supabase'

async function fetchUser(accessToken) {
  if (!accessToken) {
    return null
  }

  const { user } = await supabase.auth.api.getUser(accessToken)

  return user
}

export default async function user(req, res) {
  res.status(200).json({
    user: await fetchUser(req.cookies[supabase.auth.api.cookieOptions.name]),
  })
}
