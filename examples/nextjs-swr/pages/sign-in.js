import { useUser } from '@/hooks/use-user'
import { Auth } from '@/components/Auth'

export default function SignInPage() {
  // Redirect when user is authenticated
  useUser({ redirectTo: '/', redirectIfFound: true })

  return <Auth />
}
