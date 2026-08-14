'use client'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { api, API_BASE_URL } from '@/lib/api'

const GITHUB_LOGIN_URL = `${API_BASE_URL}/api/auth/github/`

export default function Login() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/login/', { email, password })
      router.push('/dashboard')
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const firstError = Object.values(err.response.data)[0]
        const message = Array.isArray(firstError) ? firstError[0] : String(firstError)
        setError(message)
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
      setLoading(false)
    }
  }

  
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {setOtp == true ? (<div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center mb-6">
          <span className="text-white text-sm font-semibold">M</span>
        </div>

        <h1 className="text-white text-2xl font-semibold tracking-tight text-center">
          Sign in to Momentum
        </h1>
        <p className="text-[#666] text-sm mt-2 mb-8 text-center">
          Log in to your account to continue.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            placeholder="name@work-email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0d0d0d] border border-[#222] text-white text-sm py-3 px-4 rounded-md placeholder:text-[#555] focus:outline-none focus:border-[#444]"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e5e5e5] hover:bg-white text-[#0a0a0a] text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Continue with Email'}
          </button>
        </form>

        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-[#444] text-xs">or</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <div className="w-full flex flex-col gap-3">

          <a
            href={GITHUB_LOGIN_URL}
            className="flex items-center justify-center gap-3 bg-transparent hover:bg-[#111] border border-[#222] text-white text-sm font-medium py-3 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          <button
            type="button"
            disabled
            title="Google sign-in is coming soon"
            className="flex items-center justify-center gap-3 bg-transparent border border-[#222] text-[#555] text-sm font-medium py-3 rounded-md opacity-50 cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-sm text-[#444] text-center">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-[#888] hover:text-white transition-colors font-medium">Sign up</a>
        </p>
      </div>) :(

      )}
    </main>
  )
}
