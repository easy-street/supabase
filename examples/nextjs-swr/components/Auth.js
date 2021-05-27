import { Auth as SupabaseAuth, Card, Space } from '@supabase/ui'

import { supabase } from '@/lib/supabase'

export function Auth(props) {
  return (
    <Card>
      <Space direction="vertical" size={8}>
        <SupabaseAuth supabaseClient={supabase} view={props.view} />
      </Space>
    </Card>
  )
}
