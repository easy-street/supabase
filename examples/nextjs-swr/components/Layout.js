import Head from 'next/head'

import styles from '@/styles/Layout.module.css'

export function Layout(props) {
  return (
    <>
      <Head>
        <title>Supabase with SWR</title>
        <meta name="description" content="Supabase with SWR" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>{props.children}</main>
    </>
  )
}
