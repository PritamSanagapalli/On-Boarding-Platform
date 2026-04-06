import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { HiOutlineSun, HiOutlineMoon, HiOutlineLogout, HiOutlineBell } from 'react-icons/hi'

/**
 * Top navigation bar with user profile, dark mode toggle, and logout.
 */
export default function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-dark-border/50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page title area */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
            Employee Onboarding Portal
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications bell (placeholder) */}
          <button
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            title="Notifications"
          >
            <HiOutlineBell className="w-5 h-5" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            id="dark-mode-toggle"
          >
            {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>

          {/* User profile */}
          {user && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200 dark:border-dark-border">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role === 'ADMIN' ? '🛡️ Admin' : '👤 Employee'}
                </p>
              </div>
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff`}
                alt={user.name}
                className="w-9 h-9 rounded-full ring-2 ring-primary-500/20"
              />
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Logout"
                id="logout-button"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
