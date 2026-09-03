'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { api, API_BASE_URL } from '@/lib/api'
import {
  OtpInput,
  type OtpInputHandle,
  type OtpStatus,
} from '@/components/ui/otp-input'
import { Timer } from 'lucide-react'

const GITHUB_LOGIN_URL = `${API_BASE_URL}/api/auth/github/`

export type AuthMode = 'login' | 'signup'


const COPY = {
  login: {
    title: 'Sign in to Momentum',
    subtitle: 'Log in to your account to continue.',
    otpSubtitle: 'We sent a sign-in code to',
    otpSuccess: 'Signed in.',
    sending: 'Sending code...',
    showTerms: false,
    footerQuestion: "Don't have an account?",
    footerAction: 'Sign up',
    footerHref: '/signup',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up to start tracking your progress.',
    otpSubtitle: 'We sent a verification code to',
    otpSuccess: 'Code verified.',
    sending: 'Sending code...',
    showTerms: true,
    footerQuestion: 'Already have an account?',
    footerAction: 'Log in',
    footerHref: '/login',
  },
} as const

function Logo() {
  return (
    <Image
      src="/momentum_logo.jpg"
      alt="Momentum"
      width={48}
      height={48}
      priority
      className="w-12 h-12 rounded-full border border-line-strong object-cover mb-6"
    />
  )
}

export default function AuthFlow({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const copy = COPY[mode]

  const [step, setStep] = useState<'email' | 'otp' | 'username'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otpField = useRef<OtpInputHandle>(null)
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle')
  const [notice, setNotice] = useState('')
  const [resendIn, setResendIn] = useState(0)

  // Countdown for the resend cooldown.
  useEffect(()=>{
    if (resendIn <= 0) return
    const timer = setTimeout(() => {
      setResendIn((seconds) =>(seconds - 1))
    }, 1000);
    return () => clearTimeout(timer) 
  },[resendIn])
  
  useEffect(() => {
    api.get('/auth/me/', { skipAuthRefresh: true })
      .then(() => router.replace('/dashboard'))
      .catch(() => {})
  }, [router])

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/send-otp/', { email })
      setStep('otp')
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Could not send OTP')
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(code: string) {
    if (loading) return

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/verify-otp/', {
        email,
        otp: code,
      })

      const data = response.data

      setOtpStatus('success')

      if (data.user_exists) {
        router.replace('/dashboard')
      } else {
        setStep('username')
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'That code is not right.')
      } else {
        setError('Could not reach the server.')
      }

      setOtpStatus('error')
      otpField.current?.clear()
    } finally {
      setLoading(false)
    }
  }

  function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    verifyOtp(otp)
  }

  async function handleResend() {
    if (resendIn > 0 || loading) return

    setError('')
    setOtpStatus('idle')
    setLoading(true)

    try {
      await api.post('/auth/send-otp/', { email })
      // The old code is dead the moment a new one is issued.
      otpField.current?.clear()
      setOtp('')
      setNotice('A new code is on its way.')
      setResendIn(60)
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        // 429 carries the backend's own "too many codes" wording.
        setError(err.response.data.message || 'Could not resend the code')
      } else {
        setError('Could not reach the server.')
      }
      setOtpStatus('error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUsername(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/create-username/', { email, username })
      router.push('/dashboard')
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Could not create username')
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center px-4">
      {/* ================= EMAIL STEP ================= */}

      {step === 'email' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <Logo />

          <h1 className="text-ink text-2xl font-semibold tracking-tight text-center">
            {copy.title}
          </h1>

          <p className="text-ink-3 text-sm mt-2 mb-8 text-center">
            {copy.subtitle}
          </p>

          <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="name@work-email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface border border-line text-ink text-sm py-3 px-4 rounded-md placeholder:text-ink-4 focus:outline-none focus:border-line-strong"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-invert hover:bg-invert/90 text-invert-ink text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? copy.sending : 'Continue with Email'}
            </button>
          </form>

          <div className="w-full flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line-strong" />
            <span className="text-ink-4 text-xs">or</span>
            <div className="flex-1 h-px bg-line-strong" />
          </div>

          <div className="w-full flex flex-col gap-3">
            <a
              href={GITHUB_LOGIN_URL}
              className="flex items-center justify-center gap-3 bg-transparent hover:bg-ink/6 border border-line text-ink text-sm font-medium py-3 rounded-md transition-colors"
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
              className="flex items-center justify-center gap-3 bg-transparent border border-line text-ink-4 text-sm font-medium py-3 rounded-md opacity-50 cursor-not-allowed"
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

          {copy.showTerms && (
            <p className="mt-6 text-xs text-ink-4 text-center max-w-xs leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="text-ink-4 hover:text-ink-2">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-ink-4 hover:text-ink-2">
                Privacy Policy
              </a>
              .
            </p>
          )}

          <p className="mt-5 text-sm text-ink-4 text-center">
            {copy.footerQuestion}{' '}
            <a
              href={copy.footerHref}
              className="text-ink-3 hover:text-ink transition-colors font-medium"
            >
              {copy.footerAction}
            </a>
          </p>
        </div>
      )}

      {/* ================= OTP STEP ================= */}

      {step === 'otp' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <Logo />

          <h1 className="text-ink text-2xl font-semibold tracking-tight text-center">
            Check your email
          </h1>

          <p className="text-ink-3 text-sm mt-2 mb-8 text-center">
            {copy.otpSubtitle} <span className="text-ink-2">{email}</span>
          </p>

          <form
            onSubmit={handleVerifyOtp}
            className="w-full flex flex-col items-center gap-5"
          >
            <OtpInput
              ref={otpField}
              autoFocus
              disabled={loading}
              status={otpStatus}
              hint="Paste or type the 6-digit code."
              errorMessage={error}
              successMessage={copy.otpSuccess}
              label="Verification code"
              onChange={(value) => {
                setOtp(value)
                if (value.length > 0) {
                  setOtpStatus('idle')
                  setError('')
                  setNotice('')
                }
              }}
              onComplete={verifyOtp}
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-invert hover:bg-invert/90 text-invert-ink text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2">
            <p className="text-sm text-ink-3">
              Didn&apos;t get it?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0 || loading}
                className="font-medium text-ink-3 hover:text-ink transition-colors disabled:text-ink-4 disabled:hover:text-ink-4 disabled:cursor-not-allowed"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </button>
            </p>

            {notice && <p className="text-xs text-emerald-400">{notice}</p>}

            <button
              type="button"
              onClick={() => {
                setOtp('')
                setError('')
                setNotice('')
                setResendIn(0)
                setOtpStatus('idle')
                setStep('email')
              }}
              className="text-sm text-ink-3 hover:text-ink transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      )}

      {/* ================= USERNAME STEP ================= */}

      {step === 'username' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <Logo />

          <h1 className="text-ink text-2xl font-semibold tracking-tight text-center">
            Choose your username
          </h1>

          <p className="text-ink-3 text-sm mt-2 mb-8 text-center">
            Your email is verified. Now choose a username for your Momentum
            account.
          </p>

          <form
            onSubmit={handleCreateUsername}
            className="w-full flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              className="bg-surface border border-line text-ink text-sm py-3 px-4 rounded-md placeholder:text-ink-4 focus:outline-none focus:border-line-strong"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-invert hover:bg-invert/90 text-invert-ink text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
