import Link from 'next/link'
import useSWR from 'swr'
import { Auth, Card, Typography, Space, Button, Icon } from '@supabase/ui'
import { supabase } from '../utils/initSupabase'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

class AuthTransactions {
  constructor() {
    this.storageKey = 'authTransactions'
  }

  add(txKey, authTransaction) {
    const authTransactionStore = this.getAuthTransactionStore()
    this.setAuthTransactionStore(
      JSON.stringify({ ...authTransactionStore, [txKey]: authTransaction })
    )
  }

  get(txKey) {
    return this.getAuthTransactionStore()[txKey]
  }

  getAuthTransactionStore() {
    return JSON.parse(localStorage.getItem(this.storageKey)) ?? {}
  }

  remove(txKey) {
    if (txKey) {
      const { [txKey]: _, ...authTransactionStore } = this.getAuthTransactionStore()
      this.setAuthTransactionStore(JSON.stringify(authTransactionStore))
    }
  }

  setAuthTransactionStore(authTransactionStore) {
    localStorage.setItem(this.storageKey, authTransactionStore)
  }
}

const authTransactions = new AuthTransactions()
const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  return isMounted
}
const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json())

const Index = () => {
  const { user, session } = Auth.useUser()
  const { data, error } = useSWR(session ? ['/api/getUser', session.access_token] : null, fetcher)
  const [authView, setAuthView] = useState('sign_in')
  const router = useRouter()
  const isMounted = useIsMounted()
  const authTransaction = useMemo(() => {
    if (!isMounted) return

    // get the stored auth transaction with key matching the `state` query param
    return authTransactions.get(new URLSearchParams(window.location.search).get('state'))
  }, [isMounted])
  const shouldRedirectPostLogin = Boolean(authTransaction) // false if `state` query param does not match stored `nonce`
  const handlePostLoginRedirect = useCallback(() => {
    const { postLoginRedirectTo } = authTransaction ?? {}
    if (postLoginRedirectTo) {
      router.replace(postLoginRedirectTo)
    }
  }, [authTransaction])

  useEffect(() => {
    let authListener

    if (!authListener)
      authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') setAuthView('forgotten_password')
        if (event === 'USER_UPDATED') setTimeout(() => setAuthView('sign_in'), 1000)
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        await fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json())

        if (event === 'SIGNED_IN') {
          // auth cookie will be available now in `getServerSideProps`
          handlePostLoginRedirect()
        }
      }).data

    return () => {
      if (authListener) authListener.unsubscribe()
    }
  }, [handlePostLoginRedirect])

  useEffect(() => {
    authTransactions.remove(router.query.state)
  }, [router])

  const handleProviderLogin = async (provider) => {
    // generate an unguessable nonce
    const nonce = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16)

    // store the post-login redirect path with the nonce
    authTransactions.add(nonce, { postLoginRedirectTo: '/profile' })

    // include the nonce as a query parameter in the URL provided to `redirectTo`
    const { user, error } = await supabase.auth.signIn(
      { provider },
      {
        redirectTo: `http://localhost:3000/?state=${nonce}`,
      }
    )
    console.log('from client side ==> ', { user, error })
  }

  const View = () => {
    if (!user || shouldRedirectPostLogin)
      return (
        <Space direction="vertical" size={8}>
          <div>
            <img src="https://app.supabase.io/img/supabase-dark.svg" width="96" />
            <Typography.Title level={3}>Welcome to Supabase Auth</Typography.Title>
          </div>

          {isMounted &&
            (shouldRedirectPostLogin ? (
              <Typography.Text>Signing in...</Typography.Text>
            ) : (
              <>
                <Auth supabaseClient={supabase} view={authView} />
                <button onClick={() => handleProviderLogin('github')}>GitHub</button>
              </>
            ))}
        </Space>
      )

    return (
      <Space direction="vertical" size={6}>
        {authView === 'forgotten_password' && <Auth.UpdatePassword supabaseClient={supabase} />}
        {user && (
          <>
            <Typography.Text>You're signed in</Typography.Text>
            <Typography.Text strong>Email: {user.email}</Typography.Text>

            <Button
              icon={<Icon type="LogOut" />}
              type="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Log out
            </Button>
            {error && <Typography.Text type="danger">Failed to fetch user!</Typography.Text>}
            {data && !error ? (
              <>
                <Typography.Text type="success">
                  User data retrieved server-side (in API route):
                </Typography.Text>

                <Typography.Text>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </Typography.Text>
              </>
            ) : (
              <div>Loading...</div>
            )}

            <Typography.Text>
              <Link href="/profile">
                <a>SSR example with getServerSideProps</a>
              </Link>
            </Typography.Text>
          </>
        )}
      </Space>
    )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <Card>
        <View />
      </Card>
    </div>
  )
}

export default Index
