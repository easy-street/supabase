import { useEffect } from 'react'
import Router from 'next/router'
import useSWR from 'swr'

import { supabase } from '@/lib/supabase'

export function useUser({ redirectTo, redirectIfFound } = {}) {
  const { data, error, mutate } = useSWR('/api/user')
  const user = data?.user ?? null
  const finished = Boolean(data)
  const hasUser = Boolean(user)

  useEffect(() => {
    const isHandlingAuthCallback = window.location.hash.startsWith('#access_token=')

    if (!redirectTo || !finished) return
    if (!hasUser && !isHandlingAuthCallback && supabase.auth.session()) {
      // destroy the in-memory session to sync logged-in status locally
      supabase.auth.signOut()
    }
    if (
      // If redirectTo is set, redirect if the user was not found unless handling callback.
      (redirectTo && !redirectIfFound && !hasUser && !isHandlingAuthCallback) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasUser])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // when auth state changes, ensure the session cookie is in sync
      await fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
      }).then((response) => response.json())

      // with the cookie now synced, revalidate the user
      mutate(session?.user ?? null)
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [mutate])

  return error ? null : user
}
