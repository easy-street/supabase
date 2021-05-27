import { supabase } from '@/lib/supabase'

async function fetchAllPageviews() {
  const { data, error } = await supabase
    .from('pageviews')
    .select()
    .order('inserted_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function insertPageview(req) {
  const ip = req.headers['x-real-ip']
  const { data, error } = await supabase
    .from('pageviews')
    .insert({
      ...(ip && {
        ip: ip
          .split('.')
          .map((segment, i) => (i < 2 ? segment : 'xxx'))
          .join('.'),
      }),
    })
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

const handlers = {
  GET: fetchAllPageviews,
  POST: insertPageview,
}

export default async function pageviews(req, res) {
  try {
    res.json(await handlers[req.method](req))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
