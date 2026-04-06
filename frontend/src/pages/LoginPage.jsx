import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import {
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from 'react-icons/hi'

const features = [
  {
    icon: HiOutlineClipboardList,
    title: 'Task Management',
    description: 'Track onboarding tasks with priorities and deadlines',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Document Upload',
    description: 'Securely upload and submit required documents',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Progress Tracking',
    description: 'Monitor your onboarding progress in real-time',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Secure Access',
    description: 'Enterprise-grade security with Google OAuth',
  },
]

/**
 * Premium login page with animated features and Google sign-in.
 */
export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/10 -top-20 -left-20 animate-pulse" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 bottom-10 right-10" style={{ animation: 'pulse 3s infinite 1s' }} />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white/5 top-1/2 left-1/3" style={{ animation: 'pulse 4s infinite 2s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Employee<br />Onboarding<br />
              <span className="text-primary-200">Portal</span>
            </h1>
            <p className="mt-4 text-primary-200/80 text-lg max-w-md">
              Streamline your employee onboarding process with an intuitive, modern platform.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <feature.icon className="w-6 h-6 text-primary-200 mb-2" />
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="text-xs text-primary-200/60 mt-1 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-dark-bg">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Portal</h1>
          </div>

          {/* Login card */}
          <div className="glass-card p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sign in to access your onboarding dashboard
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-200 dark:border-dark-border rounded-2xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-border transition-all duration-200 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed group"
              id="google-login-button"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-dark-card text-gray-400 uppercase tracking-wider font-medium">
                  Secure login
                </span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-1.5 text-xs">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span>Firebase Auth</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-xs text-gray-400">
            By signing in, you agree to the Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
