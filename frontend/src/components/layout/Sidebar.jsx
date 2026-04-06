import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineSparkles,
} from 'react-icons/hi'

/**
 * Sidebar navigation with role-based menu items.
 * Shows different links for Admin vs Employee.
 */
export default function Sidebar() {
  const { isAdmin } = useAuth()

  const navItems = [
    {
      to: '/dashboard',
      icon: HiOutlineViewGrid,
      label: 'Dashboard',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      to: '/tasks',
      icon: HiOutlineClipboardList,
      label: 'Tasks',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      to: '/documents',
      icon: HiOutlineDocumentText,
      label: 'Documents',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-dark-card border-r border-gray-200/50 dark:border-dark-border/50 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200/50 dark:border-dark-border/50">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <HiOutlineSparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Onboard</h1>
          <p className="text-[10px] uppercase tracking-widest text-primary-500 font-semibold">Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role badge at bottom */}
      <div className="p-4 border-t border-gray-200/50 dark:border-dark-border/50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-bg">
          <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {isAdmin ? 'Administrator' : 'Employee'}
          </span>
        </div>
      </div>
    </aside>
  )
}
