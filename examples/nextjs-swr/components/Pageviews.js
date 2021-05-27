import { useCallback, useEffect } from 'react'
import { Alert, Button, Space } from '@supabase/ui'
import useSWR from 'swr'

const PAGEVIEWS_ENDPOINT = '/api/pageviews'

export function Pageviews() {
  const { data: pageviews = [], mutate } = useSWR(PAGEVIEWS_ENDPOINT)
  const addPageview = useCallback(async function addPageview() {
    mutate([
      ...pageviews,
      await fetch(PAGEVIEWS_ENDPOINT, { method: 'POST' }).then((r) => r.json()),
    ])
  }, [])

  useEffect(() => {
    addPageview()
  }, [addPageview])

  return (
    <>
      <Button onClick={addPageview}>Add pageview</Button>
      <h4>Pageviews</h4>
      <Space direction="vertical" size={4}>
        {pageviews.map(({ id, inserted_at, ip }) => (
          <Alert key={id} title={ip}>
            {new Date(inserted_at).toLocaleString()}
          </Alert>
        ))}
      </Space>
    </>
  )
}
