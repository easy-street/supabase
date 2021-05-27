import { Auth } from '@supabase/ui'

import { supabase } from '@/lib/supabase'
import { Layout } from '@/components/Layout'
import '@/styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Auth.UserContextProvider>
  )
}

export default MyApp
