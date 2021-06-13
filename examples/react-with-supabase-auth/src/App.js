import { useEffect, useState } from 'react'
import { Auth, Button, Card, Icon, Space, Typography } from '@supabase/ui'

import { supabase } from './supabaseClient'

function Main() {
  const { user } = Auth.useUser()
  const [authView, setAuthView] = useState('sign_in')

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setAuthView('forgotten_password')
      if (event === 'USER_UPDATED') setTimeout(() => setAuthView('sign_in'), 1000)
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [])

  const View = () => {
    if (!user)
      return (
        <Space direction="vertical" size={8}>
          <div>
            <img src="https://app.supabase.io/img/supabase-dark.svg" width="96" />
            <Typography.Title level={3}>Welcome to Supabase Auth</Typography.Title>
          </div>
          <Auth supabaseClient={supabase} view={authView} />
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

export default function App() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Main />
    </Auth.UserContextProvider>
  )
}
