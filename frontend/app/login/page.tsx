const GITHUB_LOGIN_URL = 'http://localhost:3001/auth/github';

export default function Login() {
  return (
    <main className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center px-4">
    

      {/* Heading */}
      <h1 className="text-[#F7F8F8] text-xl font-semibold mb-8 tracking-tight">
        Log in to Momentum
      </h1>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Primary — GitHub */}
        <a
          href={GITHUB_LOGIN_URL}
          className="flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold py-3 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </a>

        {/* Secondary buttons */}
        <button className="flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/8 text-[#F7F8F8] text-sm font-medium py-3 rounded-full transition-colors">
          Continue with email
        </button>

        <button className="flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/8 text-[#F7F8F8] text-sm font-medium py-3 rounded-full transition-colors">
          Continue with SSO
        </button>

        <button className="flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/8 text-[#F7F8F8] text-sm font-medium py-3 rounded-full transition-colors">
          Log in with passkey
        </button>
      </div>

      {/* Footer text */}
      <p className="mt-8 text-sm text-[#555]">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-[#F7F8F8] hover:underline">Sign up</a>
        {' '}or{' '}
        <a href="/" className="text-[#F7F8F8] hover:underline">learn more</a>
      </p>
    </main>
  );
}
