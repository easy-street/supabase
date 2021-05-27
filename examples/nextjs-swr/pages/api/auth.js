import { supabase } from '@/lib/supabase'

export default function auth(req, res) {
  supabase.auth.api.setAuthCookie(req, res)
}
