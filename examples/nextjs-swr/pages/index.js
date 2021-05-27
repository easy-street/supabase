import { Button } from '@supabase/ui'

import { useUser } from '@/hooks/use-user'
import { supabase } from '@/lib/supabase'
import { Pageviews } from '@/components/Pageviews'
import styles from '@/styles/Home.module.css'

export default function HomePage() {
  // Redirect when user is unauthenticated
  const user = useUser({ redirectTo: '/sign-in' })

  function handleSignOut() {
    supabase.auth.signOut()
  }

  return user ? (
    <>
      <h3 className={styles.title}>Welcome {user?.email}</h3>
      <Button onClick={handleSignOut} type="text">
        SIGN OUT
      </Button>
      <hr className={styles.divider} />
      <Pageviews />
    </>
  ) : null
}
