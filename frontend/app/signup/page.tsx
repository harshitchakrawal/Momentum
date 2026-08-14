'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { api, API_BASE_URL } from '@/lib/api'

const GITHUB_LOGIN_URL = `${API_BASE_URL}/api/auth/github/`

export default function Signup() {
  const router = useRouter()

  const [step, setStep] = useState<'email' | 'otp' | 'username'>('email')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/send-otp/', { email })
      setStep('otp')
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || 'Could not send OTP'
        )
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/verify-otp/', {
        email,
        otp,
      })

      const data = response.data

      if (data.user_exists) {
        // TODO:
        // Save access and refresh tokens here.

        router.push('/dashboard')
      } else {
        setStep('username')
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || 'Invalid OTP'
        )
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUsername(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/create-username/', {
        email,
        username,
      })

      const data = response.data

      // TODO:
      // Save access and refresh tokens here.

      router.push('/dashboard')
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(
          err.response.data.message ||
            'Could not create username'
        )
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* ================= EMAIL STEP ================= */}

      {step === 'email' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center mb-6">
            <span className="text-white text-sm font-semibold">
              M
            </span>
          </div>

          <h1 className="text-white text-2xl font-semibold tracking-tight text-center">
            Create your account
          </h1>

          <p className="text-[#666] text-sm mt-2 mb-8 text-center">
            Sign up to start tracking your progress.
          </p>

          <form
            onSubmit={handleSendOTP}
            className="w-full flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0d0d0d] border border-[#222] text-white text-sm py-3 px-4 rounded-md placeholder:text-[#555] focus:outline-none focus:border-[#444]"
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#e5e5e5] hover:bg-white text-[#0a0a0a] text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Continue with Email'}
            </button>
          </form>

          <div className="w-full flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#222]" />
            <span className="text-[#444] text-xs">or</span>
            <div className="flex-1 h-px bg-[#222]" />
          </div>

          <a
            href={GITHUB_LOGIN_URL}
            className="w-full flex items-center justify-center gap-3 bg-transparent hover:bg-[#111] border border-[#222] text-white text-sm font-medium py-3 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22 0 0 1.005-.322 3.3 1.23 0 0 1.005-.322 3.3 1.23 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          <p className="mt-6 text-xs text-[#333] text-center max-w-xs leading-relaxed">
            By creating an account you agree to our{' '}
            <a
              href="#"
              className="text-[#555] hover:text-[#aaa]"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-[#555] hover:text-[#aaa]"
            >
              Privacy Policy
            </a>
            .
          </p>

          <p className="mt-5 text-sm text-[#444] text-center">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-[#888] hover:text-white transition-colors font-medium"
            >
              Log in
            </a>
          </p>
        </div>
      )}

      {/* ================= OTP STEP ================= */}

      {step === 'otp' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center mb-6">
            <span className="text-white text-sm font-semibold">
              M
            </span>
          </div>

          <h1 className="text-white text-2xl font-semibold tracking-tight text-center">
            Check your email
          </h1>

          <p className="text-[#666] text-sm mt-2 mb-8 text-center">
            We sent a verification code to{' '}
            <span className="text-[#aaa]">{email}</span>
          </p>

          <form
            onSubmit={handleVerifyOtp}
            className="w-full flex flex-col gap-3"
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="bg-[#0d0d0d] border border-[#222] text-white text-sm py-3 px-4 rounded-md placeholder:text-[#555] focus:outline-none focus:border-[#444] text-center tracking-[0.3em]"
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="bg-[#e5e5e5] hover:bg-white text-[#0a0a0a] text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setOtp('')
              setError('')
              setStep('email')
            }}
            className="mt-5 text-sm text-[#666] hover:text-white transition-colors"
          >
            Use a different email
          </button>
        </div>
      )}

      {/* ================= USERNAME STEP ================= */}

      {step === 'username' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center mb-6">
            <span className="text-white text-sm font-semibold">
              M
            </span>
          </div>

          <h1 className="text-white text-2xl font-semibold tracking-tight text-center">
            Choose your username
          </h1>

          <p className="text-[#666] text-sm mt-2 mb-8 text-center">
            Your email is verified. Now choose a username for
            your Momentum account.
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
              className="bg-[#0d0d0d] border border-[#222] text-white text-sm py-3 px-4 rounded-md placeholder:text-[#555] focus:outline-none focus:border-[#444]"
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#e5e5e5] hover:bg-white text-[#0a0a0a] text-sm font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}